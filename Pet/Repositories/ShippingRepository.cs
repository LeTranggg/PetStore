using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Models;
using Pet.Repositories.IRepositories;

namespace Pet.Repositories
{
    public class ShippingRepository : Repository<Shipping>, IShippingRepository
    {
        private readonly ApplicationDbContext _context;
        public ShippingRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<bool> IsShippingMethodExistsAsync(ShippingMethod shippingMethod, int excludeShippingId)
        {
            return await _context.Shippings
                .AnyAsync(s => s.ShippingMethod == shippingMethod && s.Id != excludeShippingId);
        }

        public async Task<IEnumerable<Shipping>> GetAllShippingsWithOrdersAsync()
        {
            return await _context.Shippings
                .Include(s => s.Orders)
                .ToListAsync();
        }

        public async Task<Shipping> GetShippingByMethodAsync(ShippingMethod shippingMethod)
        {
            return await _context.Shippings
                .FirstOrDefaultAsync(s => s.ShippingMethod == shippingMethod);
        }

    }
}
