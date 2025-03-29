using Pet.Dtos.Feature;

namespace Pet.Services.IServices
{
    public interface IFeatureService
    {
        Task<IEnumerable<FeatureDto>> GetAllFeaturesAsync();
        Task<FeatureDto> GetFeatureByIdAsync(int id);
        Task<FeatureDto> CreateFeatureAsync(UpdateFeatureDto createFeatureDto);
        Task<FeatureDto> UpdateFeatureAsync(int id, UpdateFeatureDto updateFeatureDto);
        Task<bool> DeleteFeatureAsync(int id);
    }
}
