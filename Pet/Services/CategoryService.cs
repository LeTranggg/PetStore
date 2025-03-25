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

        // Xem danh sách categories 
        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
        {
            var category = await _context.Categories.ToListAsync();
            return _mapper.Map<IEnumerable<CategoryDto>>(category);
        }

        // Xem chi tiết category theo ID
        public async Task<CategoryDto> GetCategoryByIdAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) throw new KeyNotFoundException($"Category with ID {id} not found.");
            return _mapper.Map<CategoryDto>(category);
        }

        // Tạo category mới
        public async Task<CategoryDto> CreateCategoryAsync(UpdateCategoryDto createCategoryDto)
        {
            if (await _context.Categories.AnyAsync(c => c.Name == createCategoryDto.Name))
                throw new InvalidOperationException($"Category with name '{createCategoryDto.Name}' already exists.");

            var category = _mapper.Map<Category>(createCategoryDto);

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return _mapper.Map<CategoryDto>(category);

        }

        // Cập nhật category
        public async Task<CategoryDto> UpdateCategoryAsync(int id, UpdateCategoryDto updateCategoryDto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) throw new KeyNotFoundException($"Category with ID {id} not found.");

            if (await _context.Categories.AnyAsync(c => c.Name == updateCategoryDto.Name))
                throw new InvalidOperationException($"Category with name '{updateCategoryDto.Name} already exists.");

            _mapper.Map(updateCategoryDto, category);

            _context.Categories.Update(category);
            await _context.SaveChangesAsync();

            return _mapper.Map<CategoryDto>(category);
        }

        // Xoá category
        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return false;

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
