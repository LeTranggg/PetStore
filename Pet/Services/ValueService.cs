using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Dtos.Product;
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

        // Kiểm tra trạng thái user
        private async Task CheckUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new KeyNotFoundException($"User with ID {userId} not found.");

            var localTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var localNow = TimeZoneInfo.ConvertTimeFromUtc(DateTimeOffset.UtcNow.UtcDateTime, localTimeZone);
            if (user.LockoutEnabled && user.LockoutEnd.HasValue && user.LockoutEnd > localNow)
                throw new UnauthorizedAccessException("Your account is currently locked. Please try again later or contact support.");
        }

        // Xem danh sách values 
        public async Task<IEnumerable<ValueDto>> GetAllValuesAsync()
        {
            var values = await _context.Values.Include(v => v.Feature).ToListAsync();

            return _mapper.Map<IEnumerable<ValueDto>>(values);
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
        public async Task<ValueDto> CreateValueAsync(int userId, CreateValueDto createValueDto)
        {
            await CheckUserAsync(userId);

            if (await _context.Values.AnyAsync(c => c.Name == createValueDto.Name))
                throw new InvalidOperationException($"Value with name '{createValueDto.Name}' already exists.");

            var value = _mapper.Map<Value>(createValueDto);

            _context.Values.Add(value);
            await _context.SaveChangesAsync();

            await _context.Entry(value).Reference(v => v.Feature).LoadAsync();

            return _mapper.Map<ValueDto>(value);
        }

        // Cập nhật value
        public async Task<ValueDto> UpdateValueAsync(int userId, int id, UpdateValueDto updateValueDto)
        {
            await CheckUserAsync(userId);

            var value = await _context.Values.FindAsync(id);
            if (value == null) throw new KeyNotFoundException($"Value with ID {id} not found.");
            
            if (updateValueDto.Name != null && updateValueDto.Name != value.Name)
            {
                if (await _context.Values.AnyAsync(c => c.Name == updateValueDto.Name))
                    throw new InvalidOperationException($"Value with name '{updateValueDto.Name}' already exists.");
                
                value.Name = updateValueDto.Name;
            }
            if (updateValueDto.FeatureId.HasValue) value.FeatureId = updateValueDto.FeatureId.Value;

            _context.Values.Update(value);
            await _context.SaveChangesAsync();

            await _context.Entry(value).Reference(v => v.Feature).LoadAsync();

            return _mapper.Map<ValueDto>(value);
        }

        // Xoá value
        public async Task<bool> DeleteValueAsync(int userId, int id)
        {
            await CheckUserAsync(userId);

            var value = await _context.Values.FindAsync(id);
            if (value == null) return false;

            _context.Values.Remove(value);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
