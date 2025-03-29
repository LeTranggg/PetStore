namespace Pet.Dtos.Product
{
    public class UpdateProductDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public IFormFile? Image { get; set; }
        public decimal? Price { get; set; }
        public int? CategoryId { get; set; }
        public int? SupplierId { get; set; }
    }
}
