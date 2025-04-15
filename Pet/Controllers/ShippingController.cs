using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos.Shipping;
using Pet.Services;
using Pet.Services.IServices;

namespace Pet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class ShippingController : ControllerBase
    {
        private readonly IShippingService _shippingService;

        public ShippingController(IShippingService shippingService)
        {
            _shippingService = shippingService;
        }

        // Lấy userId từ token
        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                throw new UnauthorizedAccessException("Invalid user ID in token.");
            return userId;
        }

        // GET: api/shipping
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ShippingDto>>> GetAllShippings()
        {
            var userId = GetUserId();
            return Ok(await _shippingService.GetAllShippingsAsync(userId));
        }

        // GET: api/shipping/1
        [HttpGet("{id}")]
        public async Task<ActionResult<ShippingDto>> GetShipping(int id)
        {
            try
            {
                var userId = GetUserId();
                var shipping = await _shippingService.GetShippingByIdAsync(userId, id);
                return Ok(shipping);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // POST: api/shipping
        [HttpPost]
        public async Task<ActionResult<ShippingDto>> CreateShipping([FromBody] CreateShippingDto createShippingDto)
        {
            try
            {
                var userId = GetUserId();
                var shipping = await _shippingService.CreateShippingAsync(userId, createShippingDto);
                return CreatedAtAction(nameof(GetShipping), new { id = shipping.Id }, shipping);
            }
            catch(InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/shipping/1
        [HttpPut("{id}")]
        public async Task<ActionResult<ShippingDto>> UpdateShipping(int id, [FromBody] UpdateShippingDto updateShippingDto)
        {
            try
            {
                var userId = GetUserId();
                var shipping = await _shippingService.UpdateShippingAsync(userId, id, updateShippingDto);
                return Ok(shipping);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/shipping/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShipping(int id)
        {
            try
            {
                var userId = GetUserId();
                var shipping = await _shippingService.DeleteShippingAsync(userId, id);
                if (!shipping) return NotFound($"Shipping with ID {id} not found.");
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
