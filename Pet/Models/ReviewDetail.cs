using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Pet.Models
{
    public class ReviewDetail
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [Range(1, 5)]
        public byte Rating { get; set; }
        [MaxLength(500)]
        public string? Comment { get; set; }
        public string? Image { get; set; }

        public int ReviewId { get; set; }
        [ForeignKey("ReviewId")]
        public Review Review { get; set; }
        public int VariantId { get; set; }
        [ForeignKey("VariantId")]
        public Variant Variant { get; set; }
    }
}
