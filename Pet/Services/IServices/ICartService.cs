using Pet.Dtos.Cart;

namespace Pet.Services.IServices
{
    public interface ICartService
    {
        Task<CartDto> GetCartByUserIdAsync(int userId);
        Task<CartItemDto> GetCartItemByIdAsync(int cartItemId);
        Task<CartDto> AddToCartAsync(AddToCartDto addToCartDto);
        Task<CartItemDto> UpdateCartItemAsync(int cartItemId, UpdateCartItemDto updateCartItemDto); 
        Task RemoveFromCartAsync(int cartItemId); 
    }
}
