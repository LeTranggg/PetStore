using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Models;
using Pet.Repositories.IRepositories;

namespace Pet.Repositories
{
    public class RoleRepository : Repository<Role>, IRoleRepository
    {
        private readonly ApplicationDbContext _context;
        public RoleRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Role> GetRoleByNameAsync(string roleName)
        {
            return await _context.Roles.SingleOrDefaultAsync(r => r.Name == roleName);
        }

        public async Task<IEnumerable<Role>> GetAllRolesWithUsersAsync()
        {
            return await _context.Roles
                .Include(r => r.Users) // Nạp danh sách Users kèm với Role
                .ToListAsync();
        }
    }
}
