using Pet.Dtos.Order;

namespace Pet.Services.IServices
{
    public interface IOrderService
    {
        Task<List<OrderDto>> GetAllOrdersAsync(int userId, string role);
        Task<OrderDto> GetOrderByIdAsync(int id, int userId, string role); 
        Task<OrderDto> CreateOrderAsync(int userId, CreateOrderDto createOrderDto); 
        Task<OrderDto> CancelOrderAsync(int id, CancelOrderDto cancelOrderDto, int userId);
        Task<OrderDto> UpdateOrderStatusAsync(int id, UpdateOrderDto updateOrderDto, int userId, string role);
        Task DeleteOrderAsync(int id, int userId, string role);
        Task<SimulateOrderDto> SimulateOrderAsync(int userId, CreateOrderDto createOrderDto);
    }
}
