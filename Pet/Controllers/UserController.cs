using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Pet.Dtos;
using Pet.Models;
using Pet.Repositories.IRepositories;
using Pet.Services.IServices;
using System.Text;

namespace Pet.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IEmailService _emailService;

        public UserController(IUnitOfWork unitOfWork, IPasswordHasher<User> passwordHasher, IEmailService emailService)
        {
            _unitOfWork = unitOfWork;
            _passwordHasher = passwordHasher;
            _emailService = emailService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _unitOfWork.UserRepository.GetAllUsersWithRolesAsync();
            // Chỉ trả về những user đã xác nhận email
            var confirmedUsers = users.Where(u => u.EmailConfirmed).ToList();

            return Ok(confirmedUsers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _unitOfWork.UserRepository.GetUserWithRoleByIdAsync(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto createUserDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (createUserDto.Password != createUserDto.PasswordConfirmed)
                return BadRequest("Mật khẩu không khớp.");

            var existingUser = await _unitOfWork.UserRepository.GetUserByEmailAsync(createUserDto.Email);
            if (existingUser != null) return BadRequest("Email đã được sử dụng.");

            // Lấy role "Customer" từ database
            var role = await _unitOfWork.RoleRepository.GetRoleByNameAsync(createUserDto.Role);
            if (role == null) return BadRequest("Role không hợp lệ.");

            var user = new User
            {
                Email = createUserDto.Email,
                FirstName = createUserDto.FirstName,
                LastName = createUserDto.LastName,
                UserName = createUserDto.Email.Split('@')[0].ToLower(),
                NormalizedUserName = createUserDto.Email.Split('@')[0].ToUpper(),
                NormalizedEmail = createUserDto.Email.ToUpper(),
                Address = createUserDto.Address,
                PhoneNumber = createUserDto.PhoneNumber,
                DateOfBirth = createUserDto.DateOfBirth,
                RoleId = role.Id,
                EmailConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString()
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, createUserDto.Password);

            await _unitOfWork.UserRepository.AddAsync(user);
            await _unitOfWork.SaveAsync(); // Lưu User để lấy ID

            // Tạo cart cho user
            var cart = new Cart
            {
                UserId = user.Id,
                CartItems = new List<CartItem>()
            };
            await _unitOfWork.CartRepository.AddAsync(cart);
            await _unitOfWork.SaveAsync();

            return Ok("Đăng ký tài khoản thành công");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updatedUserDto)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(id);
            if (user == null) return NotFound("Không tìm thấy người dùng.");

            // Only update fields if they are provided in the request
            if (!string.IsNullOrEmpty(updatedUserDto.FirstName))
                user.FirstName = updatedUserDto.FirstName;

            if (!string.IsNullOrEmpty(updatedUserDto.LastName))
                user.LastName = updatedUserDto.LastName;

            if (!string.IsNullOrEmpty(updatedUserDto.Email) && user.Email != updatedUserDto.Email)
            {
                user.Email = updatedUserDto.Email;
            }

            if (!string.IsNullOrEmpty(updatedUserDto.Address))
                user.Address = updatedUserDto.Address;

            if (!string.IsNullOrEmpty(updatedUserDto.PhoneNumber))
                user.PhoneNumber = updatedUserDto.PhoneNumber;

            if (updatedUserDto.DateOfBirth.HasValue)
                user.DateOfBirth = updatedUserDto.DateOfBirth.Value;

            // Check if Role is provided
            if (!string.IsNullOrEmpty(updatedUserDto.Role))
            {
                var role = await _unitOfWork.RoleRepository.GetRoleByNameAsync(updatedUserDto.Role);
                if (role == null) return BadRequest("Role không hợp lệ.");
                user.RoleId = role.Id;
            }

            // Password update (only if provided and confirmed correctly)
            if (!string.IsNullOrEmpty(updatedUserDto.Password) && updatedUserDto.Password == updatedUserDto.PasswordConfirmed)
            {
                user.PasswordHash = _passwordHasher.HashPassword(user, updatedUserDto.Password);

                // Send new password email
                await _emailService.SendEmailAsync(user.Email, "Mật Khẩu Mới",
                    $"Mật khẩu của bạn đã được thay đổi. Mật khẩu mới của bạn là: {updatedUserDto.Password}");
            }
            else if (!string.IsNullOrEmpty(updatedUserDto.Password) && updatedUserDto.Password != updatedUserDto.PasswordConfirmed)
            {
                return BadRequest("Mật khẩu và xác nhận mật khẩu không khớp.");
            }

            _unitOfWork.UserRepository.UpdateAsync(user);
            await _unitOfWork.SaveAsync();

            return Ok("Cập nhật tài khoản thành công.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _unitOfWork.UserRepository.GetByIdAsync(id);
                if (user == null) return NotFound("Không tìm thấy người dùng.");

                // Xóa User và các quan hệ liên quan
                _unitOfWork.UserRepository.DeleteAsync(user);
                await _unitOfWork.SaveAsync();

                return Ok("Xóa tài khoản thành công.");
            }
            catch (Exception ex)
            {
                // Log lỗi (tuỳ chọn)
                Console.WriteLine($"Lỗi khi xóa User: {ex.Message}");
                return StatusCode(500, "Đã xảy ra lỗi trong quá trình xóa tài khoản.");
            }
        }

    }
}
