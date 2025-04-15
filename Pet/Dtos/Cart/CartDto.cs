namespace Pet.Dtos.Cart
{
    public class CartDto
    {
        public int Id { get; set; }
        public decimal TotalPrice { get; set; }
        public int? UserId { get; set; }
        public List<CartItemDto> CartItems { get; set; }
    }
}
