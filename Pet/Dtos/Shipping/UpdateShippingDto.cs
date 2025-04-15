using Pet.Models;

namespace Pet.Dtos.Shipping
{
    public class UpdateShippingDto
    {
        public ShippingMethod? Method { get; set; }
        public decimal? Price { get; set; }
    }
}
