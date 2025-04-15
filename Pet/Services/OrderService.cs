using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Dtos.Order;
using Pet.Models;
using Pet.Services.IServices;
using Stripe;
using Stripe.Climate;

namespace Pet.Services
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;

        public OrderService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Kiểm tra trạng thái user
        private async Task CheckUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new KeyNotFoundException($"User with ID {userId} not found.");

            var localTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var localNow = TimeZoneInfo.ConvertTimeFromUtc(DateTimeOffset.UtcNow.UtcDateTime, localTimeZone);
            if (user.LockoutEnabled && user.LockoutEnd.HasValue && user.LockoutEnd > localNow)
                throw new UnauthorizedAccessException("Your account is currently locked. Please try again later or contact support.");
        }

        // Xem danh sách đơn hàng
        public async Task<List<OrderDto>> GetAllOrdersAsync(int userId, string role)
        {
            await CheckUserAsync(userId);

            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails).ThenInclude(od => od.Variant).ThenInclude(v => v.Product)
                .Include(o => o.OrderDetails).ThenInclude(od => od.Variant).ThenInclude(v => v.VariantValues).ThenInclude(vv => vv.Value)
                .AsQueryable();

            if (role == "Customer") query = query.Where(o => o.UserId == userId);

            var orders = await query.ToListAsync();

            return orders.Select(o => new OrderDto
            {
                Id = o.Id,
                DateCreated = o.DateCreated,
                CoinEarned = o.CoinEarned,
                TotalPrice = o.TotalPrice,
                Status = o.Status.ToString(),
                CancelReason = o.CancelReason.ToString(),
                UserId = o.UserId,
                UserName = o.User.Name,
                ShippingId = o.ShippingId,
                PaymentId = o.PaymentId,
                OrderDetails = o.OrderDetails.Select(od => new OrderDetailDto
                {
                    Id = od.Id,
                    Quantity = od.Quantity,
                    Price = od.Price,
                    OrderId = od.OrderId,
                    VariantId = od.VariantId,
                    VariantName = $"{od.Variant.Product.Name} ({string.Join(", ", od.Variant.VariantValues.Select(vv => vv.Value.Name))})"
                }).ToList()
            }).ToList();
        }

        // Xem chi tiết đơn hàng
        public async Task<OrderDto> GetOrderByIdAsync(int id, int userId, string role)
        {
            await CheckUserAsync(userId);

            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails).ThenInclude(od => od.Variant).ThenInclude(v => v.Product)
                .Include(o => o.OrderDetails).ThenInclude(od => od.Variant).ThenInclude(v => v.VariantValues).ThenInclude(vv => vv.Value)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) throw new KeyNotFoundException($"Order with ID {id} not found.");

            if (role == "Customer" && order.UserId != userId) throw new InvalidOperationException("You do not have permission to view this order.");

            return new OrderDto
            {
                Id = order.Id,
                DateCreated = order.DateCreated,
                CoinEarned = order.CoinEarned,
                TotalPrice = order.TotalPrice,
                Status = order.Status.ToString(),
                CancelReason = order.CancelReason.ToString(),
                UserId = order.UserId,
                UserName = order.User?.Name ?? "N/A",
                ShippingId = order.ShippingId,
                PaymentId = order.PaymentId,
                OrderDetails = order.OrderDetails?.Select(od => new OrderDetailDto
                {
                    Id = od.Id,
                    Quantity = od.Quantity,
                    Price = od.Price,
                    OrderId = od.OrderId,
                    VariantId = od.VariantId,
                    VariantName = od.Variant != null && od.Variant.Product != null
                        ? $"{od.Variant.Product.Name} ({(od.Variant.VariantValues != null && od.Variant.VariantValues.Any() ? string.Join(", ", od.Variant.VariantValues.Select(vv => vv.Value?.Name ?? "N/A")) : "No Variant Values")})"
                        : "N/A"
                }).ToList() ?? new List<OrderDetailDto>()
            };
        }

        // Tạo đơn hàng từ giỏ hàng (Checkout)
        public async Task<OrderDto> CreateOrderAsync(int userId, CreateOrderDto createOrderDto)
        {
            // Kiểm tra dữ liệu đầu vào
            if (createOrderDto == null) throw new ArgumentNullException(nameof(createOrderDto), "Order creation data cannot be empty.");

            if (createOrderDto.CartItemIds == null || !createOrderDto.CartItemIds.Any())
                throw new ArgumentException("Cart Item list cannot be empty.", nameof(createOrderDto.CartItemIds));

            if (string.IsNullOrEmpty(createOrderDto.PaymentMethod) || !Enum.TryParse<Models.PaymentMethod>(createOrderDto.PaymentMethod, true, out var paymentMethod))
                throw new ArgumentException("Invalid payment method.", nameof(createOrderDto.PaymentMethod));

            // Lấy user
            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new KeyNotFoundException($"User with ID {userId} not found.");

            var localTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var localNow = TimeZoneInfo.ConvertTimeFromUtc(DateTimeOffset.UtcNow.UtcDateTime, localTimeZone);
            if (user.LockoutEnabled && user.LockoutEnd.HasValue && user.LockoutEnd > localNow)
                throw new UnauthorizedAccessException("Your account is currently locked. Please try again later or contact support.");

            // Lấy các CartItem được chọn, bao gồm Variant, Product và VariantValues
            var cartItems = await _context.CartItems
                .Include(ci => ci.Variant).ThenInclude(v => v.Product)
                .Include(ci => ci.Variant).ThenInclude(v => v.VariantValues).ThenInclude(vv => vv.Value)
                .Where(ci => createOrderDto.CartItemIds.Contains(ci.Id) && ci.Cart.UserId == userId)
                .ToListAsync();

            if (cartItems == null || !cartItems.Any()) throw new InvalidDataException("No products were found in your cart. Please check again.");

            // Kiểm tra shipping
            var shipping = await _context.Shippings.FindAsync(createOrderDto.ShippingId);
            if (shipping == null) throw new KeyNotFoundException($"Shipping with ID {createOrderDto.ShippingId} not found.");

            // Kiểm tra Variant và Product
            foreach (var ci in cartItems)
            {
                if (ci.Variant == null) throw new KeyNotFoundException($"Variant with ID {ci.VariantId} not found.");
                if (ci.Variant.Product == null) throw new KeyNotFoundException($"Variation related products with ID {ci.VariantId} not found.");
            }

            // Tạo Order trước
            var order = new Pet.Models.Order
            {
                UserId = userId,
                DateCreated = DateTime.UtcNow,
                Status = OrderStatus.Pending,
                ShippingId = createOrderDto.ShippingId,
                OrderDetails = cartItems.Select(ci => new OrderDetail
                {
                    Quantity = ci.Quantity,
                    VariantId = ci.VariantId,
                    Variant = ci.Variant,
                    Price = ci.Quantity * (ci.Variant.AdditionalFee + ci.Variant.Product.Price)
                }).ToList()
            };

            // Tính tổng giá và loyalty coins
            order.Shipping = shipping;
            order.User = user;
            order.CalculateTotalPrice();
            order.ApplyLoyaltyCoins(createOrderDto.UseLoyaltyCoins); // Tính CoinEarned

            // Lưu Order vào database để có OrderId hợp lệ
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Tạo Payment sau khi đã có OrderId
            var payment = new Payment
            {
                Amount = order.TotalPrice,
                DateCreated = DateTime.UtcNow,
                IsSuccessful = false,
                Method = paymentMethod,
                OrderId = order.Id,
                TransactionId = null
            };

            // Xử lý thanh toán Stripe
            string clientSecret = null;
            if (paymentMethod == Models.PaymentMethod.Stripe)
            {
                if (string.IsNullOrEmpty(StripeConfiguration.ApiKey)) throw new InvalidOperationException("Stripe API Key is not configured.");

                var options = new PaymentIntentCreateOptions
                {
                    Amount = (long)order.TotalPrice,
                    Currency = "vnd",
                    Description = $"Payment for Order #{order.Id}",
                    AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                    {
                        Enabled = true,
                    },
                };
                var service = new PaymentIntentService();
                var paymentIntent = await service.CreateAsync(options);
                payment.TransactionId = paymentIntent.Id;
                clientSecret = paymentIntent.ClientSecret;
            }

            // Lưu Payment vào database trước để có PaymentId hợp lệ
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            // Gán PaymentId cho Order sau khi Payment đã được lưu
            order.PaymentId = payment.Id;
            await _context.SaveChangesAsync();

            // Xóa các CartItem đã được checkout
            _context.CartItems.RemoveRange(cartItems);
            await _context.SaveChangesAsync();

            // Trả về OrderDto, bao gồm ClientSecret nếu là Stripe
            return new OrderDto
            {
                Id = order.Id,
                DateCreated = order.DateCreated,
                CoinEarned = order.CoinEarned,
                TotalPrice = order.TotalPrice,
                Status = order.Status.ToString(),
                CancelReason = order.CancelReason.ToString(),
                UserId = order.UserId,
                UserName = user.Name,
                ShippingId = order.ShippingId,
                PaymentId = order.PaymentId,
                ClientSecret = clientSecret,
                OrderDetails = order.OrderDetails?.Select(od => new OrderDetailDto
                {
                    Id = od.Id,
                    Quantity = od.Quantity,
                    Price = od.Price,
                    OrderId = od.OrderId,
                    VariantId = od.VariantId,
                    VariantName = od.Variant != null && od.Variant.Product != null
                        ? $"{od.Variant.Product.Name} ({(od.Variant.VariantValues != null ? string.Join(", ", od.Variant.VariantValues.Select(vv => vv.Value?.Name ?? "N/A")) : "N/A")})"
                        : "N/A"
                }).ToList() ?? new List<OrderDetailDto>()
            };
        }

        // Hủy đơn hàng
        public async Task<OrderDto> CancelOrderAsync(int id, CancelOrderDto cancelOrderDto, int userId)
        {
            await CheckUserAsync(userId);

            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails).ThenInclude(od => od.Variant).ThenInclude(v => v.Product)
                .Include(o => o.OrderDetails).ThenInclude(od => od.Variant).ThenInclude(v => v.VariantValues).ThenInclude(vv => vv.Value)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) throw new KeyNotFoundException($"Order with ID {id} not found.");

            if (order.UserId != userId) throw new InvalidOperationException("You do not have permission to cancel this order.");

            if (order.Status != OrderStatus.Pending) throw new InvalidOperationException("You can only cancel orders that are in pending status.");

            if (!Enum.TryParse<CancelReason>(cancelOrderDto.CancelReason, true, out var cancelReason))
                throw new InvalidOperationException("The cancellation reason is invalid.");

            order.Status = OrderStatus.Cancelled;
            order.CancelReason = cancelReason;
            await _context.SaveChangesAsync();

            return new OrderDto
            {
                Id = order.Id,
                DateCreated = order.DateCreated,
                CoinEarned = order.CoinEarned,
                TotalPrice = order.TotalPrice,
                Status = order.Status.ToString(),
                CancelReason = order.CancelReason.ToString(),
                UserId = order.UserId,
                UserName = order.User.Name,
                ShippingId = order.ShippingId,
                PaymentId = order.PaymentId,
                OrderDetails = order.OrderDetails.Select(od => new OrderDetailDto
                {
                    Id = od.Id,
                    Quantity = od.Quantity,
                    Price = od.Price,
                    OrderId = od.OrderId,
                    VariantId = od.VariantId,
                    VariantName = $"{od.Variant.Product.Name} ({string.Join(", ", od.Variant.VariantValues.Select(vv => vv.Value.Name))})"
                }).ToList()
            };
        }

        // Cập nhật trạng thái đơn hàng
        public async Task<OrderDto> UpdateOrderStatusAsync(int id, UpdateOrderDto updateOrderDto, int userId, string role)
        {
            await CheckUserAsync(userId);

            if (role != "Admin") throw new InvalidOperationException("Only users with admin role can update order status.");

            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails).ThenInclude(od => od.Variant).ThenInclude(v => v.Product)
                .Include(o => o.OrderDetails).ThenInclude(od => od.Variant).ThenInclude(v => v.VariantValues).ThenInclude(vv => vv.Value)
                .Include(o => o.Payment)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) throw new KeyNotFoundException($"Order with ID {id} not found.");

            if (!Enum.TryParse<OrderStatus>(updateOrderDto.Status, true, out var newStatus)) throw new InvalidOperationException("Invalid order status.");

            order.Status = newStatus;
            order.ApplyLoyaltyCoins(false); // Gọi ApplyLoyaltyCoins để cập nhật CoinEarned và LoyaltyCoins

            if (order.Status == OrderStatus.Received)
            {
                if (order.Payment != null && order.Payment.Method == Models.PaymentMethod.Cash)
                {
                    order.Payment.IsSuccessful = true; // Cập nhật IsSuccessful cho Cash
                    order.Payment.DateConfirmed = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            return new OrderDto
            {
                Id = order.Id,
                DateCreated = order.DateCreated,
                CoinEarned = order.CoinEarned,
                TotalPrice = order.TotalPrice,
                Status = order.Status.ToString(),
                CancelReason = order.CancelReason.ToString(),
                UserId = order.UserId,
                UserName = order.User.Name,
                ShippingId = order.ShippingId,
                PaymentId = order.PaymentId,
                OrderDetails = order.OrderDetails.Select(od => new OrderDetailDto
                {
                    Id = od.Id,
                    Quantity = od.Quantity,
                    Price = od.Price,
                    OrderId = od.OrderId,
                    VariantId = od.VariantId,
                    VariantName = $"{od.Variant.Product.Name} ({string.Join(", ", od.Variant.VariantValues.Select(vv => vv.Value.Name))})"
                }).ToList()
            };
        }

        // Xóa đơn hàng
        public async Task DeleteOrderAsync(int id, int userId, string role)
        {
            await CheckUserAsync(userId);

            if (role != "Admin") throw new InvalidOperationException("Only users with admin role can update order status.");

            var order = await _context.Orders.FindAsync(id);
            if (order == null) throw new KeyNotFoundException($"Order with ID {id} not found.");

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
        }

    }
}
