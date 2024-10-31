using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos;
using Pet.Models;
using Pet.Repositories.IRepositories;

namespace Pet.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class ShippingController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public ShippingController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetShippings()
        {
            var Shippings = await _unitOfWork.ShippingRepository.GetAllAsync();
            return Ok(Shippings);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetShipping(int id)
        {
            var Shipping = await _unitOfWork.ShippingRepository.GetByIdAsync(id);
            if (Shipping == null) return NotFound();
            return Ok(Shipping);
        }

        [HttpPost]
        public async Task<IActionResult> CreateShipping([FromBody] Shipping shipping)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            await _unitOfWork.ShippingRepository.AddAsync(shipping);
            await _unitOfWork.SaveAsync();

            return CreatedAtAction(nameof(GetShipping), new { id = shipping.Id }, shipping);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateShipping(int id, [FromBody] UpdateShippingDto updateShippingDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            // Tìm Shipping từ database
            var existingShipping = await _unitOfWork.ShippingRepository.GetByIdAsync(id);
            if (existingShipping == null) return NotFound("Shipping not found.");

            // Cập nhật các giá trị cần thiết
            if (!string.IsNullOrEmpty(updateShippingDto.Name))
                existingShipping.Name = updateShippingDto.Name;

            if (updateShippingDto.Price.HasValue)
                existingShipping.Price = updateShippingDto.Price.Value;

            _unitOfWork.ShippingRepository.UpdateAsync(existingShipping);
            await _unitOfWork.SaveAsync();

            return Ok(updateShippingDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShipping(int id)
        {
            var shipping = await _unitOfWork.ShippingRepository.GetByIdAsync(id);
            if (shipping == null) return NotFound();

            _unitOfWork.ShippingRepository.DeleteAsync(shipping);
            await _unitOfWork.SaveAsync();

            return Ok();
        }
    }
}
