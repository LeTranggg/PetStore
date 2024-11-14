using Pet.Models;

namespace Pet.Repositories.IRepositories
{
    public interface ICartItemRepository : IRepository<CartItem>
    {
        Task<CartItem> GetCartItemWithClassificationAsync(int cartItemId);
        Task<IEnumerable<CartItem>> GetCartItemsByCartIdAsync(int cartId);
    }
}