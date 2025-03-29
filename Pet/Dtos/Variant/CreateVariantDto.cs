namespace Pet.Dtos.Variant
{
    public class CreateVariantDto
    {
        public decimal AdditionalFee { get; set; }
        public int Quantity { get; set; }
        public IFormFile? Image { get; set; }
        public decimal Weight { get; set; }
        public decimal Height { get; set; }
        public decimal Width { get; set; }
        public decimal Length { get; set; }
        public int ProductId { get; set; }
        public List<int> ValueIds { get; set; } // Danh sách ID của Value (Hồng, XL)
    }
}
