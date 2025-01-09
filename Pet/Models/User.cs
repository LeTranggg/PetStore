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
        [Required]
        public string Email { get; set; }
        [Required]
        public string LastName { get; set; }
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string PhoneNumber { get; set; }
        [Required]
        public DateTime DateOfBirth { get; set; }
        [Required]
        public string Address { get; set; }
        public decimal LoyaltyCoin { get; set; }
        public bool IsReport { get; set; } = false;
        public string? Reason { get; set; }
        public string? ImageUrl { get; set; }

        public int RoleId { get; set; }
        [ForeignKey("RoleId")]
        public Role Role { get; set; }

        [ValidateNever]
        public Cart Cart { get; set; }

        [ValidateNever]
        public ICollection<Order> Orders { get; set; }
        [ValidateNever]
        public ICollection<Review> Reviews { get; set; }
        [ValidateNever]
        public ICollection<MyPet> MyPets { get; set; }
        [ValidateNever]
        public ICollection<Blog> Blogs { get; set; }
    }
}
