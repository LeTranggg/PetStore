using Pet.Models;

namespace Pet.Dtos.User
{
    public class UpdateUserDto
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public Gender? Gender { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public IFormFile? Image { get; set; }
        public int? RoleId { get; set; }
    }
}
