﻿using Pet.Dtos.Category;

namespace Pet.Services.IServices
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
        Task<CategoryDto> GetCategoryByIdAsync(int id);
        Task<CategoryDto> CreateCategoryAsync(int userId, UpdateCategoryDto createCategoryDto);
        Task<CategoryDto> UpdateCategoryAsync(int userId, int id, UpdateCategoryDto updateCategoryDto);
        Task<bool> DeleteCategoryAsync(int userId, int id);
    }
}
