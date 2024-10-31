using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Models;
using Pet.Repositories.IRepositories;

namespace Pet.Repositories
{
    public class ClassificationRepository : Repository<Classification>, IClassificationRepository
    {
        private readonly ApplicationDbContext _context;
        public ClassificationRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Classification>> GetAllClassificationsWithProductsAsync()
        {
            return await _context.Classifications
                .Include(u => u.Product)
                .ToListAsync();
        }

        public async Task<Classification> GetClassificationWithProductByIdAsync(int id)
        {
            return await _context.Classifications
                .Include(u => u.Product)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

    }
}
