using AutoMapper;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Pet.Datas;
using Pet.Dtos.Account;
using Pet.Models;
using Pet.Services.IServices;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Pet.Services
{
    public class AccountService : IAccountService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;
        private readonly Cloudinary _cloudinary;
        private readonly IConfiguration _configuration;

        public AccountService( UserManager<User> userManager, IEmailService emailService, 
            IMapper mapper, ApplicationDbContext context, Cloudinary cloudinary, IConfiguration configuration)
        {
            _userManager = userManager;
            _emailService = emailService;
            _configuration = configuration;
            _context = context;
            _cloudinary = cloudinary;
            _mapper = mapper;
        }

        // Tải ảnh lên Cloudinary
        private async Task<string> UploadImageToCloudinaryAsync(IFormFile image)
        {
            if (image == null) return null;

            using var stream = image.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(image.FileName, stream),
                PublicId = Guid.NewGuid().ToString()
            };
            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            return uploadResult.SecureUrl.ToString();
        }

        // Tạo token
        private string GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "Customer")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(1), // Thời gian token hết hạn
                signingCredentials: creds);

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            return tokenString;
        }

        // Đăng nhập bằng email
        public async Task<TokenResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null || !user.EmailConfirmed)
                throw new UnauthorizedAccessException("Invalid credentials or email not confirmed.");

            // Kiểm tra trạng thái khóa tài khoản
            var localTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"); // +7, Việt Nam
            var localNow = TimeZoneInfo.ConvertTimeFromUtc(DateTimeOffset.UtcNow.UtcDateTime, localTimeZone);
            if (user.LockoutEnabled && user.LockoutEnd.HasValue && user.LockoutEnd > localNow)
                throw new UnauthorizedAccessException("Your account is currently locked. Please try again later or contact support.");

            // Kiểm tra mật khẩu trực tiếp
            var passwordValid = await _userManager.CheckPasswordAsync(user, loginDto.Password);
            if (!passwordValid) throw new UnauthorizedAccessException("Invalid credentials.");

            // Tải thông tin Role
            await _context.Entry(user).Reference(u => u.Role).LoadAsync();

            var token = GenerateJwtToken(user);
            return new TokenResponseDto { Token = token, RefreshToken = null };
        }

        // Đăng nhập bằng Google
        public async Task<TokenResponseDto> GoogleLoginAsync(GoogleDto googleDto)
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(googleDto.Token);
            if (payload == null) throw new UnauthorizedAccessException("Invalid Google token.");

            var user = await _userManager.FindByEmailAsync(payload.Email);
            if (user == null)
            {
                user = new User
                {
                    UserName = payload.Email,
                    Email = payload.Email,
                    EmailConfirmed = true,
                    Name = payload.Name,
                    RoleId = 3 // Role "Customer" có ID = 3
                };
                var result = await _userManager.CreateAsync(user);
                if (!result.Succeeded) throw new InvalidOperationException("Failed to create user from Google login.");

                var cart = new Cart { UserId = user.Id, CartItems = new List<CartItem>() };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Kiểm tra trạng thái khóa tài khoản nếu người dùng đã tồn tại
                var localTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"); // +7, Việt Nam
                var localNow = TimeZoneInfo.ConvertTimeFromUtc(DateTimeOffset.UtcNow.UtcDateTime, localTimeZone);
                if (user.LockoutEnabled && user.LockoutEnd.HasValue && user.LockoutEnd > localNow)
                    throw new UnauthorizedAccessException("Your account is currently locked. Please try again later or contact support.");
            }

            // Tải thông tin Role
            await _context.Entry(user).Reference(u => u.Role).LoadAsync();

            var token = GenerateJwtToken(user);
            return new TokenResponseDto { Token = token, RefreshToken = null };
        }

        // Xem chi tiết profile theo ID
        public async Task<ProfileDto> GetProfileByIdAsync(int userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) throw new KeyNotFoundException($"User with ID {userId} not found.");

            // Tải thông tin Role
            await _context.Entry(user).Reference(u => u.Role).LoadAsync();

            return _mapper.Map<ProfileDto>(user);
        }

        // Đăng ký tài khoản
        public async Task<ProfileDto> RegisterAsync(RegisterDto registerDto)
        {
            if (registerDto.Password != registerDto.ConfirmPassword)
                throw new InvalidOperationException("Passwords do not match.");

            if (await _userManager.FindByEmailAsync(registerDto.Email) != null)
                throw new InvalidOperationException("Email already exists.");

            var user = _mapper.Map<User>(registerDto);
            user.UserName = registerDto.Email;
            user.NormalizedUserName = registerDto.Email.ToUpper();
            user.NormalizedEmail = registerDto.Email.ToUpper();
            user.EmailConfirmed = false;
            user.RoleId = 3;
            user.LockoutEnabled = false;
            user.LockReason = LockReason.None;

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (!result.Succeeded) throw new InvalidOperationException(result.Errors.First().Description);

            var cart = new Cart { UserId = user.Id, CartItems = new List<CartItem>() };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var confirmationLink = $"{_configuration["Frontend:Url"]}/confirm-email?email={user.Email}&token={Uri.EscapeDataString(token)}";
            await _emailService.SendEmailAsync(user.Email, "Confirm Your Email",
                $"Please confirm your email by clicking this link: <a href='{confirmationLink}'>Confirm Email</a>");

            return _mapper.Map<ProfileDto>(user);
        }

        // Xác nhận email
        public async Task ConfirmEmailAsync(string email, string token)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) throw new KeyNotFoundException("User not found.");

            var result = await _userManager.ConfirmEmailAsync(user, token);
            if (!result.Succeeded) throw new InvalidOperationException("Invalid confirmation token.");
        }

        // Quên mật khẩu
        public async Task ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto)
        {
            var user = await _userManager.FindByEmailAsync(forgotPasswordDto.Email);
            if (user == null || !user.EmailConfirmed)
            {
                Console.WriteLine($"User {forgotPasswordDto.Email} not found or not confirmed.");
                return;
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var resetLink = $"{_configuration["Frontend:Url"]}/reset-password?email={user.Email}&token={Uri.EscapeDataString(token)}";
            await _emailService.SendEmailAsync(user.Email, "Reset Your Password",
                $"Please reset your password by clicking this link: <a href='{resetLink}'>Reset Password</a>");
        }

        // Đặt lại mật khẩu
        public async Task ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
        {
            var user = await _userManager.FindByEmailAsync(resetPasswordDto.Email);
            if (user == null) throw new KeyNotFoundException("User not found.");

            if (resetPasswordDto.NewPassword != resetPasswordDto.ConfirmPassword)
                throw new InvalidOperationException("Passwords do not match.");

            var result = await _userManager.ResetPasswordAsync(user, resetPasswordDto.Token, resetPasswordDto.NewPassword);
            if (!result.Succeeded) throw new InvalidOperationException("Invalid reset token or password.");
        }

        // Thay đổi mật khẩu
        public async Task ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) throw new KeyNotFoundException("User not found.");

            var result = await _userManager.ChangePasswordAsync(user, changePasswordDto.OldPassword, changePasswordDto.NewPassword);
            if (!result.Succeeded) throw new InvalidOperationException("Old password is incorrect or new password is invalid.");

            if (changePasswordDto.NewPassword != changePasswordDto.ConfirmPassword)
                throw new InvalidOperationException("Passwords do not match.");
        }

        // Cập nhật profile
        public async Task<ProfileDto> UpdateProfileAsync(int userId, UpdateProfileDto updateProfileDto)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) throw new KeyNotFoundException("User not found.");

            if (updateProfileDto.Name != null) user.Name = updateProfileDto.Name;
            if (updateProfileDto.Email != null)
            {
                user.Email = updateProfileDto.Email;
                user.UserName = updateProfileDto.Email;
                user.NormalizedUserName = updateProfileDto.Email.ToUpper();
                user.NormalizedEmail = updateProfileDto.Email.ToUpper();
            }
            if (updateProfileDto.DateOfBirth.HasValue) user.DateOfBirth = updateProfileDto.DateOfBirth.Value;
            if (updateProfileDto.Gender.HasValue) user.Gender = updateProfileDto.Gender.Value;
            if (updateProfileDto.PhoneNumber != null) user.PhoneNumber = updateProfileDto.PhoneNumber;
            if (updateProfileDto.Address != null) user.Address = updateProfileDto.Address;
            if (updateProfileDto.Image != null) user.Image = await UploadImageToCloudinaryAsync(updateProfileDto.Image);

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) throw new InvalidOperationException("Failed to update profile.");

            return _mapper.Map<ProfileDto>(user);
        }

        // Xoá tài khoản
        public async Task<bool> DeleteAccountAsync(int userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) throw new KeyNotFoundException("User not found.");

            user.LockoutEnabled = true;
            user.LockoutEnd = DateTimeOffset.UtcNow.AddDays(10);
            user.LockReason = LockReason.Deletion;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) throw new InvalidOperationException("Failed to lock account.");

            var supportEmail = _configuration["Smtp:Username"];
            if (string.IsNullOrEmpty(supportEmail))
                throw new InvalidOperationException("SMTP Username not configured in appsettings.json");

            await _emailService.SendEmailAsync(
                to: supportEmail,
                subject: "Account Deletion Request from " + user.Email,
                body: $"User {user.Email} has requested account deletion. The account has been locked and will be permanently deleted after 10 days unless canceled."
            );

            return true;
        }
    }
}
