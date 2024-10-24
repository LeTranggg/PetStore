using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Models;
using Pet.Repositories.IRepositories;

namespace Pet.Repositories
{
    public class SupplierRepository : Repository<Supplier>, ISupplierRepository
    {
        private readonly ApplicationDbContext _context;
        public SupplierRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Supplier> GetSupplierByNameAsync(string supplierName)
        {
            return await _context.Suppliers.SingleOrDefaultAsync(r => r.Name == supplierName);
        }

        public async Task<IEnumerable<Supplier>> GetAllSuppliersWithProductsAsync()
        {
            return await _context.Suppliers
                .Include(r => r.Products) // Nạp danh sách Products kèm với Supplier
                .ToListAsync();
        }

        public async Task<Supplier> GetSupplierByEmailAsync(string email)
        {
            return await _context.Suppliers
                .Include(u => u.Products)
                .SingleOrDefaultAsync(u => u.Email == email);
        }
    }
}
