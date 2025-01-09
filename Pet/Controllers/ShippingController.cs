using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos;
using Pet.Models;
using Pet.Repositories;
using Pet.Repositories.IRepositories;

namespace Pet.Controllers
{
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
            var Shippings = await _unitOfWork.ShippingRepository.GetAllShippingsWithOrdersAsync();
            return Ok(Shippings);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetShipping(int id)
        {
            var Shipping = await _unitOfWork.ShippingRepository.GetByIdAsync(id);
            if (Shipping == null) return NotFound();
            return Ok(Shipping);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateShipping([FromBody] Shipping shipping)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check if shipping method already exists
            if (await _unitOfWork.ShippingRepository.IsShippingMethodExistsAsync(shipping.ShippingMethod, 0))
                return BadRequest($"Shipping method {shipping.ShippingMethod} already exists.");

            await _unitOfWork.ShippingRepository.AddAsync(shipping);
            await _unitOfWork.SaveAsync();

            return CreatedAtAction(nameof(GetShippings), new { id = shipping.Id }, shipping);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateShipping(int id, [FromBody] UpdateShippingDto updateShippingDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingShipping = await _unitOfWork.ShippingRepository.GetByIdAsync(id);
            if (existingShipping == null)
                return NotFound($"Shipping with ID {id} not found.");

            // Update shipping method if provided
            if (updateShippingDto.ShippingMethod.HasValue)
            {
                // Check if the new shipping method already exists (excluding current shipping)
                if (await _unitOfWork.ShippingRepository.IsShippingMethodExistsAsync(
                    updateShippingDto.ShippingMethod.Value, id))
                {
                    return BadRequest($"Shipping method {updateShippingDto.ShippingMethod.Value} already exists.");
                }
                existingShipping.ShippingMethod = updateShippingDto.ShippingMethod.Value;
            }

            if (updateShippingDto.Price.HasValue)
            {
                existingShipping.Price = updateShippingDto.Price.Value;
            }

            _unitOfWork.ShippingRepository.UpdateAsync(existingShipping);
            await _unitOfWork.SaveAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShipping(int id)
        {
            var shipping = await _unitOfWork.ShippingRepository.GetByIdAsync(id);
            if (shipping == null) return NotFound("Không tìm thấy shipping.");

            _unitOfWork.ShippingRepository.DeleteAsync(shipping);
            await _unitOfWork.SaveAsync();

            return Ok("Xóa tài khoản thành công.");
        }
    }
}
