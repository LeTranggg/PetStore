using Pet.Models;

namespace Pet.Repositories.IRepositories
{
    public interface ICategoryRepository : IRepository<Category>
    {
        Task<Category> GetCategoryByNameAsync(string categoryName); //Phương thức để lấy role dựa trên tên role
        Task<IEnumerable<Category>> GetAllCategoriesWithProductsAsync();
    }
}
