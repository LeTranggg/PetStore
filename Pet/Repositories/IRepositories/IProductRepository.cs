using Pet.Models;

namespace Pet.Repositories.IRepositories
{
    public interface IProductRepository : IRepository<Product>
    {
        Task<IEnumerable<Product>> GetAllProductsWithCategoriesSuppliersAsync();
        Task<Product> GetProductWithCategorySupplierByIdAsync(int id);
        Task<Product> GetProductByNameAsync(string productName); 
        Task<IEnumerable<Product>> GetAllProductsWithClassificationsAsync();
        Task<Product> GetProductDetailAsync(int id);
    }
}
