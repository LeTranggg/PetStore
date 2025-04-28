namespace Pet.Dtos.Order
{
    public class OrderDto
    {
        public int Id { get; set; }
        public DateTime DateCreated { get; set; }
        public decimal CoinsEarned { get; set; }
        public decimal LoyaltyCoinsSpent { get; set; }
        public decimal Subtotal { get; set; }
        public decimal ShippingCost { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } 
        public string CancelReason { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public int ShippingId { get; set; }
        public int PaymentId { get; set; }
        public string ClientSecret { get; set; }
        public List<OrderDetailDto> OrderDetails { get; set; }
    }
}
