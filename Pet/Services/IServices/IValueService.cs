using Pet.Dtos.Value;

namespace Pet.Services.IServices
{
    public interface IValueService
    {
        Task<IEnumerable<ValueDto>> GetAllValuesAsync();
        Task<ValueDto> GetValueByIdAsync(int id);
        Task<ValueDto> CreateValueAsync(int userId, CreateValueDto createValueDto);
        Task<ValueDto> UpdateValueAsync(int userId, int id, UpdateValueDto updateValueDto);
        Task<bool> DeleteValueAsync(int userId, int id);
    }
}
