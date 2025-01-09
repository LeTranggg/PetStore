using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pet.Models
{
    public class MyPet
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        public bool Species { get; set; } = false;
        [Required]
        public string Age { get; set; }
        [Required]
        public bool Gender { get; set;} = false;
        [Required]
        public decimal Weight { get; set;}
        public decimal? Leight { get; set;}
        public decimal? Girth { get; set;}
        public decimal? Neck { get; set;}
        public string? ImageUrl { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

    }
}
