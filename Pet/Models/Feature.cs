using System.ComponentModel.DataAnnotations;

namespace Pet.Models
{
    public class Feature
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } // "Màu sắc", "Size"
        public ICollection<Value> Values { get; set; }
    }
}
