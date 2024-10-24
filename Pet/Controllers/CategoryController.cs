using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Models;
using Pet.Repositories.IRepositories;

namespace Pet.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public CategoryController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _unitOfWork.CategoryRepository.GetAllCategoriesWithProductsAsync();
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(int id)
        {
            var category = await _unitOfWork.CategoryRepository.GetByIdAsync(id);
            if (category == null) return NotFound();
            return Ok(category);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] Category category)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            await _unitOfWork.CategoryRepository.AddAsync(category);
            await _unitOfWork.SaveAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category category)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            // Tìm Category từ database
            var existingCategory = await _unitOfWork.CategoryRepository.GetByIdAsync(id);
            if (existingCategory == null) return NotFound("Category not found.");

            // Cập nhật các giá trị cần thiết
            existingCategory.Name = category.Name;

            _unitOfWork.CategoryRepository.UpdateAsync(existingCategory);
            await _unitOfWork.SaveAsync();

            return Ok(category);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var Category = await _unitOfWork.CategoryRepository.GetByIdAsync(id);
            if (Category == null) return NotFound();

            _unitOfWork.CategoryRepository.DeleteAsync(Category);
            await _unitOfWork.SaveAsync();

            return Ok();
        }
    }
}
