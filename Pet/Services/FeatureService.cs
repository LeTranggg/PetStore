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

        // Xem danh sách features 
        public async Task<IEnumerable<FeatureDto>> GetAllFeaturesAsync()
        {
            var feature = await _context.Features.ToListAsync();

            return _mapper.Map<IEnumerable<FeatureDto>>(feature);
        }

        // Xem chi tiết feature theo ID
        public async Task<FeatureDto> GetFeatureByIdAsync(int id)
        {
            var feature = await _context.Features.FindAsync(id);
            if (feature == null) throw new KeyNotFoundException($"Feature with ID {id} not found.");

            return _mapper.Map<FeatureDto>(feature);
        }

        // Tạo feature mới
        public async Task<FeatureDto> CreateFeatureAsync(UpdateFeatureDto createFeatureDto)
        {
            if (await _context.Features.AnyAsync(c => c.Name == createFeatureDto.Name))
                throw new InvalidOperationException($"Feature with name '{createFeatureDto.Name}' already exists.");

            var feature = _mapper.Map<Feature>(createFeatureDto);

            _context.Features.Add(feature);
            await _context.SaveChangesAsync();

            return _mapper.Map<FeatureDto>(feature);

        }

        // Cập nhật feature
        public async Task<FeatureDto> UpdateFeatureAsync(int id, UpdateFeatureDto updateFeatureDto)
        {
            var feature = await _context.Features.FindAsync(id);
            if (feature == null) throw new KeyNotFoundException($"Feature with ID {id} not found.");

            if (await _context.Features.AnyAsync(c => c.Name == updateFeatureDto.Name))
                throw new InvalidOperationException($"Feature with name '{updateFeatureDto.Name}' already exists.");

            _mapper.Map(updateFeatureDto, feature);

            _context.Features.Update(feature);
            await _context.SaveChangesAsync();

            return _mapper.Map<FeatureDto>(feature);
        }

        // Xoá feature
        public async Task<bool> DeleteFeatureAsync(int id)
        {
            var feature = await _context.Features.FindAsync(id);
            if (feature == null) return false;

            _context.Features.Remove(feature);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
