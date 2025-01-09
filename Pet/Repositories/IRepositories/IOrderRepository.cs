using Pet.Models;

namespace Pet.Repositories.IRepositories
{
    public interface IOrderRepository : IRepository<Order>
    {
        //Task<IEnumerable<Order>> GetOrdersToCancelAsync();
    }
}
