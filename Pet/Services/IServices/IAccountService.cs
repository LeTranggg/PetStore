using Pet.Dtos.Account;

namespace Pet.Services.IServices
{
    public interface IAccountService
    {
        Task<string> LoginAsync(LoginDto loginDto);
        Task<string> GoogleLoginAsync(GoogleDto googleDto);
        Task<ProfileDto> GetProfileByIdAsync(int userId);
        Task<ProfileDto> RegisterAsync(RegisterDto registerDto);
        Task ConfirmEmailAsync(string email, string token);
        Task ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto);
        Task ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
        Task ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);
        Task<ProfileDto> UpdateProfileAsync(int userId, UpdateProfileDto updateProfileDto);
        Task<bool> DeleteAccountAsync(int userId);
    }
}
