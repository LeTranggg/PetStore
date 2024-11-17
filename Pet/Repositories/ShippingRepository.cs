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

    }
}
