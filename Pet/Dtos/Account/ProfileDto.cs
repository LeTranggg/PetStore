using Pet.Models;

namespace Pet.Dtos.Account
{
    public class ProfileDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string? Image { get; set; }
        public decimal LoyaltyCoins { get; set; }
    }
}
