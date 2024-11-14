using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pet.Dtos;
using Pet.Models;
using Pet.Repositories.IRepositories;

namespace Pet.Controllers
{
    [Authorize(Roles = "Customer")]
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CartController(IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpGet]
        public async Task<ActionResult<Cart>> GetCart()
        {
            var userId = _httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in claims.");
            }

            var cart = await _unitOfWork.CartRepository.GetCartWithItemsAsync(int.Parse(userId));
            if (cart == null)
            {
                return NotFound("Cart not found.");
            }
            return Ok(cart);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CartItem>> GetCartItem(int id)
        {
            var cartItem = await _unitOfWork.CartItemRepository.GetCartItemWithClassificationAsync(id);
            if (cartItem == null)
                return NotFound(new { message = "Cart item not found" });

            return Ok(cartItem);
        }

        [HttpPost]
        public async Task<ActionResult> AddToCart([FromBody] List<AddCartItemDto> cartItems)
        {
            var userId = _httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in claims.");
            }

            var cart = await _unitOfWork.CartRepository.GetCartWithItemsAsync(int.Parse(userId));

            if (cart == null)
            {
                cart = new Cart { UserId = int.Parse(userId), CartItems = new List<CartItem>() };
                await _unitOfWork.CartRepository.AddAsync(cart);
                await _unitOfWork.SaveAsync();
            }

            if (cart.CartItems == null)
            {
                cart.CartItems = new List<CartItem>();
            }

            foreach (var cartItemDto in cartItems)
            {
                var classification = await _unitOfWork.ClassificationRepository.GetByIdAsync(cartItemDto.ClassificationId);
                if (classification == null)
                {
                    return BadRequest($"Invalid classification ID: {cartItemDto.ClassificationId}");
                }

                var existingCartItem = cart.CartItems.FirstOrDefault(ci => ci.ClassificationId == cartItemDto.ClassificationId);
                if (existingCartItem != null)
                {
                    existingCartItem.Quantity += cartItemDto.Quantity;
                }
                else
                {
                    var cartItem = new CartItem
                    {
                        CartId = cart.Id,
                        ClassificationId = cartItemDto.ClassificationId,
                        Quantity = cartItemDto.Quantity
                    };
                    cart.CartItems.Add(cartItem);
                }
            }

            await _unitOfWork.SaveAsync();
            return Ok("Items added to cart successfully.");
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateCartItem(int id, [FromBody] UpdateCartItemDto updateDto)
        {
            if (updateDto.Quantity < 0)
                return BadRequest(new { message = "Quantity cannot be negative" });

            var userId = _httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in claims.");
            }

            var existingCartItem = await _unitOfWork.CartItemRepository.GetCartItemWithClassificationAsync(id);
            if (existingCartItem == null)
                return NotFound(new { message = "Cart item not found" });

            // Check if the cart item belongs to the current user
            var cart = await _unitOfWork.CartRepository.GetCartWithItemsAsync(int.Parse(userId));
            if (cart == null || !cart.CartItems.Any(ci => ci.Id == id))
            {
                return Unauthorized("You don't have permission to update this cart item.");
            }

            var classification = await _unitOfWork.ClassificationRepository.GetByIdAsync(existingCartItem.ClassificationId);
            if (classification.Quantity < updateDto.Quantity)
                return BadRequest(new { message = "Requested quantity exceeds available stock" });

            if (updateDto.Quantity == 0)
            {
                _unitOfWork.CartItemRepository.DeleteAsync(existingCartItem);
            }
            else
            {
                existingCartItem.Quantity = updateDto.Quantity;
            }

            await _unitOfWork.SaveAsync();
            return Ok(new { message = "Cart item updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> RemoveFromCart(int id)
        {
            var cartItem = await _unitOfWork.CartItemRepository.GetCartItemWithClassificationAsync(id);
            if (cartItem == null)
                return NotFound(new { message = "Cart item not found" });

            _unitOfWork.CartItemRepository.DeleteAsync(cartItem);
            await _unitOfWork.SaveAsync();
            return Ok(new { message = "Item removed from cart successfully" });
        }
    }

}
