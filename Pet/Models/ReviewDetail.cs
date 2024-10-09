using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Pet.Models
{
    public class ReviewDetail
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public byte Rating { get; set; }
        [MaxLength(500)]
        public string? Comment { get; set; }
        public bool IsReport { get; set; } = false;
        public string? Reason { get; set; }

        public int ReviewId { get; set; }
        [ForeignKey("ReviewId")]
        public Review Review { get; set; }
        public int ClassificationId { get; set; }
        [ForeignKey("ClassificationId")]
        public Classification Classification { get; set; }
    }
}
