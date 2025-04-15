using Pet.Models;

namespace Pet.Dtos.Payment
{
    public class CreatePaymentDto
    {
        public PaymentMethod Method { get; set; }
        public decimal Amount { get; set; }
        public int OrderId { get; set; }
    }
}
