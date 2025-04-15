namespace Pet.Dtos.Cart
{
    public class AddToCartDto
    {
        public int UserId { get; set; } 
        public int VariantId { get; set; } 
        public int Quantity { get; set; } 
    }
}
