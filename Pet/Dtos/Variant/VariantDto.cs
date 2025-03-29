using Pet.Dtos.Value;
using System.ComponentModel.DataAnnotations;

namespace Pet.Dtos.Variant
{
    public class VariantDto
    {
        public int Id { get; set; }
        public decimal AdditionalFee { get; set; }
        public int Quantity { get; set; }
        public string? Image { get; set; }
        public decimal Weight { get; set; }
        public decimal Height { get; set; }
        public decimal Width { get; set; }
        public decimal Length { get; set; }
        public string Product { get; set; }
        public List<ValueDto> Values { get; set; }
        public string DisplayName => string.Join(" + ", Values.Select(v => v.Name)); // Tính toán tổ hợp
    }
}
