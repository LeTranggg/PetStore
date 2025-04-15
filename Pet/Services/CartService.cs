using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Dtos.Cart;
using Pet.Models;
using Pet.Services.IServices;

namespace Pet.Services
{
    public class CartService : ICartService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public CartService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
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

        // Xem cart của người dùng
        public async Task<CartDto> GetCartByUserIdAsync(int userId)
        {
            await CheckUserAsync(userId);

            var cart = await _context.Carts
                .Include(c => c.CartItems).ThenInclude(ci => ci.Variant).ThenInclude(v => v.Product)
                .Include(c => c.CartItems).ThenInclude(ci => ci.Variant).ThenInclude(v => v.VariantValues).ThenInclude(vv => vv.Value)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null) throw new KeyNotFoundException($"Cart for user ID {userId} not found.");

            return _mapper.Map<CartDto>(cart);
        }

        // Xem chi tiết cartItem
        public async Task<CartItemDto> GetCartItemByIdAsync(int cartItemId)
        {
            var cartItem = await _context.CartItems
                .Include(ci => ci.Variant).ThenInclude(v => v.Product)
                .Include(ci => ci.Variant).ThenInclude(v => v.VariantValues).ThenInclude(vv => vv.Value)
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId);

            if (cartItem == null) throw new KeyNotFoundException($"CartItem with ID {cartItemId} not found.");

            // Kiểm tra trạng thái user
            var cart = await _context.Carts.FirstOrDefaultAsync(c => c.Id == cartItem.CartId);
            if (cart == null) throw new KeyNotFoundException($"Cart for CartItem ID {cartItemId} not found.");

            // Kiểm tra cart.UserId có giá trị hay không
            if (!cart.UserId.HasValue)
                throw new InvalidOperationException($"Cart with ID {cart.Id} is not associated with any user.");

            await CheckUserAsync(cart.UserId.Value);

            return _mapper.Map<CartItemDto>(cartItem);
        }

        // Thêm vào giỏ hàng
        public async Task<CartDto> AddToCartAsync(AddToCartDto addToCartDto)
        {
            try
            {
                // Kiểm tra trạng thái user
                await CheckUserAsync(addToCartDto.UserId);

                // Kiểm tra Variant tồn tại
                var variant = await _context.Variants
                    .Include(v => v.Product)
                    .Include(v => v.VariantValues).ThenInclude(vv => vv.Value)
                    .FirstOrDefaultAsync(v => v.Id == addToCartDto.VariantId);
                if (variant == null)
                {
                    throw new KeyNotFoundException($"Variant with ID {addToCartDto.VariantId} not found.");
                }

                // Kiểm tra số lượng tồn kho
                if (addToCartDto.Quantity <= 0)
                {
                    throw new InvalidOperationException("Quantity must be greater than 0.");
                }

                if (variant.Quantity < addToCartDto.Quantity)
                {
                    throw new InvalidOperationException($"Not enough stock for variant ID {addToCartDto.VariantId}. Available: {variant.Quantity}, Requested: {addToCartDto.Quantity}");
                }

                // Tìm hoặc tạo giỏ hàng cho người dùng
                var cart = await _context.Carts
                    .Include(c => c.CartItems).ThenInclude(ci => ci.Variant)
                    .FirstOrDefaultAsync(c => c.UserId == addToCartDto.UserId);

                if (cart == null)
                {
                    cart = new Cart
                    {
                        UserId = addToCartDto.UserId,
                        CartItems = new List<CartItem>()
                    };
                    _context.Carts.Add(cart);
                    await _context.SaveChangesAsync(); // Lưu cart để có CartId
                }

                // Kiểm tra xem Variant đã có trong giỏ chưa
                var existingCartItem = cart.CartItems.FirstOrDefault(ci => ci.VariantId == addToCartDto.VariantId);
                if (existingCartItem != null)
                {
                    // Cập nhật số lượng nếu đã có
                    existingCartItem.Quantity += addToCartDto.Quantity;
                    if (existingCartItem.Quantity > variant.Quantity)
                    {
                        throw new InvalidOperationException($"Not enough stock for variant ID {addToCartDto.VariantId}. Available: {variant.Quantity}, Requested: {existingCartItem.Quantity}");
                    }
                }
                else
                {
                    // Thêm mới CartItem
                    var cartItem = new CartItem
                    {
                        Quantity = addToCartDto.Quantity,
                        VariantId = addToCartDto.VariantId,
                        CartId = cart.Id,
                        // Tính giá dựa trên giá sản phẩm và phí bổ sung của biến thể
                        // Price sẽ được tính tự động qua getter, nhưng cần đảm bảo Variant và Product đã được load
                    };
                    cart.CartItems.Add(cartItem);
                }

                await _context.SaveChangesAsync();

                // Load lại dữ liệu để trả về
                cart = await _context.Carts
                    .Include(c => c.CartItems).ThenInclude(ci => ci.Variant).ThenInclude(v => v.Product)
                    .Include(c => c.CartItems).ThenInclude(ci => ci.Variant).ThenInclude(v => v.VariantValues).ThenInclude(vv => vv.Value)
                    .FirstOrDefaultAsync(c => c.Id == cart.Id);

                return _mapper.Map<CartDto>(cart);
            }
            catch (Exception ex)
            {
                // Ghi log lỗi để dễ debug
                Console.WriteLine($"Error in AddToCartAsync: {ex.Message}");
                throw; // Ném lại ngoại lệ để controller xử lý
            }
        }

        // Cập nhật số lượng CartItem
        public async Task<CartItemDto> UpdateCartItemAsync(int cartItemId, UpdateCartItemDto updateCartItemDto)
        {
            var cartItem = await _context.CartItems
                .Include(ci => ci.Variant).ThenInclude(v => v.Product)
                .Include(ci => ci.Variant).ThenInclude(v => v.VariantValues).ThenInclude(vv => vv.Value)
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId);

            if (cartItem == null) throw new KeyNotFoundException($"CartItem with ID {cartItemId} not found.");

            // Kiểm tra trạng thái user
            var cart = await _context.Carts.FirstOrDefaultAsync(c => c.Id == cartItem.CartId);
            if (cart == null) throw new KeyNotFoundException($"Cart for CartItem ID {cartItemId} not found.");

            // Kiểm tra cart.UserId có giá trị hay không
            if (!cart.UserId.HasValue)
                throw new InvalidOperationException($"Cart with ID {cart.Id} is not associated with any user.");

            await CheckUserAsync(cart.UserId.Value);

            // Kiểm tra số lượng tồn kho
            if (updateCartItemDto.Quantity <= 0)
            {
                throw new InvalidOperationException("Quantity must be greater than 0.");
            }

            if (updateCartItemDto.Quantity > cartItem.Variant.Quantity)
            {
                throw new InvalidOperationException($"Not enough stock for variant ID {cartItem.VariantId}. Available: {cartItem.Variant.Quantity}, Requested: {updateCartItemDto.Quantity}");
            }

            cartItem.Quantity = updateCartItemDto.Quantity;

            _context.CartItems.Update(cartItem);
            await _context.SaveChangesAsync();

            return _mapper.Map<CartItemDto>(cartItem);
        }

        // Xóa CartItem khỏi giỏ hàng
        public async Task RemoveFromCartAsync(int cartItemId)
        {
            var cartItem = await _context.CartItems.FirstOrDefaultAsync(ci => ci.Id == cartItemId);

            if (cartItem == null) throw new KeyNotFoundException($"CartItem with ID {cartItemId} not found.");

            // Kiểm tra trạng thái user
            var cart = await _context.Carts.FirstOrDefaultAsync(c => c.Id == cartItem.CartId);
            if (cart == null) throw new KeyNotFoundException($"Cart for CartItem ID {cartItemId} not found.");

            // Kiểm tra cart.UserId có giá trị hay không
            if (!cart.UserId.HasValue)
                throw new InvalidOperationException($"Cart with ID {cart.Id} is not associated with any user.");

            await CheckUserAsync(cart.UserId.Value);

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();
        }
    }
}

