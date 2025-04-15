using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos.User;
using Pet.Models;
using Pet.Services.IServices;

namespace Pet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        // Lấy userId từ token
        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                throw new UnauthorizedAccessException("Invalid user ID in token.");
            return userId;
        }

        // GET: api/user
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
        {
            var id = GetUserId();
            return Ok(await _userService.GetAllUsersAsync(id));
        }

        // GET: api/user/1
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            try
            {
                return Ok(await _userService.GetUserByIdAsync(id));
            }
            catch (KeyNotFoundException ex) 
            { 
                return NotFound(ex.Message); 
            }
        }

        // POST: api/user
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<UserDto>> CreateUser([FromForm] CreateUserDto createUserDto)
        {
            try
            {
                var id = GetUserId();
                var user = await _userService.CreateUserAsync(id, createUserDto);
                return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
            }
            catch (InvalidOperationException ex) 
            { 
                return BadRequest(ex.Message); 
            }
        }

        // PUT: api/user/1
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<UserDto>> UpdateUser(int id, [FromForm] UpdateUserDto updateUserDto)
        {
            try
            {
                return Ok(await _userService.UpdateUserAsync(id, updateUserDto));
            }
            catch (KeyNotFoundException ex) 
            {
                return NotFound(ex.Message); 
            }
            catch (InvalidOperationException ex) 
            { 
                return BadRequest(ex.Message); 
            }
        }

        // DELETE: api/user/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _userService.DeleteUserAsync(id);
                if (!user) return NotFound($"User with ID {id} not found.");
                return NoContent();
            }
            catch (InvalidOperationException ex) 
            { 
                return BadRequest(ex.Message); 
            }
        }

        // POST: api/user/1/lock
        [HttpPost("{id}/lock")]
        public async Task<ActionResult<UserDto>> LockUser(int id, [FromBody] string reason)
        {
            Console.WriteLine($"Received lock request for user {id} with reason: {reason}");
            try
            {
                if (string.IsNullOrEmpty(reason) || !Enum.TryParse<LockReason>(reason, true, out var parsedReason))
                {
                    return BadRequest($"Invalid lock reason: {reason}");
                }
                Console.WriteLine($"Parsed reason: {parsedReason}"); // Log giá trị sau khi parse
                return Ok(await _userService.LockUserAsync(id, parsedReason));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // POST: api/user/1/unlock
        [HttpPost("{id}/unlock")]
        public async Task<ActionResult<UserDto>> UnlockUser(int id)
        {
            try
            {
                return Ok(await _userService.UnlockUserAsync(id));
            }
            catch (KeyNotFoundException ex) 
            { 
                return NotFound(ex.Message); 
            }
            catch (InvalidOperationException ex) 
            { 
                return BadRequest(ex.Message); 
            }
        }

        // POST: api/user/1/reset-password
        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id)
        {
            try
            {
                await _userService.ResetPasswordAsync(id);
                return Ok($"Password reset successfully.");
            }
            catch (KeyNotFoundException ex) 
            { 
                return NotFound(ex.Message); 
            }
            catch (InvalidOperationException ex) 
            { 
                return BadRequest(ex.Message); 
            }
        }
    }
}
