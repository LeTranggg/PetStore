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

        // GET: api/user
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
        {
            return Ok(await _userService.GetAllUsersAsync());
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
                var user = await _userService.CreateUserAsync(createUserDto);
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
        public async Task<ActionResult<UserDto>> LockUser(int id, LockReason reason)
        {
            try
            {
                return Ok(await _userService.LockUserAsync(id, reason));
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
                await _userService.ResetPasswordAsync(id); // Không trả về mật khẩu
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
