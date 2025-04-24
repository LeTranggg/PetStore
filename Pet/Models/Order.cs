using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Pet.Models
{
    public enum OrderStatus
    {
        Pending,
        Delivering,
        Received,
        Cancelled
    }

    public enum CancelReason
    {
        None,         
        Expiration,   // Quá hạn xác nhận
        Mistake,      // Đặt nhầm
        Violation,    // Vi phạm điều khoản
    }

    public class Order
    {
        [Key]
        public int Id { get; set; }
        public DateTime DateCreated { get; set; } = DateTime.UtcNow;
        [Required]
        public decimal CoinEarned { get; set; }
        [Required]
        public decimal Price { get; set; } // Giá chưa tính phí vận chuyển
        [Required]
        public decimal ShippingCost { get; set; }
        [Required]
        public decimal TotalPrice { get; set; }
        [Required]
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        [MaxLength(200)]
        public CancelReason CancelReason { get; set; } = CancelReason.None;

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
            /*Price = OrderDetails.Sum(od => od.Price);
            ShippingCost = Shipping.CalculateShippingCost(
                OrderDetails.Sum(od => od.Quantity * od.Variant.Weight),
                OrderDetails.Max(od => od.Variant.Length),
                OrderDetails.Max(od => od.Variant.Width),
                OrderDetails.Max(od => od.Variant.Height)
            );
            TotalPrice = Price + ShippingCost;*/
            // Calculate the subtotal (Price)
            Price = OrderDetails.Sum(od => od.Price);
            Console.WriteLine($"CalculateTotalPrice: Subtotal (Price) = {Price} VND");

            // Log the inputs to CalculateShippingCost
            decimal totalWeight = OrderDetails.Sum(od => od.Quantity * od.Variant.Weight);
            decimal maxLength = OrderDetails.Max(od => od.Variant.Length);
            decimal maxWidth = OrderDetails.Max(od => od.Variant.Width);
            decimal maxHeight = OrderDetails.Max(od => od.Variant.Height);
            Console.WriteLine($"CalculateTotalPrice: Inputs to CalculateShippingCost - Total Weight = {totalWeight}, Max Length = {maxLength}, Max Width = {maxWidth}, Max Height = {maxHeight}");

            // Calculate shipping cost
            ShippingCost = Shipping.CalculateShippingCost(totalWeight, maxLength, maxWidth, maxHeight);
            Console.WriteLine($"CalculateTotalPrice: ShippingCost = {ShippingCost} VND");

            // Calculate the final total price
            TotalPrice = Price + ShippingCost;
            Console.WriteLine($"CalculateTotalPrice: TotalPrice = {TotalPrice} VND (Subtotal: {Price} + ShippingCost: {ShippingCost})");
        }

        public int CalculateLoyaltyCoins(decimal finalPrice)
        {   
            //Divide by 100 to calculate the number of times 100 is in finalPrice
            if (finalPrice >= 100000) return ((int)(finalPrice / 100000)) * 100; 
            return 0;
        }

        //Coins accumulated after each order
        public void ApplyLoyaltyCoins(bool IsUse)
        {
            decimal finalPrice = TotalPrice;
            if (IsUse)
            {
                finalPrice -= User.LoyaltyCoins;
                if (finalPrice < 0) finalPrice = 0; //Ensure the order value is not negative
                User.LoyaltyCoins = 0;
            }
            CoinEarned = CalculateLoyaltyCoins(finalPrice); //Calculate the new number of coins to receive based on the final order price
            if (Status == OrderStatus.Received && CoinEarned > 0) User.LoyaltyCoins += CoinEarned;
        }

    }
}
