using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos.Product;
using Pet.Services.IServices;

namespace Pet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "Staff")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        // GET: api/product
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetAllProducts()
        {
            return Ok(await _productService.GetAllProductsAsync());
        }

        // GET: api/product/1
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            try
            {
                var product = await _productService.GetProductByIdAsync(id);
                return Ok(product);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // POST: api/product
        [HttpPost]
        public async Task<ActionResult<ProductDto>> CreateProduct([FromForm] CreateProductDto createProductDto)
        {
            try
            {
                var product = await _productService.CreateProductAsync(createProductDto);
                return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/product/1
        [HttpPut("{id}")]
        public async Task<ActionResult<ProductDto>> UpdateProduct(int id, [FromForm] UpdateProductDto updateProductDto)
        {
            try
            {
                var product = await _productService.UpdateProductAsync(id, updateProductDto);
                return Ok(product);
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

        // DELETE: api/product/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var product = await _productService.DeleteProductAsync(id);
                if (!product) return NotFound($"Product with ID {id} not found.");
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
