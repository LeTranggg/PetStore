using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Dtos.Dashboard;
using Pet.Models;
using Pet.Services.IServices;
using System.Globalization;

namespace Pet.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;

        public DashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Xem số liệu thống kê tổng quan (tổng doanh thu, tổng đơn hàng)
        public async Task<OverviewDto> GetOverviewAsync(DateTime startDate, DateTime endDate)
        {
            // Tổng doanh thu từ các đơn hàng đã hoàn thành hoặc đang giao (Received hoặc Delivering) trong phạm vi ngày
            var totalRevenue = await _context.Orders
                .Where(o => (o.Status == OrderStatus.Received || o.Status == OrderStatus.Delivering) && o.DateCreated >= startDate && o.DateCreated <= endDate)
                .SumAsync(o => o.TotalPrice);

            // Tổng số đơn hàng trong phạm vi ngày
            var totalOrders = await _context.Orders
                .Where(o => o.DateCreated >= startDate && o.DateCreated <= endDate)
                .CountAsync();

            return new OverviewDto
            {
                TotalRevenue = totalRevenue,
                TotalOrders = totalOrders
            };
        }

        // Xem doanh số theo kỳ (ngày, tháng, năm)
        public async Task<List<SalesByPeriodDto>> GetSalesByPeriodAsync(SalesByPeriodRequestDto request)
        {
            var query = _context.Orders
                .Where(o => (o.Status == OrderStatus.Received || o.Status == OrderStatus.Delivering) && o.DateCreated >= request.StartDate && o.DateCreated <= request.EndDate);

            var salesData = new List<SalesByPeriodDto>();

            switch (request.Period.ToLower())
            {
                case "day":
                    var ordersByDay = await query
                        .Select(o => new { o.DateCreated, o.TotalPrice })
                        .ToListAsync(); // Materialize the query to the client

                    salesData = ordersByDay
                        .GroupBy(o => new { o.DateCreated.Year, o.DateCreated.Month, o.DateCreated.Day })
                        .Select(g => new SalesByPeriodDto
                        {
                            Period = $"{g.Key.Year}-{g.Key.Month:D2}-{g.Key.Day:D2}", // Format as yyyy-MM-dd
                            Revenue = g.Sum(o => o.TotalPrice)
                        })
                        .OrderBy(s => s.Period)
                        .ToList();
                    break;

                case "week":
                    var ordersByWeek = await query
                        .Select(o => new { o.DateCreated, o.TotalPrice })
                        .ToListAsync(); // Materialize the query to the client

                    salesData = ordersByWeek
                        .GroupBy(o => new
                        {
                            Year = o.DateCreated.Year,
                            Week = CultureInfo.InvariantCulture.Calendar.GetWeekOfYear(
                                o.DateCreated, CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday)
                        })
                        .Select(g => new SalesByPeriodDto
                        {
                            Period = $"{g.Key.Year}-W{g.Key.Week:D2}", // Format as yyyy-Www
                            Revenue = g.Sum(o => o.TotalPrice)
                        })
                        .OrderBy(s => s.Period)
                        .ToList();
                    break;

                case "month":
                    var ordersByMonth = await query
                        .Select(o => new { o.DateCreated, o.TotalPrice })
                        .ToListAsync(); // Materialize the query to the client

                    salesData = ordersByMonth
                        .GroupBy(o => new { o.DateCreated.Year, o.DateCreated.Month })
                        .Select(g => new SalesByPeriodDto
                        {
                            Period = $"{g.Key.Year}-{g.Key.Month:D2}", // Format as yyyy-MM
                            Revenue = g.Sum(o => o.TotalPrice)
                        })
                        .OrderBy(s => s.Period)
                        .ToList();
                    break;

                case "year":
                    var ordersByYear = await query
                        .Select(o => new { o.DateCreated, o.TotalPrice })
                        .ToListAsync(); // Materialize the query to the client

                    salesData = ordersByYear
                        .GroupBy(o => o.DateCreated.Year)
                        .Select(g => new SalesByPeriodDto
                        {
                            Period = g.Key.ToString(), // Format as yyyy
                            Revenue = g.Sum(o => o.TotalPrice)
                        })
                        .OrderBy(s => s.Period)
                        .ToList();
                    break;

                default:
                    throw new ArgumentException("Invalid period. Use 'Day', 'Week', 'Month', or 'Year'.");
            }

            return salesData;
        }

        // Xem các sản phẩm bán chạy nhất
        public async Task<List<TopProductDto>> GetTopProductsAsync(int limit, DateTime startDate, DateTime endDate)
        {
            var topProducts = await _context.OrderDetails
                .Include(od => od.Order)
                .Include(od => od.Variant).ThenInclude(v => v.Product)
                .Where(od => (od.Order.Status == OrderStatus.Received || od.Order.Status == OrderStatus.Delivering) && od.Order.DateCreated >= startDate && od.Order.DateCreated <= endDate)
                .Where(od => od.Variant != null && od.Variant.Product != null)
                .GroupBy(od => new { od.Variant.ProductId, od.Variant.Product.Name })
                .Select(g => new TopProductDto
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.Name,
                    TotalQuantitySold = g.Sum(od => od.Quantity)
                })
                .OrderByDescending(p => p.TotalQuantitySold)
                .Take(limit)
                .ToListAsync();

            return topProducts;
        }

        // Xem số liệu thống kê trạng thái đơn hàng
        public async Task<List<OrderStatusDto>> GetOrderStatusStatsAsync(DateTime startDate, DateTime endDate)
        {
            var orderStats = await _context.Orders
                .Where(o => o.DateCreated >= startDate && o.DateCreated <= endDate)
                .GroupBy(o => o.Status)
                .Select(g => new OrderStatusDto
                {
                    Status = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToListAsync();

            return orderStats;
        }
    }
}
