using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Pet.Models
{
    public class Classification
    {
        [Key]
        public int Id { get; set; }
        [Required, MaxLength(50)]
        public string Value { get; set; }
        [Required, MaxLength(50)]
        public string Name { get; set; }
        [Required]
        public decimal Price { get; set; }
        [Required, Range(0, 5000)]
        public int Quantity { get; set; }
        [Required]
        public decimal Weight { get; set; }
        [Required]
        public decimal Height { get; set; }
        [Required]
        public decimal Length { get; set; }
        [Required]
        public decimal Width { get; set; }

        public int ProductId { get; set; }
        [ForeignKey("ProductId")]
        public Product Product { get; set; }

        [ValidateNever]
        [NotMapped]
        public ICollection<OrderDetail> OrderDetails { get; set; }
        [ValidateNever]
        [NotMapped]
        public ICollection<ReviewDetail> ReviewDetails { get; set; }
        [ValidateNever]
        [NotMapped]
        public ICollection<CartItem> CartItems { get; set; }
        [ValidateNever]
        [NotMapped]
        public ICollection<ClassificationMedia> ClassificationMedias { get; set; }
    }
}
