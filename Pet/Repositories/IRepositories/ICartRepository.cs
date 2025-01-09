using Microsoft.EntityFrameworkCore;
using Pet.Models;

namespace Pet.Repositories.IRepositories
{
    public interface ICartRepository : IRepository<Cart>
    {
        Task<Cart> GetCartWithItemsAsync(int userId);
        Task<IEnumerable<Cart>> GetCartsByUserIdAsync(int userId);
    }
}