using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos.Supplier;
using Pet.Services;
using Pet.Services.IServices;

namespace Pet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupplierController : ControllerBase
    {
        private readonly ISupplierService _supplierService;

        public SupplierController(ISupplierService supplierService)
        {
            _supplierService = supplierService;
        }

        // Lấy userId từ token
        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                throw new UnauthorizedAccessException("Invalid user ID in token.");
            return userId;
        }

        // GET: api/supplier
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SupplierDto>>> GetAllSuppliers()
        {
            return Ok(await _supplierService.GetAllSuppliersAsync());
        }

        // GET: api/supplier/1
        [HttpGet("{id}")]
        public async Task<ActionResult<SupplierDto>> GetSupplier(int id)
        {
            try
            {
                var supplier = await _supplierService.GetSupplierByIdAsync(id);
                return Ok(supplier);
            } 
            catch (KeyNotFoundException ex)
            {
                return NotFound (ex.Message);
            }
        }

        // POST: api/supplier
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SupplierDto>> CreateSupplier([FromForm] CreateSupplierDto createSupplierDto)
        {
            try
            {
                var userId = GetUserId();
                var supplier = await _supplierService.CreateSupplierAsync(userId, createSupplierDto);
                return CreatedAtAction(nameof(GetSupplier), new { id = supplier.Id }, supplier);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/supplier/1
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SupplierDto>> UpdateSupplier(int id, [FromForm] UpdateSupplierDto updateSupplierDto)
        {
            try
            {
                var userId = GetUserId();
                var supplier = await _supplierService.UpdateSupplierAsync(userId, id, updateSupplierDto);
                return Ok(supplier);
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

        // DELETE: api/supplier/1
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSupplier(int id)
        {
            try
            {
                var userId = GetUserId();
                var supplier = await _supplierService.DeleteSupplierAsync(userId, id);
                if (!supplier) return NotFound($"Supplier with ID {id} not found.");
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
