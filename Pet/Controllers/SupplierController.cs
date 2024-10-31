using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos;
using Pet.Models;
using Pet.Repositories.IRepositories;
using System.Data;

namespace Pet.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class SupplierController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public SupplierController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetSuppliers()
        {
            var suppliers = await _unitOfWork.SupplierRepository.GetAllSuppliersWithProductsAsync();
            return Ok(suppliers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSupplier(int id)
        {
            var supplier = await _unitOfWork.SupplierRepository.GetByIdAsync(id);
            if (supplier == null) return NotFound();
            return Ok(supplier);
        }

        [HttpPost]
        public async Task<IActionResult> CreateSupplier([FromBody] Supplier supplier)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var existingSupplier = await _unitOfWork.SupplierRepository.GetSupplierByEmailAsync(supplier.Email);
            if (existingSupplier != null) return BadRequest("Email đã được sử dụng.");

            await _unitOfWork.SupplierRepository.AddAsync(supplier);
            await _unitOfWork.SaveAsync();

            return CreatedAtAction(nameof(GetSupplier), new { id = supplier.Id }, supplier);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSupplier(int id, [FromBody] Supplier supplier)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            // Tìm Supplier từ database
            var existingSupplier = await _unitOfWork.SupplierRepository.GetByIdAsync(id);
            if (existingSupplier == null) return NotFound("Supplier not found.");

            // Only update fields if they are provided in the request

            if (!string.IsNullOrEmpty(supplier.Email) && existingSupplier.Email != supplier.Email)
            {
                existingSupplier.Email = supplier.Email;
            }

            if (!string.IsNullOrEmpty(supplier.Name))
                existingSupplier.Name = supplier.Name;

            if (!string.IsNullOrEmpty(supplier.Address))
                existingSupplier.Address = supplier.Address;

            if (!string.IsNullOrEmpty(supplier.PhoneNumber))
                existingSupplier.PhoneNumber = supplier.PhoneNumber;

            _unitOfWork.SupplierRepository.UpdateAsync(existingSupplier);
            await _unitOfWork.SaveAsync();

            return Ok(supplier);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSupplier(int id)
        {
            var supplier = await _unitOfWork.SupplierRepository.GetByIdAsync(id);
            if (supplier == null) return NotFound();

            _unitOfWork.SupplierRepository.DeleteAsync(supplier);
            await _unitOfWork.SaveAsync();

            return Ok();
        }
    }
}
