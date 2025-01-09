using Pet.Datas;

namespace Pet.Dtos
{
    public class UpdateOrderDto
    {
        public OrderStatus OrderStatus { get; set; }
        public string? Reason { get; set; }
    }
}
