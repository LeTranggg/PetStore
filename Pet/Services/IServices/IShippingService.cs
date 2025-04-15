using Pet.Dtos.Shipping;

namespace Pet.Services.IServices
{
    public interface IShippingService
    {
        Task<IEnumerable<ShippingDto>> GetAllShippingsAsync(int userId);
        Task<ShippingDto> GetShippingByIdAsync (int userId, int id);
        Task<ShippingDto> CreateShippingAsync(int userId, CreateShippingDto createShippingDto);
        Task<ShippingDto> UpdateShippingAsync(int userId, int id, UpdateShippingDto updateShippingDto);
        Task<bool> DeleteShippingAsync(int userId, int id);
    }
}
