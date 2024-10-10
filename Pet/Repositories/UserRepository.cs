using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Models;
using Pet.Repositories.IRepositories;

namespace Pet.Repositories
{
    public class UserRepository : Repository<User>, IUserRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHasher<User> _passwordHasher;
        public UserRepository(ApplicationDbContext context, IPasswordHasher<User> passwordHasher) : base(context)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
        }

        public async Task<bool> ValidatePasswordAsync(User user, string password)
        {
            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password); //hash mật khẩu mà người dùng nhập vào và so sánh với mật khẩu đã hash trong db
            return result == PasswordVerificationResult.Success;
            // là một giá trị của kiểu PasswordVerificationResult, một enum với các giá trị:
            //Success: Mật khẩu hợp lệ(đã khớp).
            //Failed: Mật khẩu không khớp.
            //SuccessRehashNeeded: Mật khẩu khớp nhưng cần phải hash lại để phù hợp với thuật toán hash mới.
        }
    }
}
