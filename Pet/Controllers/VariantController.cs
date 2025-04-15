using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos.Variant;
using Pet.Services.IServices;

namespace Pet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VariantController : ControllerBase
    {
        private readonly IVariantService _variantService;

        public VariantController(IVariantService variantService)
        {
            _variantService = variantService;
        }

        // Lấy userId từ token
        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                throw new UnauthorizedAccessException("Invalid user ID in token.");
            return userId;
        }

        // GET: api/variant
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VariantDto>>> GetAllVariants()
        {
            return Ok(await _variantService.GetAllVariantsAsync());
        }

        // GET: api/variant/1
        [HttpGet("{id}")]
        public async Task<ActionResult<VariantDto>> GetVariant(int id)
        {
            try
            {
                var variant = await _variantService.GetVariantByIdAsync(id);
                return Ok(variant);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // POST: api/variant
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<VariantDto>> CreateVariant([FromForm] CreateVariantDto createVariantDto)
        {
            try
            {
                var userId = GetUserId();
                var variant = await _variantService.CreateVariantAsync(userId, createVariantDto);
                return CreatedAtAction(nameof(GetVariant), new { id = variant.Id }, variant);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/variant/1
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<VariantDto>> UpdateVariant(int id, [FromForm] UpdateVariantDto updateVariantDto)
        {
            try
            {
                var userId = GetUserId();
                var variant = await _variantService.UpdateVariantAsync(userId, id, updateVariantDto);
                return Ok(variant);
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

        // DELETE: api/variant/1
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteVariant(int id)
        {
            try
            {
                var userId = GetUserId();
                var variant = await _variantService.DeleteVariantAsync(userId, id);
                if (!variant) return NotFound($"Variant with ID {id} not found.");
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
