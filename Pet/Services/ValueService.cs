using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Dtos.Value;
using Pet.Models;
using Pet.Services.IServices;

namespace Pet.Services
{
    public class ValueService : IValueService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public ValueService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // Xem danh sách values 
        public async Task<IEnumerable<ValueDto>> GetAllValuesAsync()
        {
            var value = await _context.Values.Include(v => v.Feature).ToListAsync();

            return _mapper.Map<IEnumerable<ValueDto>>(value);
        }

        // Xem chi tiết value theo ID
        public async Task<ValueDto> GetValueByIdAsync(int id)
        {
            var value = await _context.Values.FindAsync(id);
            if (value == null) throw new KeyNotFoundException($"Value with ID {id} not found.");

            await _context.Entry(value).Reference(v => v.Feature).LoadAsync();
            
            return _mapper.Map<ValueDto>(value);
        }

        // Tạo value mới
        public async Task<ValueDto> CreateValueAsync(CreateValueDto createValueDto)
        {
            if (await _context.Values.AnyAsync(c => c.Name == createValueDto.Name))
                throw new InvalidOperationException($"Value with name '{createValueDto.Name}' already exists.");

            var value = _mapper.Map<Value>(createValueDto);
            value.FeatureId = createValueDto.FeatureId;

            _context.Values.Add(value);
            await _context.SaveChangesAsync();

            await _context.Entry(value).Reference(v => v.Feature).LoadAsync();

            return _mapper.Map<ValueDto>(value);
        }

        // Cập nhật value
        public async Task<ValueDto> UpdateValueAsync(int id, UpdateValueDto updateValueDto)
        {
            var value = await _context.Values.FindAsync(id);
            if (value == null) throw new KeyNotFoundException($"Value with ID {id} not found.");
            
            if (updateValueDto.Name != null)
            {
                if (await _context.Values.AnyAsync(c => c.Name == updateValueDto.Name))
                    throw new InvalidOperationException($"Value with name '{updateValueDto.Name}' already exists.");
                value.Name = updateValueDto.Name;
            }
            if (updateValueDto.FeatureId.HasValue) value.FeatureId = updateValueDto.FeatureId.Value;

            _context.Values.Update(value);
            await _context.SaveChangesAsync();

            return _mapper.Map<ValueDto>(value);
        }

        // Xoá value
        public async Task<bool> DeleteValueAsync(int id)
        {
            var value = await _context.Values.FindAsync(id);
            if (value == null) return false;

            _context.Values.Remove(value);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
