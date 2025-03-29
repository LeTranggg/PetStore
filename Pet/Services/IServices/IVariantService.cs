using Pet.Dtos.Variant;

namespace Pet.Services.IServices
{
    public interface IVariantService
    {
        Task<IEnumerable<VariantDto>> GetAllVariantsAsync();
        Task<VariantDto> GetVariantByIdAsync(int id);
        Task<VariantDto> CreateVariantAsync(CreateVariantDto createVariantDto);
        Task<VariantDto> UpdateVariantAsync(int id, UpdateVariantDto updateVariantDto);
        Task<bool> DeleteVariantAsync(int id);
    }
}
