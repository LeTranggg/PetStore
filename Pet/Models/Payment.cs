using Pet.Data;
using System.ComponentModel.DataAnnotations;

namespace Pet.Models
{
    public class Payment
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public decimal Price { get; set; }
        [Required]
        public PaymentMethod PaymentMethod { get; set; }
        [Required]
        public DateTime DateCreated { get; set; } = DateTime.Now;
        public bool IsSuccessful { get; set; }
    }
}
