using Pet.Models;

namespace Pet.Dtos.Shipping
{
    public class CreateShippingDto
    {
        public ShippingMethod Method { get; set; }
        public decimal Price { get; set; }
    }
}
