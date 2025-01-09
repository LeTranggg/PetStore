using Pet.Models;

namespace Pet.Dtos
{
    public class PaymentDto
    {
        public bool ByCash { get; set; }
        public Order Order { get; set; }
    }
}
