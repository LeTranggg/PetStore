using System.ComponentModel.DataAnnotations;

namespace Pet.Dtos
{
    public class UpdateClassificationDto
    {
        public string? Value { get; set; }
        public string? Name { get; set; }
        public decimal? Price { get; set; }
        public int? Quantity { get; set; }
        public decimal? Weight { get; set; }
        public decimal? Height { get; set; }
        public decimal? Length { get; set; }
        public decimal? Width { get; set; }
        public string? Product { get; set; }
    }
}
