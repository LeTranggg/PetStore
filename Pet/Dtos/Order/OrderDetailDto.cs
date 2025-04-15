namespace Pet.Dtos.Order
{
    public class OrderDetailDto
    {
        public int Id { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public int OrderId { get; set; }
        public int VariantId { get; set; }
        public string VariantName { get; set; } // Tên biến thể để hiển thị
    }
}
