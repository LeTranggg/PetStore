using Pet.Models;

namespace Pet.Repositories.IRepositories
{
    public interface IClassificationRepository : IRepository<Classification>
    {
        Task<IEnumerable<Classification>> GetAllClassificationsWithProductsAsync();
        Task<Classification> GetClassificationWithProductByIdAsync(int id);
    }
}
