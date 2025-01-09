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
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.Classifications)
                .ToListAsync();
        }

        public async Task<Product> GetProductWithCategorySupplierByIdAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<Product> GetProductByNameAsync(string productName)
        {
            return await _context.Products.SingleOrDefaultAsync(r => r.Name == productName);
        }

        public async Task<IEnumerable<Product>> GetAllProductsWithClassificationsAsync()
        {
            return await _context.Products
                .Include(p => p.Classifications) // Nạp danh sách Products kèm với Category
                .ToListAsync();
        }

        public async Task<Product> GetProductDetailAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.Classifications)
                .FirstOrDefaultAsync(p => p.Id == id);
        }
    }
}
