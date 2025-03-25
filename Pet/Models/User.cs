using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Pet.Models
{
    public enum Gender
    {
        Male,
        Female
    }

    public enum LockReason
    {
        None,       
        Spam,         // Spam hoặc quảng cáo
        Harassment,   // Quấy rối, lạm dụng
        Fraud,        // Gian lận, giả mạo
        Violation,    // Vi phạm điều khoản
        Deletion,     // Xoá tài khoản
    }

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
        public Gender Gender { get; set; } = Gender.Male;
        [Required]
        [MaxLength(15)]
        public override string PhoneNumber { get; set; } // Ghi đè từ IdentityUser
        [Required]
        [MaxLength(200)]
        public string Address { get; set; }
        public string? Image { get; set; }
        public decimal LoyaltyCoins { get; set; } = 0;
        [MaxLength(200)]
        public LockReason LockReason { get; set; } = LockReason.None;

        public Cart Cart { get; set; }
        public int RoleId { get; set; }
        [ForeignKey("RoleId")]
        public Role Role { get; set; }

        public ICollection<Post> Posts { get; set; }
        public ICollection<Review> Reviews { get; set; }
        public ICollection<Order> Orders { get; set; }
    }
}
