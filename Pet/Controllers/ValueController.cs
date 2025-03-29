using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos.Category;
using Pet.Dtos.Value;
using Pet.Services.IServices;

namespace Pet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "Admin")]
    public class ValueController : ControllerBase
    {
        private readonly IValueService _valueService;

        public ValueController(IValueService valueService)
        {
            _valueService = valueService;
        }

        // GET: api/value
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ValueDto>>> GetAllValues()
        {
            return Ok(await _valueService.GetAllValuesAsync());
        }

        // GET: api/value/1
        [HttpGet("{id}")]
        public async Task<ActionResult<ValueDto>> GetValue(int id)
        {
            try
            {
                var value = await _valueService.GetValueByIdAsync(id);
                return Ok(value);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // POST: api/value
        [HttpPost]
        public async Task<ActionResult<ValueDto>> CreateValue([FromBody] CreateValueDto createValueDto)
        {
            try
            {
                var value = await _valueService.CreateValueAsync(createValueDto);
                return CreatedAtAction(nameof(GetValue), new { id = value.Id }, value);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/value/1
        [HttpPut("{id}")]
        public async Task<ActionResult<ValueDto>> UpdateValue(int id, [FromBody] UpdateValueDto updateValueDto)
        {
            try
            {
                var value = await _valueService.UpdateValueAsync(id, updateValueDto);
                return Ok(value);
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

        // DETELE: api/value/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteValue(int id)
        {
            try
            {
                var value = await _valueService.DeleteValueAsync(id);
                if (!value) return NotFound($"Value with ID {id} not found.");
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
