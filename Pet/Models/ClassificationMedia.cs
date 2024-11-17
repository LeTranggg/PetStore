using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pet.Models
{
    public class ClassificationMedia
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string MediaUrl { get; set; }
        public bool IsImage { get; set; }

        public int ClassificationId { get; set; }
        [ForeignKey("ClassificationId")]
        public Classification Classification { get; set; }
    }
}
