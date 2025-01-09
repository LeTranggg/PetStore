namespace Pet.Dtos
{
    public class CreateOrderDto
    {
        public int CartId { get; set; }
        public string ShippingAddress { get; set; }
        public string RecipientName { get; set; }
        public string RecipientPhone { get; set; }
        public int ShippingId { get; set; }
        public int PaymentId { get; set; }
        public bool UseLoyaltyCoins { get; set; }
    }
}
