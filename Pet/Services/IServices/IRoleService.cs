using Pet.Dtos.Role;

namespace Pet.Services.IServices
{
    public interface IRoleService
    {
        Task<IEnumerable<RoleDto>> GetAllRolesAsync(int userId);
        Task<RoleDto> GetRoleByIdAsync(int userId, int id);
        Task<RoleDto> CreateRoleAsync(int userId, UpdateRoleDto createRoleDto);
        Task<RoleDto> UpdateRoleAsync(int userId, int id, UpdateRoleDto updateRoleDto);
        Task<bool> DeleteRoleAsync(int userId, int id);
    }
}
