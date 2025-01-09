using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Pet.Models
{
    public class Classification
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public decimal Price { get; set; }
        [Required]
        public int Quantity { get; set; }
        [Required]
        public decimal Weight { get; set; }
        [Required]
        public decimal Height { get; set; }
        [Required]
        public decimal Length { get; set; }
        [Required]
        public decimal Width { get; set; }
        public string? ImageUrl { get; set; }

        public int ProductId { get; set; }
        [ForeignKey("ProductId")]
        public Product Product { get; set; }

        [ValidateNever]
        public ICollection<OrderDetail> OrderDetails { get; set; }
        [ValidateNever]
        public ICollection<ReviewDetail> ReviewDetails { get; set; }
        [ValidateNever]
        public ICollection<CartItem> CartItems { get; set; }
        [ValidateNever]
        public ICollection<ValueClassification> ValueClassifications { get; set; }
    }
}
