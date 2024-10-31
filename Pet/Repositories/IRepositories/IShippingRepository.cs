using Pet.Models;

namespace Pet.Repositories.IRepositories
{
    public interface IShippingRepository : IRepository<Shipping>
    {
        Task<Shipping> GetShippingByNameAsync(string shippingName);
    }
}
