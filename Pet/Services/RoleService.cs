using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Dtos.Role;
using Pet.Models;
using Pet.Services.IServices;

namespace Pet.Services
{
    public class RoleService : IRoleService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public RoleService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // Xem danh sách roles
        public async Task<IEnumerable<RoleDto>> GetAllRolesAsync()
        {
            var roles = await _context.Roles.ToListAsync();

            return _mapper.Map<IEnumerable<RoleDto>>(roles);
        }

        // Xem chi tiết role theo ID
        public async Task<RoleDto> GetRoleByIdAsync(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null) throw new KeyNotFoundException($"Role with ID {id} not found.");

            return _mapper.Map<RoleDto>(role);
        }

        // Tạo role mới
        public async Task<RoleDto> CreateRoleAsync(UpdateRoleDto createRoleDto)
        {
            // Kiểm tra xem tên role đã tồn tại chưa
            if (await _context.Roles.AnyAsync(r => r.Name == createRoleDto.Name))
                throw new InvalidOperationException($"Role with name '{createRoleDto.Name}' already exists.");

            var role = _mapper.Map<Role>(createRoleDto);
            role.NormalizedName = createRoleDto.Name.ToUpper(); // Chuẩn hóa tên role

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            return _mapper.Map<RoleDto>(role);
        }

        // Cập nhật role
        public async Task<RoleDto> UpdateRoleAsync(int id, UpdateRoleDto updateRoleDto)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null) throw new KeyNotFoundException($"Role with ID {id} not found.");

            // Kiểm tra xem tên role mới có trùng với role khác không
            if (await _context.Roles.AnyAsync(r => r.Name == updateRoleDto.Name && r.Id != id))
                throw new InvalidOperationException($"Role with name '{updateRoleDto.Name}' already exists.");

            _mapper.Map(updateRoleDto, role);

            role.NormalizedName = updateRoleDto.Name.ToUpper(); // Cập nhật NormalizedName

            _context.Roles.Update(role);
            await _context.SaveChangesAsync();

            return _mapper.Map<RoleDto>(role);
        }

        // Xóa role
        public async Task<bool> DeleteRoleAsync(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null) return false;

            // Kiểm tra xem role có đang được sử dụng bởi user nào không
            if (await _context.UserRoles.AnyAsync(ur => ur.RoleId == id))
                throw new InvalidOperationException($"Cannot delete role with ID {id} because it is assigned to users.");

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
