using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos.Variant;
using Pet.Services.IServices;

namespace Pet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "Staff")]
    public class VariantController : ControllerBase
    {
        private readonly IVariantService _variantService;

        public VariantController(IVariantService variantService)
        {
            _variantService = variantService;
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
        public async Task<ActionResult<VariantDto>> CreateVariant([FromForm] CreateVariantDto createVariantDto)
        {
            try
            {
                var variant = await _variantService.CreateVariantAsync(createVariantDto);
                return CreatedAtAction(nameof(GetVariant), new { id = variant.Id }, variant);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/variant/1
        [HttpPut("{id}")]
        public async Task<ActionResult<VariantDto>> UpdateVariant(int id, [FromForm] UpdateVariantDto updateVariantDto)
        {
            try
            {
                var variant = await _variantService.UpdateVariantAsync(id, updateVariantDto);
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
        public async Task<IActionResult> DeleteVariant(int id)
        {
            try
            {
                var variant = await _variantService.DeleteVariantAsync(id);
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
