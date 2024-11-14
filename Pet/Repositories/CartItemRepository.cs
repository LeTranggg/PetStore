using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Models;
using Pet.Repositories.IRepositories;

namespace Pet.Repositories
{
    public class CartItemRepository : Repository<CartItem>, ICartItemRepository
    {
        private readonly ApplicationDbContext _context;
        public CartItemRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<CartItem> GetCartItemWithClassificationAsync(int cartItemId)
        {
            return await _context.CartItems
                .Include(ci => ci.Classification)
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId);
        }

        public async Task<IEnumerable<CartItem>> GetCartItemsByCartIdAsync(int cartId)
        {
            return await _context.CartItems
                .Include(ci => ci.Classification)
                .Where(ci => ci.CartId == cartId)
                .ToListAsync();
        }
    }
}