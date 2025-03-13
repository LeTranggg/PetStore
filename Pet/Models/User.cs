using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Pet.Models
{
    public class User : IdentityUser<int>
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        [Required]
        [EmailAddress]
        public override string Email { get; set; }
        [Required]
        public DateTime DateOfBirth { get; set; }
        [Required]
        public string Gender { get; set; } = "Male";
        [Required]
        [MaxLength(15)]
        public override string PhoneNumber { get; set; } // Ghi đè từ IdentityUser
        [Required]
        [MaxLength(200)]
        public string Address { get; set; }
        public string? Image { get; set; }
        public decimal LoyaltyCoins { get; set; } = 0;
        [Required]
        public string Status { get; set; } = "Active";
        [MaxLength(200)]
        public string? BlockReason { get; set; }

        public Cart Cart { get; set; }

        public ICollection<Post> Posts { get; set; }
        public ICollection<Review> Reviews { get; set; }
        public ICollection<Order> Orders { get; set; }
    }
}
