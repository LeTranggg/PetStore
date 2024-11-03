using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using NuGet.Protocol.Plugins;
using Pet.Dtos;
using Pet.Models;
using Pet.Repositories.IRepositories;
using Pet.Services.IServices;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Pet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public AccountController(IUnitOfWork unitOfWork, IConfiguration configuration, IPasswordHasher<User> passwordHasher, IEmailService emailService)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _passwordHasher = passwordHasher;
            _emailService = emailService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            var user = await _unitOfWork.UserRepository.GetUserByEmailAsync(request.Email);
            if (user == null)
            {
                // Log khi không tìm thấy user
                return Unauthorized("Invalid email or password");
            }

            if (!await _unitOfWork.UserRepository.ValidatePasswordAsync(user, request.Password))
            {
                // Log khi mật khẩu không chính xác
                return Unauthorized("Invalid email or password");
            }
            if (!user.EmailConfirmed)
            {
                return BadRequest("Vui lòng xác nhận email trước khi đăng nhập.");
            }

            // Generate JWT Token
            var token = GenerateJwtToken(user);

            // Trả về token và role của người dùng
            return Ok(new
            {
                Token = token,
                user = new
                {
                    Role = user.Role?.Name ?? "No Role Assigned", // Nếu user không có role, trả về mặc định
                    id = user.Id,
                    email = user.Email
                    // Thêm các thông tin user khác nếu cần
                }
            });
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]));
            //Đây là một loại khóa dùng để mã hóa và giải mã các JSON Web Tokens (JWT)
            //_configuration["Jwt:Key"]: Lấy giá trị của khóa bảo mật token từ file cấu hình
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256); //Để ký token và đảm bảo token hợp lệ và không bị chỉnh sửa

            var claims = new List<Claim> //Là các thông tin về người dùng được nhúng vào token để xác định danh tính của người dùng khi gửi yêu cầu đến server
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email)
            };

            if (!string.IsNullOrEmpty(user.Role?.Name))
            {
                claims.Add(new Claim(ClaimTypes.Role, user.Role.Name));
            }
            else
            {
                Console.WriteLine("Role không hợp lệ hoặc chưa được gán.");
            }

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddHours(1), // Token valid for 1 hour
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (registerDto.Password != registerDto.PasswordConfirmed)
                return BadRequest("Mật khẩu không khớp.");

            var existingUser = await _unitOfWork.UserRepository.GetUserByEmailAsync(registerDto.Email);
            if (existingUser != null) return BadRequest("Email đã được sử dụng.");

            // Lấy role "Customer" từ database
            var role = await _unitOfWork.RoleRepository.GetRoleByNameAsync("Customer");
            if (role == null) return BadRequest("Role không hợp lệ.");

            var user = new User
            {
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                UserName = registerDto.Email.Split('@')[0].ToLower(),
                NormalizedUserName = registerDto.Email.Split('@')[0].ToUpper(),
                NormalizedEmail = registerDto.Email.ToUpper(),
                Address = registerDto.Address,
                PhoneNumber = registerDto.PhoneNumber,
                DateOfBirth = registerDto.DateOfBirth,
                RoleId = role.Id,
                EmailConfirmed = false,
                SecurityStamp = Guid.NewGuid().ToString(),
                IsBlock = false
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, registerDto.Password);

            await _unitOfWork.UserRepository.AddAsync(user);
            await _unitOfWork.SaveAsync();

            // Generate confirmation token and send email
            var token = user.SecurityStamp;
            var backendUrl = _configuration["Backend:Url"]; // Add this to AppSettings.json
            var frontendUrl = _configuration["Frontend:Url"];
            var confirmationUrl = $"{backendUrl}/api/account/confirm-email?token={token}&email={user.Email}&redirectUrl={frontendUrl}";

            await _emailService.SendEmailAsync(user.Email, "Xác Nhận Email",
                $"Vui lòng xác nhận email của bạn bằng cách nhấp vào <a href='{confirmationUrl}'>đây</a>.");

            return Ok("Đăng ký tài khoản thành công! Vui lòng kiểm tra email để xác nhận.");
        }

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string token, [FromQuery] string email)
        {
            var user = await _unitOfWork.UserRepository.GetUserByEmailAsync(email);
            if (user == null) return NotFound("Người dùng không tồn tại.");
            if (user.EmailConfirmed) return BadRequest("Email đã được xác nhận trước đó.");

            if (token != user.SecurityStamp)
                return BadRequest("Token không hợp lệ.");

            user.EmailConfirmed = true;
            _unitOfWork.UserRepository.UpdateAsync(user);
            await _unitOfWork.SaveAsync();

            return Ok("Email đã được xác nhận thành công!");
        }

        [HttpGet("profile/{id}")]
        public async Task<IActionResult> GetProfile(int id)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(id);
            if (user == null) return NotFound("User not found.");

            return Ok(new
            {
                user.Email,
                user.FirstName,
                user.LastName,
                user.PhoneNumber,
                user.Address,
                user.DateOfBirth
            });
        }

        [HttpPut("profile/{id}")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileDto updateProfileDto)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(id);
            if (user == null) return NotFound("User not found.");

            if (!string.IsNullOrEmpty(updateProfileDto.Email) && user.Email != updateProfileDto.Email)
            {
                user.Email = updateProfileDto.Email;
                user.EmailConfirmed = false;

                // Send confirmation email
                var token = user.SecurityStamp;
                var backendUrl = _configuration["Backend:Url"];
                var frontendUrl = _configuration["Frontend:Url"];
                var confirmationUrl = $"{backendUrl}/api/account/confirm-email?token={token}&email={user.Email}&redirectUrl={frontendUrl}";

                await _emailService.SendEmailAsync(user.Email, "Xác Nhận Email",
                    $"Vui lòng xác nhận email của bạn bằng cách nhấp vào <a href='{confirmationUrl}'>đây</a>.");
            }

            if (!string.IsNullOrEmpty(updateProfileDto.FirstName))
                user.FirstName = updateProfileDto.FirstName;

            if (!string.IsNullOrEmpty(updateProfileDto.LastName))
                user.LastName = updateProfileDto.LastName;

            if (!string.IsNullOrEmpty(updateProfileDto.PhoneNumber))
                user.PhoneNumber = updateProfileDto.PhoneNumber;

            if (updateProfileDto.DateOfBirth.HasValue)
                user.DateOfBirth = updateProfileDto.DateOfBirth.Value;

            if (!string.IsNullOrEmpty(updateProfileDto.Address))
                user.Address = updateProfileDto.Address;

            _unitOfWork.UserRepository.UpdateAsync(user);
            await _unitOfWork.SaveAsync();

            return Ok("Profile updated successfully.");
        }

        [HttpPut("change-password/{id}")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordDto changePasswordDto)
        {
            if (changePasswordDto.NewPassword != changePasswordDto.ConfirmNewPassword)
                return BadRequest("New passwords do not match.");

            var user = await _unitOfWork.UserRepository.GetByIdAsync(id);
            if (user == null) return NotFound("User not found.");

            var passwordVerificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, changePasswordDto.CurrentPassword);
            if (passwordVerificationResult == PasswordVerificationResult.Failed)
                return BadRequest("Current password is incorrect.");

            user.PasswordHash = _passwordHasher.HashPassword(user, changePasswordDto.NewPassword);
            _unitOfWork.UserRepository.UpdateAsync(user);
            await _unitOfWork.SaveAsync();

            return Ok("Password changed successfully.");
        }

        [HttpGet("reset-password")]
        public IActionResult ResetPasswordRedirect([FromQuery] string token, [FromQuery] string email, [FromQuery] string redirectUrl)
        {
            return Redirect($"{redirectUrl}/reset-pass?token={token}&email={email}");
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            var user = await _unitOfWork.UserRepository.GetUserByEmailAsync(resetPasswordDto.Email);
            if (user == null)
            {
                return BadRequest("Token không hợp lệ hoặc đã hết hạn.");
            }

            // Kiểm tra token
            if (user.SecurityStamp != resetPasswordDto.Token)
            {
                return BadRequest("Token không hợp lệ hoặc đã hết hạn.");
            }

            // Kiểm tra password mới và confirm password
            if (resetPasswordDto.NewPassword != resetPasswordDto.ConfirmNewPassword)
            {
                return BadRequest("Mật khẩu mới không khớp.");
            }

            // Cập nhật mật khẩu mới
            user.PasswordHash = _passwordHasher.HashPassword(user, resetPasswordDto.NewPassword);

            // Tạo security stamp mới để vô hiệu hóa token cũ
            user.SecurityStamp = Guid.NewGuid().ToString();

            _unitOfWork.UserRepository.UpdateAsync(user);
            await _unitOfWork.SaveAsync();

            return Ok("Đặt lại mật khẩu thành công.");
        }

        [HttpGet("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromQuery] string email)
        {
            var user = await _unitOfWork.UserRepository.GetUserByEmailAsync(email);
            if (user == null)
                return NotFound("Người dùng không tồn tại.");

            // Tạo token reset mật khẩu
            user.SecurityStamp = Guid.NewGuid().ToString();
            await _unitOfWork.UserRepository.UpdateAsync(user);
            await _unitOfWork.SaveAsync();

            // Tạo link reset mật khẩu
            var backendUrl = _configuration["Backend:Url"];
            var frontendUrl = _configuration["Frontend:Url"];
            var resetUrl = $"{backendUrl}/api/account/reset-password?token={user.SecurityStamp}&email={user.Email}&redirectUrl={frontendUrl}";

            // Gửi email chứa link reset mật khẩu
            await _emailService.SendEmailAsync(user.Email, "Đặt lại mật khẩu",
                $"Vui lòng đặt lại mật khẩu của bạn bằng cách nhấp vào <a href='{resetUrl}'>đây</a>.");

            return Ok("Link đặt lại mật khẩu đã được gửi qua email.");
        }
    }
}
