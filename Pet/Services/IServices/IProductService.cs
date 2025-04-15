using Pet.Dtos.Product;

namespace Pet.Services.IServices
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAllProductsAsync();
        Task<ProductDto> GetProductByIdAsync(int id);
        Task<ProductDto> CreateProductAsync(int userId, CreateProductDto createProductDto);
        Task<ProductDto> UpdateProductAsync(int userId, int id, UpdateProductDto updateProductDto);
        Task<bool> DeleteProductAsync(int userId, int id);
    }
}
