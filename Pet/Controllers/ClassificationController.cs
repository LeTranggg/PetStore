using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos;
using Pet.Models;
using Pet.Repositories.IRepositories;
using System.Data;

namespace Pet.Controllers
{
    //[Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class ClassificationController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public ClassificationController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetClassifications()
        {
            var classifications = await _unitOfWork.ClassificationRepository.GetAllClassificationsWithProductsAsync();

            return Ok(classifications);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetClassification(int id)
        {
            var classification = await _unitOfWork.ClassificationRepository.GetClassificationWithProductByIdAsync(id);
            if (classification == null) return NotFound();
            return Ok(classification);
        }

        [HttpPost]
        public async Task<IActionResult> CreateClassification([FromBody] CreateClassificationDto createClassificationDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var product = await _unitOfWork.ProductRepository.GetProductByNameAsync(createClassificationDto.Product);
            if (product == null) return BadRequest("Product không hợp lệ.");

            var classification = new Classification
            {
                Value = createClassificationDto.Value,
                Name = createClassificationDto.Name,
                Price = createClassificationDto.Price,
                Quantity = createClassificationDto.Quantity,
                Weight = createClassificationDto.Weight,
                Height = createClassificationDto.Height,
                Length = createClassificationDto.Length,
                Width = createClassificationDto.Width,
                ProductId = product.Id
            };

            await _unitOfWork.ClassificationRepository.AddAsync(classification);
            await _unitOfWork.SaveAsync();

            return Ok("Tạo Classification thành công.");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClassification(int id, [FromBody] UpdateClassificationDto updatedClassificationDto)
        {
            var Classification = await _unitOfWork.ClassificationRepository.GetByIdAsync(id);
            if (Classification == null) return NotFound("Không tìm thấy người dùng.");

            // Only update fields if they are provided in the request
            if (!string.IsNullOrEmpty(updatedClassificationDto.Value))
                Classification.Value = updatedClassificationDto.Value;

            if (!string.IsNullOrEmpty(updatedClassificationDto.Name))
                Classification.Name = updatedClassificationDto.Name;

            if (updatedClassificationDto.Price.HasValue)
                Classification.Price = updatedClassificationDto.Price.Value;

            if (updatedClassificationDto.Quantity.HasValue)
                Classification.Quantity = updatedClassificationDto.Quantity.Value;

            if (updatedClassificationDto.Weight.HasValue)
                Classification.Weight = updatedClassificationDto.Weight.Value;

            if (updatedClassificationDto.Height.HasValue)
                Classification.Height = updatedClassificationDto.Height.Value;

            if (updatedClassificationDto.Length.HasValue)
                Classification.Length = updatedClassificationDto.Length.Value;

            if (updatedClassificationDto.Width.HasValue)
                Classification.Width = updatedClassificationDto.Width.Value;

            // Check if Category is provided
            if (!string.IsNullOrEmpty(updatedClassificationDto.Product))
            {
                var product = await _unitOfWork.ProductRepository.GetProductByNameAsync(updatedClassificationDto.Product);
                if (product == null) return BadRequest("Category không hợp lệ.");
                Classification.ProductId = product.Id;
            }

            _unitOfWork.ClassificationRepository.UpdateAsync(Classification);
            await _unitOfWork.SaveAsync();

            return Ok("Cập nhật Classification thành công.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClassification(int id)
        {
            var classification = await _unitOfWork.ClassificationRepository.GetByIdAsync(id);
            if (classification == null) return NotFound("Không tìm thấy người dùng.");

            _unitOfWork.ClassificationRepository.DeleteAsync(classification);
            await _unitOfWork.SaveAsync();

            return Ok("Xóa classification thành công.");
        }
    }
}
