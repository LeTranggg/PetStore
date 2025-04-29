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
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public OrderService(ApplicationDbContext context, IEmailService emailService, IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
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

        // Xem trước đơn hàng khi tạo
        public async Task<SimulateOrderDto> SimulateOrderAsync(int userId, CreateOrderDto createOrderDto)
        {
            if (createOrderDto == null) throw new ArgumentNullException(nameof(createOrderDto), "Order simulation data cannot be empty.");
            if (createOrderDto.CartItemIds == null || !createOrderDto.CartItemIds.Any())
                throw new ArgumentException("Cart Item list cannot be empty.", nameof(createOrderDto.CartItemIds));

            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new KeyNotFoundException($"User with ID {userId} not found.");

            var cartItems = await _context.CartItems
                .Include(ci => ci.Variant).ThenInclude(v => v.Product)
                .Include(ci => ci.Variant).ThenInclude(v => v.VariantValues).ThenInclude(vv => vv.Value)
                .Where(ci => createOrderDto.CartItemIds.Contains(ci.Id) && ci.Cart.UserId == userId)
                .ToListAsync();

            if (cartItems == null || !cartItems.Any()) throw new InvalidDataException("No products were found in your cart. Please check again.");

            var shipping = await _context.Shippings.FindAsync(createOrderDto.ShippingId);
            if (shipping == null) throw new KeyNotFoundException($"Shipping with ID {createOrderDto.ShippingId} not found.");

            foreach (var ci in cartItems)
            {
                if (ci.Variant == null) throw new KeyNotFoundException($"Variant with ID {ci.VariantId} not found.");
                if (ci.Variant.Product == null) throw new KeyNotFoundException($"Variation related products with ID {ci.VariantId} not found.");
            }

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

            order.Shipping = shipping;
            order.User = user;
            order.CalculateTotalPrice();
            order.ApplyLoyaltyCoins(createOrderDto.UseLoyaltyCoins);

            return new SimulateOrderDto
            {
                Subtotal = order.Subtotal,
                ShippingCost = order.ShippingCost,
                TotalPrice = order.TotalPrice,
                CoinEarned = order.CoinsEarned
            };
        }

        // Xem danh sách đơn hàng
        public async Task<List<OrderDto>> GetAllOrdersAsync(int userId, string role)
        {
            await CheckUserAsync(userId);

            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails).ThenInclude(od => od.Variant).ThenInclude(v => v.Product)
                .Include(o => o.OrderDetails).ThenInclude(od => od.Variant).ThenInclude(v => v.VariantValues).ThenInclude(vv => vv.Value)
                .Include(o => o.User)
                .AsQueryable();

            if (role == "Customer") query = query.Where(o => o.UserId == userId);

            var orders = await query.ToListAsync();

            return orders.Select(o => new OrderDto
            {
                Id = o.Id,
                DateCreated = o.DateCreated,
                CoinsEarned = o.CoinsEarned,
                LoyaltyCoinsSpent = o.LoyaltyCoinsSpent,
                Subtotal = o.Subtotal,
                ShippingCost = o.ShippingCost,
                TotalPrice = o.TotalPrice,
                Status = o.Status.ToString(),
                CancelReason = o.CancelReason.ToString(),
                UserId = o.UserId,
                UserName = o.User.Email,
                ShippingId = o.ShippingId,
                PaymentId = o.PaymentId,
                OrderDetails = o.OrderDetails.Select(od => new OrderDetailDto
                {
                    Id = od.Id,
                    Quantity = od.Quantity,
                    Price = od.Price,
                    OrderId = od.OrderId,
                    VariantId = od.VariantId,
                    VariantName = $"{od.Variant?.Product?.Name ?? "N/A"} ({string.Join(", ", od.Variant?.VariantValues?.Select(vv => vv.Value?.Name ?? "N/A") ?? new List<string> { "N/A" })})",
                    Image = od.Variant.Image
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
                CoinsEarned = order.CoinsEarned,
                LoyaltyCoinsSpent = order.LoyaltyCoinsSpent,
                Subtotal = order.Subtotal,
                ShippingCost = order.ShippingCost,
                TotalPrice = order.TotalPrice,
                Status = order.Status.ToString(),
                CancelReason = order.CancelReason.ToString(),
                UserId = order.UserId,
                UserName = order.User?.Email ?? "N/A",
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
            order.ApplyLoyaltyCoins(createOrderDto.UseLoyaltyCoins);

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
                CoinsEarned = order.CoinsEarned,
                LoyaltyCoinsSpent = order.LoyaltyCoinsSpent,
                Subtotal = order.Subtotal,
                ShippingCost = order.ShippingCost,
                TotalPrice = order.TotalPrice,
                Status = order.Status.ToString(),
                CancelReason = order.CancelReason.ToString(),
                UserId = order.UserId,
                UserName = user.Email,
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

            // Hoàn loyalty coins nếu nó được dùng
            if (order.LoyaltyCoinsSpent > 0)
            {
                order.User.LoyaltyCoins += order.LoyaltyCoinsSpent;
                _context.Users.Update(order.User);
            }
            order.Status = OrderStatus.Cancelled;
            order.CancelReason = cancelReason;

            await _context.SaveChangesAsync();

            // Gửi email thông báo đến email hỗ trợ
            var supportEmail = _configuration["Smtp:Username"];
            if (string.IsNullOrEmpty(supportEmail))
                throw new InvalidOperationException("SMTP Username not configured in appsettings.json");
            await _emailService.SendEmailAsync(
                to: supportEmail,
                subject: $"Order Cancellation Notification - Order #{order.Id}",
                body: $"Order #{order.Id} has been cancelled by user {order.User.Email}. Reason: {order.CancelReason}."
            );

            return new OrderDto
            {
                Id = order.Id,
                DateCreated = order.DateCreated,
                CoinsEarned = order.CoinsEarned,
                LoyaltyCoinsSpent = order.LoyaltyCoinsSpent,
                Subtotal = order.Subtotal,
                ShippingCost = order.ShippingCost,
                TotalPrice = order.TotalPrice,
                Status = order.Status.ToString(),
                CancelReason = order.CancelReason.ToString(),
                UserId = order.UserId,
                UserName = order.User.Email,
                ShippingId = order.ShippingId,
                PaymentId = order.PaymentId,
                OrderDetails = order.OrderDetails.Select(od => new OrderDetailDto
                {
                    Id = od.Id,
                    Quantity = od.Quantity,
                    Price = od.Price,
                    OrderId = od.OrderId,
                    VariantId = od.VariantId,
                    VariantName = $"{od.Variant?.Product?.Name ?? "N/A"} ({string.Join(", ", od.Variant?.VariantValues?.Select(vv => vv.Value?.Name ?? "N/A") ?? new List<string> { "N/A" })})"
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

            // If the new status is Cancelled, refund loyalty coins
            if (newStatus == OrderStatus.Cancelled)
            {
                if (order.LoyaltyCoinsSpent > 0)
                {
                    order.User.LoyaltyCoins += order.LoyaltyCoinsSpent;
                    _context.Users.Update(order.User);
                }
            }

            // Nếu trạng thái mới là Received, giảm số lượng variant
            if (newStatus == OrderStatus.Received && order.Status != OrderStatus.Received)
            {
                foreach (var orderDetail in order.OrderDetails)
                {
                    if (orderDetail.Variant != null)
                    {
                        if (orderDetail.Variant.Quantity < orderDetail.Quantity)
                        {
                            throw new InvalidOperationException($"Not enough stock for variant ID {orderDetail.VariantId}. Available: {orderDetail.Variant.Quantity}, Requested: {orderDetail.Quantity}");
                        }
                        orderDetail.Variant.Quantity -= orderDetail.Quantity;
                        _context.Variants.Update(orderDetail.Variant);
                    }
                }
            }

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

            var result = await _context.SaveChangesAsync();

            // Gửi email thông báo đến user sở hữu đơn hàng
            if (result > 0 && !string.IsNullOrEmpty(order.User.Email))
            {
                await _emailService.SendEmailAsync(
                    to: order.User.Email,
                    subject: $"Order #{order.Id} Status Updated",
                    body: $"Your order #{order.Id} has been updated to status: {order.Status}.\nUpdated at: {DateTime.UtcNow.ToString("dd/MM/yyyy HH:mm:ss")}."
                );
            }

            return new OrderDto
            {
                Id = order.Id,
                DateCreated = order.DateCreated,
                CoinsEarned = order.CoinsEarned,
                LoyaltyCoinsSpent = order.LoyaltyCoinsSpent,
                Subtotal = order.Subtotal,
                ShippingCost = order.ShippingCost,
                TotalPrice = order.TotalPrice,
                Status = order.Status.ToString(),
                CancelReason = order.CancelReason.ToString(),
                UserId = order.UserId,
                UserName = order.User.Email,
                ShippingId = order.ShippingId,
                PaymentId = order.PaymentId,
                OrderDetails = order.OrderDetails.Select(od => new OrderDetailDto
                {
                    Id = od.Id,
                    Quantity = od.Quantity,
                    Price = od.Price,
                    OrderId = od.OrderId,
                    VariantId = od.VariantId,
                    VariantName = $"{od.Variant?.Product?.Name ?? "N/A"} ({string.Join(", ", od.Variant?.VariantValues?.Select(vv => vv.Value?.Name ?? "N/A") ?? new List<string> { "N/A" })})"
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
