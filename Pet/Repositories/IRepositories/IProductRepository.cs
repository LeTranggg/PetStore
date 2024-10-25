using Pet.Models;

namespace Pet.Repositories.IRepositories
{
    public interface IProductRepository : IRepository<Product>
    {
        Task<IEnumerable<Product>> GetAllProductsWithCategoriesSuppliersAsync();
        Task<Product> GetProductWithCategorySupplierByIdAsync(int id);
    }
}
