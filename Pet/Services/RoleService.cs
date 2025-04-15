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

        // Xem danh sách roles
        public async Task<IEnumerable<RoleDto>> GetAllRolesAsync(int userId)
        {
            await CheckUserAsync(userId);

            var roles = await _context.Roles.ToListAsync();

            return _mapper.Map<IEnumerable<RoleDto>>(roles);
        }

        // Xem chi tiết role theo ID
        public async Task<RoleDto> GetRoleByIdAsync(int userId, int id)
        {
            await CheckUserAsync(userId);

            var role = await _context.Roles.FindAsync(id);
            if (role == null) throw new KeyNotFoundException($"Role with ID {id} not found.");

            return _mapper.Map<RoleDto>(role);
        }

        // Tạo role mới
        public async Task<RoleDto> CreateRoleAsync(int userId, UpdateRoleDto createRoleDto)
        {
            await CheckUserAsync(userId);

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
        public async Task<RoleDto> UpdateRoleAsync(int userId, int id, UpdateRoleDto updateRoleDto)
        {
            await CheckUserAsync(userId);

            var role = await _context.Roles.FindAsync(id);
            if (role == null) throw new KeyNotFoundException($"Role with ID {id} not found.");

            // Kiểm tra xem tên role mới có trùng với role khác không
            if (await _context.Roles.AnyAsync(r => r.Name == updateRoleDto.Name && r.Id != id))
                throw new InvalidOperationException($"Role with name '{updateRoleDto.Name}' already exists.");

            role.Name = updateRoleDto.Name;
            role.NormalizedName = updateRoleDto.Name.ToUpper(); // Cập nhật NormalizedName

            _context.Roles.Update(role);
            await _context.SaveChangesAsync();

            return _mapper.Map<RoleDto>(role);
        }

        // Xóa role
        public async Task<bool> DeleteRoleAsync(int userId, int id)
        {
            await CheckUserAsync(userId);

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
