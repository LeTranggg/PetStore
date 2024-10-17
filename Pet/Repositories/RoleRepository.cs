using Microsoft.AspNetCore.Identity;
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

    }
}
