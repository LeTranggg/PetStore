using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Models;
using Pet.Repositories.IRepositories;

namespace Pet.Repositories
{
    public class OrderRepository : Repository<Order>, IOrderRepository
    {
        private readonly ApplicationDbContext _context;
        public OrderRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        /*// Phương thức lọc đơn hàng confirming quá 10 ngày
        public async Task<IEnumerable<Order>> GetOrdersToCancelAsync()
        {
            return await _context.Orders
                .Where(o => o.OrderStatus == OrderStatus.confirming &&
                            (DateTime.Now - o.DateCreated).TotalDays > 10)
                .ToListAsync();
        }*/
    }
}
