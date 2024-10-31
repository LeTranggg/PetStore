using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos;
using Pet.Models;
using Pet.Repositories.IRepositories;

namespace Pet.Controllers
{
    //[Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public ProductController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _unitOfWork.ProductRepository.GetAllProductsWithCategoriesSuppliersAsync();

            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _unitOfWork.ProductRepository.GetProductWithCategorySupplierByIdAsync(id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto createProductDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var category = await _unitOfWork.CategoryRepository.GetCategoryByNameAsync(createProductDto.Category);
            if (category == null) return BadRequest("Category không hợp lệ.");
            var supplier = await _unitOfWork.SupplierRepository.GetSupplierByNameAsync(createProductDto.Supplier);
            if (supplier == null) return BadRequest("Supplier không hợp lệ.");

            var Product = new Product
            {
                Name = createProductDto.Name,
                Description = createProductDto.Description,
                Price = createProductDto.Price,
                CategoryId = category.Id,
                SupplierId = supplier.Id
            };

            await _unitOfWork.ProductRepository.AddAsync(Product);
            await _unitOfWork.SaveAsync();

            return Ok("Tạo product thành công.");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto updatedProductDto)
        {
            var product = await _unitOfWork.ProductRepository.GetByIdAsync(id);
            if (product == null) return NotFound("Không tìm thấy người dùng.");

            // Only update fields if they are provided in the request
            if (!string.IsNullOrEmpty(updatedProductDto.Name))
                product.Name = updatedProductDto.Name;

            if (updatedProductDto.Description != null)
                product.Description = updatedProductDto.Description;

            if (updatedProductDto.Price.HasValue)
                product.Price = updatedProductDto.Price.Value;

            // Check if Category is provided
            if (!string.IsNullOrEmpty(updatedProductDto.Category))
            {
                var category = await _unitOfWork.CategoryRepository.GetCategoryByNameAsync(updatedProductDto.Category);
                if (category == null) return BadRequest("Category không hợp lệ.");
                product.CategoryId = category.Id;
            }

            // Check if Supplier is provided
            if (!string.IsNullOrEmpty(updatedProductDto.Category))
            {
                var supplier = await _unitOfWork.SupplierRepository.GetSupplierByNameAsync(updatedProductDto.Supplier);
                if (supplier == null) return BadRequest("Supplier không hợp lệ.");
                product.SupplierId = supplier.Id;
            }

            _unitOfWork.ProductRepository.UpdateAsync(product);
            await _unitOfWork.SaveAsync();

            return Ok("Cập nhật product thành công.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _unitOfWork.ProductRepository.GetByIdAsync(id);
            if (product == null) return NotFound("Không tìm thấy người dùng.");

            _unitOfWork.ProductRepository.DeleteAsync(product);
            await _unitOfWork.SaveAsync();

            return Ok("Xóa tài khoản thành công.");
        }
    }
}
