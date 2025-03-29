using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos.Feature;
using Pet.Services.IServices;

namespace Pet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "Admin")]
    public class FeatureController : ControllerBase
    {
        private readonly IFeatureService _featureService;

        public FeatureController(IFeatureService featureService)
        {
            _featureService = featureService;
        }

        // GET: api/feature
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FeatureDto>>> GetAllFeatures()
        {
            return Ok(await _featureService.GetAllFeaturesAsync());
        }

        // GET: api/feature/1
        [HttpGet("{id}")]
        public async Task<ActionResult<FeatureDto>> GetFeature(int id)
        {
            try
            {
                var feature = await _featureService.GetFeatureByIdAsync(id);
                return Ok(feature);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // POST: api/feature
        [HttpPost]
        public async Task<ActionResult<FeatureDto>> CreateFeature([FromBody] UpdateFeatureDto createFeatureDto)
        {
            try
            {
                var feature = await _featureService.CreateFeatureAsync(createFeatureDto);
                return CreatedAtAction(nameof(GetFeature), new { id = feature.Id }, feature);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/feature/1
        [HttpPut("{id}")]
        public async Task<ActionResult<FeatureDto>> UpdateFeature(int id, [FromBody] UpdateFeatureDto updateFeatureDto)
        {
            try
            {
                var feature = await _featureService.UpdateFeatureAsync(id, updateFeatureDto);
                return Ok(feature);
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

        // DETELE: api/feature/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFeature(int id)
        {
            try
            {
                var feature = await _featureService.DeleteFeatureAsync(id);
                if (!feature) return NotFound($"Feature with ID {id} not found.");
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
