using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pet.Models
{
    public class Post
    {
        [Key]
        public int Id { get; set; }
        public DateTime DateCreated { get; set; } = DateTime.UtcNow;
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }
        [Required]
        [MaxLength(2000)]
        public string Content { get; set; }
        public string? Image { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        public ICollection<PostCategory> PostCategories { get; set; }
    }
}
