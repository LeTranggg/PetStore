using System.ComponentModel.DataAnnotations;

namespace Pet.Dtos
{
    public class CreateProductDto
    {
        [Required]
        public string Name { get; set; }
        public string? Description { get; set; }
        [Required]
        public decimal Price { get; set; }

        [Required]
        public string Category { get; set; }
        [Required]
        public string Supplier { get; set; }
    }
}
