using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pet.Models
{
    public class Role : IdentityRole<int>
    {
        [MaxLength(50)]
        public override string Name { get; set; } // Ghi đè từ IdentityRole

        public ICollection<User> Users { get; set; }
    }
}
