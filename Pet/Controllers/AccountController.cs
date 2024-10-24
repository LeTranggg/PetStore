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

        public AccountController(IUnitOfWork unitOfWork, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
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
                Role = user.Role?.Name ?? "No Role Assigned" // Nếu user không có role, trả về mặc định
            });
        }

        // Logout is handled client-side by removing the token
        // but token invalidation could be handled by adjusting the JWT expiration time

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

            if (registerDto.Password != registerDto.PasswordComfirmed)
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
            var frontendUrl = _configuration["Frontend:Url"];
            var confirmationUrl = $"{frontendUrl}/api/account/confirm-email?token={token}&email={user.Email}";

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

    }
}
