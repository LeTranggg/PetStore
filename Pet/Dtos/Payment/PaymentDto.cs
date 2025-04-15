using Pet.Models;
using System.ComponentModel.DataAnnotations;

namespace Pet.Dtos.Payment
{
    public class PaymentDto
    {
        public int Id { get; set; }
        public PaymentMethod Method { get; set; }
        public bool IsSuccessful { get; set; }
        public decimal Amount { get; set; }
        public string TransactionId { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime? DateConfirmed { get; set; }
        public int OrderId { get; set; }
    }
}
