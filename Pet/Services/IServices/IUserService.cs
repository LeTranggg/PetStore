using Pet.Dtos.User;
using Pet.Models;

namespace Pet.Services.IServices
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<UserDto> GetUserByIdAsync(int id);
        Task<UserDto> CreateUserAsync(CreateUserDto createUserDto);
        Task<UserDto> UpdateUserAsync(int id, UpdateUserDto updateUserDto);
        Task<bool> DeleteUserAsync(int id);
        Task<UserDto> LockUserAsync(int id, LockReason reason);
        Task<UserDto> UnlockUserAsync (int id);
        Task<string> ResetPasswordAsync(int id);
    }
}
