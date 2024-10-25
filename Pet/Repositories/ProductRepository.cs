using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NuGet.Versioning;
using Pet.Datas;
using Pet.Models;
using Pet.Repositories.IRepositories;

namespace Pet.Repositories
{
    public class ProductRepository : Repository<Product>, IProductRepository
    {
        private readonly ApplicationDbContext _context;
        public ProductRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Product>> GetAllProductsWithCategoriesSuppliersAsync()
        {
            return await _context.Products
                .Include(u => u.Category)
                .Include(u => u.Supplier)
                .ToListAsync();
        }

        public async Task<Product> GetProductWithCategorySupplierByIdAsync(int id)
        {
            return await _context.Products
                .Include(u => u.Category)
                .Include(u => u.Supplier)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

    }
}
