using Pet.Models;

namespace Pet.Dtos.User
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string? Image { get; set; }
        public decimal LoyaltyCoins { get; set; }
        public bool LockoutEnabled { get; set; }
        public DateTimeOffset? LockoutEnd { get; set; }
        public LockReason LockReason { get; set; }
        public string Role { get; set; }
    }
}
