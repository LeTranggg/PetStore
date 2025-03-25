using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pet.Models
{
    public enum PaymentMethod
    {
        Cash,
        Card,
        VNPay,
        PayPall
    }

    public class Payment
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(50)]
        public PaymentMethod Method { get; set; } = PaymentMethod.Cash;
        public bool IsSuccessfull { get; set; } = false;

        public ICollection<Order> Orders { get; set; }
    }
}
