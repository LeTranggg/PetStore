using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pet.Models
{
    public enum PaymentMethod
    {
        Cash,
        Stripe
    }

    public class Payment
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(50)]
        public PaymentMethod Method { get; set; } = PaymentMethod.Cash;
        public bool IsSuccessful { get; set; } = false;
        public decimal Amount { get; set; }
        public string? TransactionId { get; set; } // giao dịch Stripe
        public DateTime DateCreated { get; set; } = DateTime.UtcNow;
        public DateTime? DateConfirmed { get; set; }

        public int OrderId { get; set; }
        [ForeignKey("OrderId")]
        public Order Order { get; set; }
    }
}
