using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pet.Models
{
    public class Value
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } // "Hồng", "XL"

        public int FeatureId { get; set; }
        [ForeignKey("FeatureId")]
        public Feature Feature { get; set; }

        public ICollection<VariantValue> VariantValues { get; set; }
    }
}
