using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Pet.Models
{
    public class Review
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public DateTime DateCreated { get; set; } = DateTime.Now;

        public int ProductId { get; set; }
        [ForeignKey("ProductId")]
        public Product Product { get; set; }
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        [ValidateNever]
        [NotMapped]
        public ICollection<ReviewDetail> ReviewDetails { get; set; }
        [ValidateNever]
        [NotMapped]
        public ICollection<ReviewMedia> ReviewMedias { get; set; }
    }
}
