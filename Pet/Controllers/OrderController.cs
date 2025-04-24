using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos.Order;
using Pet.Services.IServices;

namespace Pet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        // GET: api/order
        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            try
            {
                var userIdClaim = User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized(new { message = "User information not found. Please log in again." });

                var userId = int.Parse(userIdClaim);
                var role = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
                var orders = await _orderService.GetAllOrdersAsync(userId, role);
                return Ok(orders);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/order/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized(new { message = "User information not found. Please log in again." });
                }

                var userId = int.Parse(userIdClaim);
                var role = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
                var order = await _orderService.GetOrderByIdAsync(id, userId, role);
                return Ok(order);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/order
        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto createOrderDto)
        {
            try
            {
                var userIdClaim = User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized(new { message = "User information not found. Please log in again." });
                }

                var userId = int.Parse(userIdClaim);
                var order = await _orderService.CreateOrderAsync(userId, createOrderDto);
                return Ok(order);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("simulate")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<SimulateOrderDto>> SimulateOrder([FromBody] CreateOrderDto createOrderDto)
        {
            var userId = int.Parse(User.FindFirst("sub")?.Value);
            var result = await _orderService.SimulateOrderAsync(userId, createOrderDto);
            return Ok(result);
        }

        // PUT: api/order/{id}/cancel
        [HttpPut("{id}/cancel")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CancelOrder(int id, [FromBody] CancelOrderDto cancelOrderDto)
        {
            try
            {
                var userIdClaim = User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized(new { message = "User information not found. Please log in again." });
                }

                var userId = int.Parse(userIdClaim);
                var order = await _orderService.CancelOrderAsync(id, cancelOrderDto, userId);
                return Ok(order);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/order/{id}/status
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderDto updateOrderStatusDto)
        {
            try
            {
                var userIdClaim = User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized(new { message = "User information not found. Please log in again." });
                }

                var userId = int.Parse(userIdClaim);
                var role = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
                var order = await _orderService.UpdateOrderStatusAsync(id, updateOrderStatusDto, userId, role);
                return Ok(order);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/order/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized(new { message = "User information not found. Please log in again." });
                }

                var userId = int.Parse(userIdClaim);
                var role = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
                await _orderService.DeleteOrderAsync(id, userId, role);
                return Ok(new { message = "Đơn hàng đã được xóa thành công." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
