using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pet.Models
{
    public class Role : IdentityRole<int>
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }

        [ValidateNever]
        public ICollection<User> Users { get; set; }
    }
}
