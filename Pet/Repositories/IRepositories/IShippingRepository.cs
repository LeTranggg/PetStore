using Pet.Datas;
using Pet.Models;

namespace Pet.Repositories.IRepositories
{
    public interface IShippingRepository : IRepository<Shipping>
    {
        Task<bool> IsShippingMethodExistsAsync(ShippingMethod shippingMethod, int excludeShippingId);
        Task<IEnumerable<Shipping>> GetAllShippingsWithOrdersAsync();
        Task<Shipping> GetShippingByMethodAsync(ShippingMethod shippingMethod);
    }
}
