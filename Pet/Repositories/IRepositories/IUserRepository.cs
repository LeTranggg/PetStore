using Pet.Models;

namespace Pet.Repositories.IRepositories
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User> GetUserByEmailAsync(string email); //Lấy thông tin người dùng dựa trên email
        Task<bool> ValidatePasswordAsync(User user, string password); //Kiểm tra mật khẩu đã được mã hóa với mật khẩu mà người dùng nhập vào
    }
}
