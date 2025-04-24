using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Pet.Models
{
    public class CartItem
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }
        [Required]
        public decimal UnitPrice { get; set; } // Trường lưu đơn giá
        public decimal Price
        {
            get { return Quantity * UnitPrice; } // Tính tổng giá dựa trên UnitPrice
        }

        public int CartId { get; set; }
        [ForeignKey("CartId")]
        public Cart Cart { get; set; }
        public int VariantId { get; set; }
        [ForeignKey("VariantId")]
        public Variant Variant { get; set; }
    }
}
