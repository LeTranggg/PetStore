using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos.Dashboard;
using Pet.Services.IServices;

namespace Pet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        // GET: api/dashboard/overview
        [HttpGet("overview")]
        public async Task<ActionResult<OverviewDto>> GetOverview([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var overview = await _dashboardService.GetOverviewAsync(startDate, endDate);
                return Ok(overview);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/dashboard/sales-by-period
        [HttpGet("sales-by-period")]
        public async Task<ActionResult<List<SalesByPeriodDto>>> GetSalesByPeriod([FromQuery] SalesByPeriodRequestDto request)
        {
            try
            {
                Console.WriteLine($"Received request: Period={request.Period}, StartDate={request.StartDate}, EndDate={request.EndDate}");
                var salesData = await _dashboardService.GetSalesByPeriodAsync(request);
                return Ok(salesData);
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine($"ArgumentException: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}\nStackTrace: {ex.StackTrace}");
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/dashboard/top-products
        [HttpGet("top-products")]
        public async Task<ActionResult<List<TopProductDto>>> GetTopProducts([FromQuery] int limit = 10, [FromQuery] DateTime startDate = default, [FromQuery] DateTime endDate = default)
        {
            try
            {
                // If dates are not provided, default to the last 30 days
                if (startDate == default) startDate = DateTime.UtcNow.AddDays(-30);
                if (endDate == default) endDate = DateTime.UtcNow;

                var topProducts = await _dashboardService.GetTopProductsAsync(limit, startDate, endDate);
                return Ok(topProducts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/dashboard/order-status
        [HttpGet("order-status")]
        public async Task<ActionResult<List<OrderStatusDto>>> GetOrderStatusStats([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var orderStats = await _dashboardService.GetOrderStatusStatsAsync(startDate, endDate);
                return Ok(orderStats);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
