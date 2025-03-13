using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Pet.Datas;
using System.Text.Json.Serialization;

namespace Pet.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }
        public DateTime DateCreated { get; set; } = DateTime.Now;
        [Required]
        public decimal CoinEarned { get; set; }
        [Required]
        [MaxLength(200)]
        public string ShippingAddress { get; set; }
        [Required]
        [MaxLength(100)]
        public string RecipientName { get; set; }
        [Required]
        [Phone]
        [MaxLength(15)]
        public string RecipientPhone { get; set; }
        [Required]
        public decimal TotalPrice { get; set; }
        [Required]
        public string Status { get; set; } = "Pending";
        [MaxLength(200)]
        public string? CancelReason { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }
        public int ShippingId { get; set; }
        [ForeignKey("ShippingId")]
        public Shipping Shipping { get; set; }
        public int PaymentId { get; set; }
        [ForeignKey("PaymentId")]
        public Payment Payment { get; set; }

        public ICollection<OrderDetail> OrderDetails { get; set; }

        public void CalculateTotalPrice()
        {
            decimal price = OrderDetails.Sum(od => od.Price);
            decimal shippingCost = Shipping.CalculateShippingCost(
                OrderDetails.Sum(od => od.Quantity * od.Variant.Weight),
                OrderDetails.Max(od => od.Variant.Length),
                OrderDetails.Max(od => od.Variant.Width),
                OrderDetails.Max(od => od.Variant.Height)
            );
            TotalPrice = price + shippingCost;
        }

        public int CalculateLoyaltyCoins(decimal finalPrice)
        {
            if (finalPrice >= 100000)
            {
                return ((int)(finalPrice / 100000)) * 100; //Divide by 100 to calculate the number of times 100 is in finalPrice
            }
            return 0;
        }

        //Coins accumulated after each order
        public void ApplyLoyaltyCoins(bool IsUse)
        {
            decimal finalPrice = TotalPrice;
            if (IsUse)
            {
                finalPrice -= User.LoyaltyCoins;
                if (finalPrice < 0)
                    finalPrice = 0; //Ensure the order value is not negative
                User.LoyaltyCoins = 0;
            }
            CoinEarned = CalculateLoyaltyCoins(finalPrice); //Calculate the new number of coins to receive based on the final order price
            if (Status == "Delivered" && CoinEarned > 0)
            {
                User.LoyaltyCoins += CoinEarned;
            }
        }

    }
}
