using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pet.Models
{
    public class Supplier
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        [Required]
        [Phone]
        [MaxLength(15)]
        public string PhoneNumber { get; set; }
        [Required]
        [MaxLength(200)]
        public string Address { get; set; }
        public string? Image { get; set; }

        public ICollection<Product> Products { get; set; }
    }
}
