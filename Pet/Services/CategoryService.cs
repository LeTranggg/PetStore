using AutoMapper;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Dtos.Category;
using Pet.Models;
using Pet.Services.IServices;

namespace Pet.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public CategoryService(ApplicationDbContext context, IMapper mapper)
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

        // Xem danh sách categories 
        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
        {
            var categories = await _context.Categories.ToListAsync();

            return _mapper.Map<IEnumerable<CategoryDto>>(categories);
        }

        // Xem chi tiết category theo ID
        public async Task<CategoryDto> GetCategoryByIdAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) throw new KeyNotFoundException($"Category with ID {id} not found.");

            return _mapper.Map<CategoryDto>(category);
        }

        // Tạo category mới
        public async Task<CategoryDto> CreateCategoryAsync(int userId, UpdateCategoryDto createCategoryDto)
        {
            await CheckUserAsync(userId);

            if (await _context.Categories.AnyAsync(c => c.Name == createCategoryDto.Name))
                throw new InvalidOperationException($"Category with name '{createCategoryDto.Name}' already exists.");

            var category = _mapper.Map<Category>(createCategoryDto);

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return _mapper.Map<CategoryDto>(category);

        }

        // Cập nhật category
        public async Task<CategoryDto> UpdateCategoryAsync(int userId, int id, UpdateCategoryDto updateCategoryDto)
        {
            await CheckUserAsync(userId);

            var category = await _context.Categories.FindAsync(id);
            if (category == null) throw new KeyNotFoundException($"Category with ID {id} not found.");

            if (await _context.Categories.AnyAsync(c => c.Name == updateCategoryDto.Name))
                throw new InvalidOperationException($"Category with name '{updateCategoryDto.Name}' already exists.");

            category.Name = updateCategoryDto.Name;

            _context.Categories.Update(category);
            await _context.SaveChangesAsync();

            return _mapper.Map<CategoryDto>(category);
        }

        // Xoá category
        public async Task<bool> DeleteCategoryAsync(int userId, int id)
        {
            await CheckUserAsync(userId);

            var category = await _context.Categories.FindAsync(id);
            if (category == null) return false;

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
