using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pet.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }
        [Required, RegularExpression(@"^[a-zA-Z0-9 ]*$", ErrorMessage = "Name does not contain special characters.")] // ^: start, [a-zA-Z0-9 ]: contain, *: 0 or n occurrences, $: end
        public string Name { get; set; }

        [ValidateNever]
        [NotMapped]
        public ICollection<Product> Products { get; set; }
    }
}
