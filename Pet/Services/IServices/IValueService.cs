using Pet.Dtos.Value;

namespace Pet.Services.IServices
{
    public interface IValueService
    {
        Task<IEnumerable<ValueDto>> GetAllValuesAsync();
        Task<ValueDto> GetValueByIdAsync(int id);
        Task<ValueDto> CreateValueAsync(CreateValueDto createValueDto);
        Task<ValueDto> UpdateValueAsync(int id, UpdateValueDto updateValueDto);
        Task<bool> DeleteValueAsync(int id);
    }
}
