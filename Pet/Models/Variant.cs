using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Pet.Models
{
    public class Variant
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [Range(0, double.MaxValue)]
        public decimal AdditionalFee { get; set; }
        [Required]
        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }
        public string? Image { get; set; }
        [Required]
        [Range(0, double.MaxValue)]
        public decimal Weight { get; set; }
        [Required]
        [Range(0, double.MaxValue)]
        public decimal Height { get; set; }
        [Required]
        [Range(0, double.MaxValue)]
        public decimal Width { get; set; }
        [Required]
        [Range(0, double.MaxValue)]
        public decimal Length { get; set; }

        public int ProductId { get; set; }
        [ForeignKey("ProductId")]
        public Product Product { get; set; }

        public ICollection<VariantValue> VariantValues { get; set; }
        public ICollection<CartItem> CartItems { get; set; }
        public ICollection<OrderDetail> OrderDetails { get; set; }
        public ICollection<ReviewDetail> ReviewDetails { get; set; }
    }
}
