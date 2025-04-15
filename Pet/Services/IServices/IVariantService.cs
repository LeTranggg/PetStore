using Pet.Dtos.Variant;

namespace Pet.Services.IServices
{
    public interface IVariantService
    {
        Task<IEnumerable<VariantDto>> GetAllVariantsAsync();
        Task<VariantDto> GetVariantByIdAsync(int id);
        Task<VariantDto> CreateVariantAsync(int userId, CreateVariantDto createVariantDto);
        Task<VariantDto> UpdateVariantAsync(int userId, int id, UpdateVariantDto updateVariantDto);
        Task<bool> DeleteVariantAsync(int userId, int id);
    }
}
