using Pet.Datas;
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

        [Required]
        public MediaType MediaType { get; set; }

        public int ClassificationId { get; set; }
        [ForeignKey("ClassificationId")]
        public Classification Classification { get; set; }
    }
}
