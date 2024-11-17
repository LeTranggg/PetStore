using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Pet.Models
{
    public class User : IdentityUser<int>
    {
        [Key]
        public int Id { get; set; }
        [Required, EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; }
        [Required, MaxLength(50)]
        public string LastName { get; set; }
        [Required, MaxLength(50)]
        public string FirstName { get; set; }
        [MaxLength(15, ErrorMessage = "Phone number cannot exceed 15 characters.")]
        public string PhoneNumber { get; set; }
        [Required]
        public DateTime DateOfBirth { get; set; }
        [Required]
        public string Address { get; set; }
        public decimal LoyaltyCoin { get; set; }
        public string? Photo { get; set; }
        public bool IsBlock { get; set; } = false;
        public string? Reason { get; set; }

        public int RoleId { get; set; }
        [ForeignKey("RoleId")]
        public Role Role { get; set; }

        [ValidateNever]
        public Cart Cart { get; set; }

        [ValidateNever]
        public ICollection<Order> Orders { get; set; }
        [ValidateNever]
        public ICollection<Review> Reviews { get; set; }
    }
}
