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
    //[Authorize(Roles = "Admin")]
    public class SupplierController : ControllerBase
    {
        private readonly ISupplierService _supplierService;

        public SupplierController(ISupplierService supplierService)
        {
            _supplierService = supplierService;
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
        public async Task<ActionResult<SupplierDto>> CreateSupplier([FromForm] CreateSupplierDto createSupplierDto)
        {
            try
            {
                var supplier = await _supplierService.CreateSupplierAsync(createSupplierDto);
                return CreatedAtAction(nameof(GetSupplier), new { id = supplier.Id }, supplier);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/supplier/1
        [HttpPut("{id}")]
        public async Task<ActionResult<SupplierDto>> UpdateSupplier(int id, [FromForm] UpdateSupplierDto updateSupplierDto)
        {
            try
            {
                var supplier = await _supplierService.UpdateSupplierAsync(id, updateSupplierDto);
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
        public async Task<IActionResult> DeleteSupplier(int id)
        {
            try
            {
                var supplier = await _supplierService.DeleteSupplierAsync(id);
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
