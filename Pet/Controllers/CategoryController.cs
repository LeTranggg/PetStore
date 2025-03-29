using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos.Category;
using Pet.Services;
using Pet.Services.IServices;

namespace Pet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "Admin")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        // GET: api/category
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAllCategories()
        {
            return Ok(await _categoryService.GetAllCategoriesAsync());
        }

        // GET: api/category/1
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            try
            {
                var category = await _categoryService.GetCategoryByIdAsync(id);
                return Ok(category);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // POST: api/category
        [HttpPost]
        public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] UpdateCategoryDto createCategoryDto)
        {
            try
            {
                var category = await _categoryService.CreateCategoryAsync(createCategoryDto);
                return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/category/1
        [HttpPut("{id}")]
        public async Task<ActionResult<CategoryDto>> UpdateCategory(int id, [FromBody] UpdateCategoryDto updateCategoryDto)
        {
            try
            {
                var category = await _categoryService.UpdateCategoryAsync(id, updateCategoryDto);
                return Ok(category);
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

        // DETELE: api/category/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var category = await _categoryService.DeleteCategoryAsync(id);
                if (!category) return NotFound($"Category with ID {id} not found.");
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
