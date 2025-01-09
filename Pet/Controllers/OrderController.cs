using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Datas;
using Pet.Dtos;
using Pet.Models;
using Pet.Repositories.IRepositories;
using Pet.Services.IServices;

namespace Pet.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;

        public OrderController(IUnitOfWork unitOfWork, IEmailService emailService)
        {
            _unitOfWork = unitOfWork;
            _emailService = emailService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _unitOfWork.OrderRepository.GetAllAsync();
            return Ok(orders);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder(CreateOrderDto createOrderDto)
        {
            // Lấy thông tin Cart của người dùng
            var cart = await _unitOfWork.CartRepository.GetByIdAsync(createOrderDto.CartId);
            if (cart == null || !cart.CartItems.Any())
            {
                return BadRequest("Cart is empty or not found.");
            }

            // Tạo Order
            var order = new Order
            {
                UserId = cart.UserId,
                ShippingAddress = createOrderDto.ShippingAddress ?? cart.User.Address,
                RecipientName = createOrderDto.RecipientName ?? cart.User.LastName,
                RecipientPhone = createOrderDto.RecipientPhone ?? cart.User.PhoneNumber,
                ShippingId = createOrderDto.ShippingId,
                PaymentId = createOrderDto.PaymentId,
                OrderStatus = OrderStatus.confirming,
                DateCreated = DateTime.Now
            };

            // Tạo OrderDetail từ CartItem
            foreach (var cartItem in cart.CartItems)
            {
                var orderDetail = new OrderDetail
                {
                    Order = order,
                    ClassificationId = cartItem.ClassificationId,
                    Quantity = cartItem.Quantity,
                    Price = cartItem.Classification.Price + cartItem.Classification.Product.Price
                };
                await _unitOfWork.OrderDetailRepository.AddAsync(orderDetail);
            }

            // Tính giá tổng và áp dụng loyalty coins
            order.CalculateTotalPrice();
            order.ApplyLoyaltyCoins(createOrderDto.UseLoyaltyCoins);

            // Thêm Order vào database
            await _unitOfWork.OrderRepository.AddAsync(order);
            await _unitOfWork.SaveAsync();

            // Xoá Cart sau khi Order được tạo
            cart.CartItems.Clear();
            await _unitOfWork.CartRepository.UpdateAsync(cart);
            await _unitOfWork.SaveAsync();

            return Ok(order);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, UpdateOrderDto updateDto)
        {
            var order = await _unitOfWork.OrderRepository.GetByIdAsync(id);
            if (order == null)
            {
                return NotFound("Order not found.");
            }

            order.OrderStatus = updateDto.OrderStatus;
            if (updateDto.OrderStatus == OrderStatus.cancelled)
            {
                order.Reason = updateDto.Reason;
            }

            await _unitOfWork.OrderRepository.UpdateAsync(order);
            await _unitOfWork.SaveAsync();
            return Ok(order);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _unitOfWork.OrderRepository.GetByIdAsync(id);
            if (order == null)
            {
                return NotFound("Order not found.");
            }

            await _unitOfWork.OrderRepository.DeleteAsync(order);
            await _unitOfWork.SaveAsync();
            return NoContent();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var order = await _unitOfWork.OrderRepository.GetByIdAsync(id);
            if (order == null)
            {
                return NotFound("Order not found.");
            }
            return Ok(order);
        }
    }

}
