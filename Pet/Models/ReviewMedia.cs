using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pet.Models
{
    public class ReviewMedia
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string MediaUrl { get; set; } 
        public bool IsImage { get; set; }
        
        public int ReviewId { get; set; }
        [ForeignKey("ReviewId")]
        public Review Review { get; set; }
    }
}
