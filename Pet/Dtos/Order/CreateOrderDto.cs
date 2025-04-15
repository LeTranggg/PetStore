namespace Pet.Dtos.Order
{
    public class CreateOrderDto
    {
        public List<int> CartItemIds { get; set; } // Danh sách ID các CartItem được chọn để checkout
        public int ShippingId { get; set; }
        public string PaymentMethod { get; set; }
        public bool UseLoyaltyCoins { get; set; }
    }
}
