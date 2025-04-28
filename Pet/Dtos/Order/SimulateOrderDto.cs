namespace Pet.Dtos.Order
{
    public class SimulateOrderDto
    {
        public decimal Subtotal { get; set; }
        public decimal ShippingCost { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal CoinEarned { get; set; }
    }
}
