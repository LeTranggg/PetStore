using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;

namespace Pet.Models
{
    public class Value
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }

        [ValidateNever]
        public ICollection<ValueClassification> ValueClassifications { get; set; }
    }
}
