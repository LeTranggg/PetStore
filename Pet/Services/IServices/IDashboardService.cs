using Pet.Dtos.Dashboard;

namespace Pet.Services.IServices
{
    public interface IDashboardService
    {
        Task<OverviewDto> GetOverviewAsync(DateTime startDate, DateTime endDate);
        Task<List<SalesByPeriodDto>> GetSalesByPeriodAsync(SalesByPeriodRequestDto request);
        Task<List<TopProductDto>> GetTopProductsAsync(int limit, DateTime startDate, DateTime endDate);
        Task<List<OrderStatusDto>> GetOrderStatusStatsAsync(DateTime startDate, DateTime endDate);
    }
}
