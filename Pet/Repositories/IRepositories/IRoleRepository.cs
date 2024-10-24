using Pet.Models;

namespace Pet.Repositories.IRepositories
{
    public interface IRoleRepository : IRepository<Role>
    {
        Task<Role> GetRoleByNameAsync(string roleName); //Phương thức để lấy role dựa trên tên role
        Task<IEnumerable<Role>> GetAllRolesWithUsersAsync();
    }
}
