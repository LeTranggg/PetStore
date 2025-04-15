using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos.Cart;
using Pet.Services.IServices;

namespace Pet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Customer")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        // GET: api/cart/user/1
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetCartByUserId(int userId)
        {
            try
            {
                var cart = await _cartService.GetCartByUserIdAsync(userId);
                return Ok(cart);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // GET: api/cart/item/1
        [HttpGet("item/{cartItemId}")]
        public async Task<IActionResult> GetCartItemById(int cartItemId)
        {
            try
            {
                var cartItem = await _cartService.GetCartItemByIdAsync(cartItemId);
                return Ok(cartItem);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // POST: api/cart/add
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto addToCartDto)
        {
            try
            {
                var cart = await _cartService.AddToCartAsync(addToCartDto);
                return Ok(cart);
            }
            catch (KeyNotFoundException ex)
            {
                // Trả về thông báo lỗi chi tiết
                return NotFound(new { message = ex.Message, data = addToCartDto });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message, data = addToCartDto });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}", data = addToCartDto });
            }
        }

        // PUT: api/cart/item/1
        [HttpPut("item/{cartItemId}")]
        public async Task<IActionResult> UpdateCartItem(int cartItemId, [FromBody] UpdateCartItemDto updateCartItemDto)
        {
            try
            {
                var cartItem = await _cartService.UpdateCartItemAsync(cartItemId, updateCartItemDto);
                return Ok(cartItem);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/cart/item/1
        [HttpDelete("item/{cartItemId}")]
        public async Task<IActionResult> RemoveFromCart(int cartItemId)
        {
            try
            {
                await _cartService.RemoveFromCartAsync(cartItemId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}

