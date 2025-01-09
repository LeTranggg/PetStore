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
        public string? Comment { get; set; }
        public string? ImageUrl { get; set; }

        public int ReviewId { get; set; }
        [ForeignKey("ReviewId")]
        public Review Review { get; set; }
        public int ClassificationId { get; set; }
        [ForeignKey("ClassificationId")]
        public Classification Classification { get; set; }
    }
}
