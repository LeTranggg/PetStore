using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Dtos.Feature;
using Pet.Models;
using Pet.Services.IServices;

namespace Pet.Services
{
    public class FeatureService : IFeatureService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public FeatureService(ApplicationDbContext context, IMapper mapper)
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

        // Xem danh sách features 
        public async Task<IEnumerable<FeatureDto>> GetAllFeaturesAsync()
        {
            var features = await _context.Features.ToListAsync();

            return _mapper.Map<IEnumerable<FeatureDto>>(features);
        }

        // Xem chi tiết feature theo ID
        public async Task<FeatureDto> GetFeatureByIdAsync(int id)
        {
            var feature = await _context.Features.FindAsync(id);
            if (feature == null) throw new KeyNotFoundException($"Feature with ID {id} not found.");

            return _mapper.Map<FeatureDto>(feature);
        }

        // Tạo feature mới
        public async Task<FeatureDto> CreateFeatureAsync(int userId, UpdateFeatureDto createFeatureDto)
        {
            await CheckUserAsync(userId);

            if (await _context.Features.AnyAsync(c => c.Name == createFeatureDto.Name))
                throw new InvalidOperationException($"Feature with name '{createFeatureDto.Name}' already exists.");

            var feature = _mapper.Map<Feature>(createFeatureDto);

            _context.Features.Add(feature);
            await _context.SaveChangesAsync();

            return _mapper.Map<FeatureDto>(feature);

        }

        // Cập nhật feature
        public async Task<FeatureDto> UpdateFeatureAsync(int userId, int id, UpdateFeatureDto updateFeatureDto)
        {
            await CheckUserAsync(userId);

            var feature = await _context.Features.FindAsync(id);
            if (feature == null) throw new KeyNotFoundException($"Feature with ID {id} not found.");

            if (await _context.Features.AnyAsync(c => c.Name == updateFeatureDto.Name))
                throw new InvalidOperationException($"Feature with name '{updateFeatureDto.Name}' already exists.");

            feature.Name = updateFeatureDto.Name;

            _context.Features.Update(feature);
            await _context.SaveChangesAsync();

            return _mapper.Map<FeatureDto>(feature);
        }

        // Xoá feature
        public async Task<bool> DeleteFeatureAsync(int userId, int id)
        {
            await CheckUserAsync(userId);

            var feature = await _context.Features.FindAsync(id);
            if (feature == null) return false;

            _context.Features.Remove(feature);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
