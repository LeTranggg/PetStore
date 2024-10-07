using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pet.Models
{
    public class Supplier
    {
        [Key]
        public int Id { get; set; }
        [Required, EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; }
        [Required, MaxLength(50, ErrorMessage = "Name cannot exceed 50 characters.")]
        public string Name { get; set; }
        [Required, MaxLength(15, ErrorMessage = "Phone number cannot exceed 15 characters.")]
        public string PhoneNumber { get; set; }
        [Required]
        public string Address { get; set; }
        [Required]
        public string Photo { get; set; }

        [ValidateNever]
        [NotMapped]
        public ICollection<Product> Products { get; set; }
    }
}
