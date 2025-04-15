using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Pet.Dtos.Cart
{
    public class CartItemDto
    {
        public int Id { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public int VariantId { get; set; }
        public string ProductName { get; set; } // Tên sản phẩm từ Variant
        public string VariantDisplayName { get; set; }
    }
}
