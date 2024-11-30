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
        [Required]
        public DateTime DateCreated { get; set; } = DateTime.Now;
        public decimal CoinEarned { get; set; }
        public string? ShippingAddress { get; set; }
        public string? RecipientName { get; set; }
        public string? RecipientPhone { get; set; }
        [Required]
        public decimal Price { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public OrderStatus OrderStatus { get; set; }
        public string? Reason { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }
        public int ShippingId { get; set; }
        [ForeignKey("ShippingId")]
        public Shipping Shipping { get; set; }
        public int PaymentId { get; set; }
        [ForeignKey("PaymentId")]
        public Payment Payment { get; set; }

        [ValidateNever]
        public ICollection<OrderDetail> OrderDetails { get; set; }

        public void CalculateTotalPrice()
        {
            decimal totalPrice = OrderDetails.Sum(ci => ci.Quantity * ci.Price);
            decimal shippingCost = Shipping.CalculateShippingCost(
                OrderDetails.Sum(ci => ci.Quantity * ci.Classification.Weight),
                OrderDetails.Max(ci => ci.Classification.Length),
                OrderDetails.Max(ci => ci.Classification.Width),
                OrderDetails.Max(ci => ci.Classification.Height)
            );
            Price = totalPrice + shippingCost;
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
            decimal finalPrice = Price;
            if (IsUse)
            {
                finalPrice -= User.LoyaltyCoin;
                if (finalPrice < 0)
                    finalPrice = 0; //Ensure the order value is not negative
                User.LoyaltyCoin = 0;
            }
            CoinEarned = CalculateLoyaltyCoins(finalPrice); //Calculate the new number of coins to receive based on the final order price
            if (OrderStatus == OrderStatus.delivered && CoinEarned > 0)
            {
                User.LoyaltyCoin += CoinEarned;
            }
        }

    }
}
