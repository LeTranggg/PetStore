using Pet.Models;

namespace Pet.Dtos.Shipping
{
    public class ShippingDto
    {
        public int Id { get; set; }
        public string Method { get; set; }
        public decimal Price { get; set; }
    }
}
