using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Pet.Models
{
    public class Cart
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public decimal TotalPrice
        {
            get { return CartItems.Sum(ci => ci.Price); }
        }

        public int? UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        public ICollection<CartItem> CartItems { get; set; }
    }
}
