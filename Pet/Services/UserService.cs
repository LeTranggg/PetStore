using AutoMapper;
using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Identity;
using Pet.Datas;
using Pet.Models;
using Pet.Services.IServices;
using Microsoft.EntityFrameworkCore;
using System.Text;
using Pet.Dtos.User;

namespace Pet.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;
        private readonly Cloudinary _cloudinary;

        public UserService(ApplicationDbContext context, UserManager<User> userManager, IMapper mapper, IEmailService emailService, Cloudinary cloudinary)
        {
            _context = context;
            _userManager = userManager;
            _mapper = mapper;
            _emailService = emailService;
            _cloudinary = cloudinary;
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

        // Tạo mật khẩu cho user 
        private string GenerateRandomPassword()
        {
            const string upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string lowerCase = "abcdefghijklmnopqrstuvwxyz";
            const string digits = "0123456789";
            const string specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
            var random = new Random();

            var password = new StringBuilder();
            password.Append(upperCase[random.Next(upperCase.Length)]);
            password.Append(lowerCase[random.Next(lowerCase.Length)]);
            password.Append(digits[random.Next(digits.Length)]);
            password.Append(specialChars[random.Next(specialChars.Length)]);

            const string allChars = upperCase + lowerCase + digits + specialChars;
            while (password.Length < 8)
            {
                password.Append(allChars[random.Next(allChars.Length)]);
            }

            // Xáo trộn mật khẩu
            var passwordArray = password.ToString().ToCharArray();
            for (int i = passwordArray.Length - 1; i > 0; i--)
            {
                int j = random.Next(0, i + 1);
                (passwordArray[i], passwordArray[j]) = (passwordArray[j], passwordArray[i]);
            }

            return new string(passwordArray);
        }

        // Xem danh sách users
        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _context.Users.Include(u => u.Role).ToListAsync();
            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        // Xem chi tiết user theo ID
        public async Task<UserDto> GetUserByIdAsync(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) throw new KeyNotFoundException($"User with ID {id} not found.");
            await _context.Entry(user).Reference(u => u.Role).LoadAsync();
            return _mapper.Map<UserDto>(user);
        }

        // Tạo user mới
        public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
        {
            if (await _userManager.FindByEmailAsync(createUserDto.Email) != null)
                throw new InvalidOperationException($"Email {createUserDto.Email} already exists.");

            var password = GenerateRandomPassword();
            var user = _mapper.Map<User>(createUserDto);

            user.UserName = createUserDto.Email;
            user.NormalizedUserName = createUserDto.Email.ToUpper();
            user.NormalizedEmail = createUserDto.Email.ToUpper();
            user.EmailConfirmed = true;
            user.LockoutEnabled = false;
            user.LockReason = LockReason.None;
            user.RoleId = createUserDto.RoleId;

            if (createUserDto.Image != null)
                user.Image = await UploadImageToCloudinaryAsync(createUserDto.Image);

            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded) throw new InvalidOperationException(result.Errors.First().Description);

            // Tạo giỏ hàng nếu là khách hàng
            var role = await _context.Roles.FindAsync(createUserDto.RoleId);
            if (role.Name == "Customer")
            {
                var cart = new Cart { UserId = user.Id, CartItems = new List<CartItem>() };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            // Gửi email chứa mật khẩu
            await _emailService.SendEmailAsync(user.Email, "Your Account Password", $"Your password is: {password}");

            return _mapper.Map<UserDto>(user);
        }

        // Cập nhật user
        public async Task<UserDto> UpdateUserAsync(int id, UpdateUserDto updateUserDto)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) throw new KeyNotFoundException($"User with ID {id} not found.");

            if (updateUserDto.Name != null) user.Name = updateUserDto.Name;
            if (updateUserDto.Email != null)
            {
                user.Email = updateUserDto.Email;
                user.UserName = updateUserDto.Email;
                user.NormalizedUserName = updateUserDto.Email.ToUpper();
                user.NormalizedEmail = updateUserDto.Email.ToUpper();
            }
            if (updateUserDto.DateOfBirth.HasValue) user.DateOfBirth = updateUserDto.DateOfBirth.Value;
            if (updateUserDto.Gender.HasValue) user.Gender = updateUserDto.Gender.Value;
            if (updateUserDto.PhoneNumber != null) user.PhoneNumber = updateUserDto.PhoneNumber;
            if (updateUserDto.Address != null) user.Address = updateUserDto.Address;
            if (updateUserDto.Image != null) user.Image = await UploadImageToCloudinaryAsync(updateUserDto.Image);
            if (updateUserDto.RoleId.HasValue) user.RoleId = updateUserDto.RoleId.Value;

            // Không cho phép cập nhật LockoutEnabled qua UpdateUserAsync
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) throw new InvalidOperationException(result.Errors.First().Description);

            await _context.Entry(user).Reference(u => u.Role).LoadAsync();
            return _mapper.Map<UserDto>(user);
        }

        // Xoá user
        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return false;

            var result = await _userManager.DeleteAsync(user);
            return result.Succeeded;
        }

        // Khoá user
        public async Task<UserDto> LockUserAsync(int id, LockReason reason)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) throw new KeyNotFoundException($"User with ID {id} not found.");

            var blockDurations = new Dictionary<LockReason, int>
            {
                { LockReason.None, 0 },
                { LockReason.Spam, 1 },
                { LockReason.Harassment, 14 },
                { LockReason.Fraud, 30 },
                { LockReason.Violation, 60 },
                { LockReason.Deletion, -1 }
            };
            user.LockReason = reason;
            user.LockoutEnabled = reason != LockReason.None;

            // Sử dụng giờ địa phương (+7) để tính LockoutEnd
            var localTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"); // +7, Việt Nam
            var localNow = TimeZoneInfo.ConvertTimeFromUtc(DateTimeOffset.UtcNow.UtcDateTime, localTimeZone);
            
            if (blockDurations.TryGetValue(reason, out int days))
            {
                if (days == -1) user.LockoutEnd = DateTimeOffset.MaxValue; // Khoá vô thời hạn
                else
                {
                    user.LockoutEnd = reason == LockReason.None
                    ? null
                    : new DateTimeOffset(localNow.AddDays(days), localTimeZone.GetUtcOffset(localNow));
                    Console.WriteLine($"User {id} locked at {localNow}. LockoutEnd set to: {user.LockoutEnd}");
                }
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) throw new InvalidOperationException(result.Errors.First().Description);
            await _context.Entry(user).Reference(u => u.Role).LoadAsync();

            if (result.Succeeded && user.LockoutEnd != null)
            {
                await _emailService.SendEmailAsync(user.Email, "Account Locked",
                    $"Your account has been locked until {user.LockoutEnd.Value:yyyy-MM-dd HH:mm:ss} due to: {reason}");
            }
            return _mapper.Map<UserDto>(user);
        }

        // Mở khoá user
        public async Task<UserDto> UnlockUserAsync(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) throw new KeyNotFoundException($"User with ID {id} not found.");

            user.LockoutEnabled = false;
            user.LockoutEnd = null;
            user.LockReason = LockReason.None;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) throw new InvalidOperationException(result.Errors.First().Description);
            await _context.Entry(user).Reference(u => u.Role).LoadAsync();

            // Gửi email thông báo
            if (result.Succeeded)
            {
                await _emailService.SendEmailAsync(user.Email, "Account Unlocked",
                    "Your account has been unlocked and you can now log in again.");
            }
            return _mapper.Map<UserDto>(user);
        }

        // Đặt lại mật khẩu
        public async Task<string> ResetPasswordAsync(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) throw new KeyNotFoundException($"User with ID {id} not found.");

            var newPassword = GenerateRandomPassword();
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
            if (!result.Succeeded) throw new InvalidOperationException(result.Errors.First().Description);

            await _emailService.SendEmailAsync(user.Email, "Your New Password", $"Your new password is: {newPassword}");
            return newPassword;
        }
    }
}
