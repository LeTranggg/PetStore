using Pet.Dtos.Feature;

namespace Pet.Services.IServices
{
    public interface IFeatureService
    {
        Task<IEnumerable<FeatureDto>> GetAllFeaturesAsync();
        Task<FeatureDto> GetFeatureByIdAsync(int id);
        Task<FeatureDto> CreateFeatureAsync(int userId, UpdateFeatureDto createFeatureDto);
        Task<FeatureDto> UpdateFeatureAsync(int userId, int id, UpdateFeatureDto updateFeatureDto);
        Task<bool> DeleteFeatureAsync(int userId, int id);
    }
}
