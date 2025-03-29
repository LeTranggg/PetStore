using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Pet.Dtos.Variant;

namespace Pet.Dtos.Product
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string? Image { get; set; }
        public decimal Price { get; set; }
        public string Category { get; set; }
        public string Supplier { get; set; }
        public List<VariantDto> Variants { get; set; }
    }
}
