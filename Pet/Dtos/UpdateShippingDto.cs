using System.ComponentModel.DataAnnotations;

namespace Pet.Dtos
{
    public class UpdateShippingDto
    {
        public string? Name { get; set; }
        public decimal? Price { get; set; }
    }
}
