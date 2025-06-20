﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using Pet.Dtos.Account;
using Pet.Services;
using Pet.Services.IServices;

namespace Pet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly ILogger<AccountController> _logger;

        public AccountController(IAccountService accountService, ILogger<AccountController> logger)
        {
            _accountService = accountService;
            _logger = logger;
        }

        // POST: api/account/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var token = await _accountService.LoginAsync(loginDto);
                _logger.LogInformation("Login response: {Token}", token);
                return Ok(new { token }); // Trả về object với key "token"
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Login failed: {Message}", ex.Message);
                return Unauthorized(new { message = ex.Message });
            }
        }

        // POST: api/account/google-login
        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleDto googleDto)
        {
            try
            {
                var token = await _accountService.GoogleLoginAsync(googleDto);
                _logger.LogInformation("Google login response: {Token}", token);
                return Ok(new { token }); // Trả về object với key "token"
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Google login failed: {Message}", ex.Message);
                return Unauthorized(new { message = ex.Message });
            }
        }

        // POST: api/account/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                var profile = await _accountService.RegisterAsync(registerDto);
                return Ok(new { Message = "Registration successful. Please check your email to confirm.", Profile = profile });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Register failed: {Message}", ex.Message);
                return BadRequest(ex.Message);
            }
        }

        // GET: api/account/confirm-email
        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string email, [FromQuery] string token)
        {
            try
            {
                await _accountService.ConfirmEmailAsync(email, token);
                return Ok("Email confirmed successfully.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ConfirmEmail");
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/account/1
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<ProfileDto>> GetProfile(int id)
        {
            try
            {
                return Ok(await _accountService.GetProfileByIdAsync(id));
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning("Get profile failed: {Message}", ex.Message);
                return NotFound(ex.Message);
            }
        }

        // POST: api/account/forgot-password
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            try
            {
                await _accountService.ForgotPasswordAsync(forgotPasswordDto);
                return Ok("If your email is registered, a password reset link has been sent.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Forgot password failed");
                return BadRequest(ex.Message);
            }
        }

        // POST: api/account/reset-password
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            try
            {
                await _accountService.ResetPasswordAsync(resetPasswordDto);
                return Ok("Password reset successfully.");
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning("Reset password failed: {Message}", ex.Message);
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Reset password failed: {Message}", ex.Message);
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/account/profile
        [HttpPut("profile")]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileDto updateProfileDto)
        {
            try
            {
                var claims = User.Claims.Select(c => $"{c.Type}: {c.Value}");
                Console.WriteLine("Claims in token: " + string.Join(", ", claims));
                var subClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                if (string.IsNullOrEmpty(subClaim))
                {
                    Console.WriteLine("Sub claim not found. Available claims: " + string.Join(", ", claims));
                    throw new InvalidOperationException("User ID not found in token");
                }

                var userId = int.Parse(subClaim);
                var profile = await _accountService.UpdateProfileAsync(userId, updateProfileDto);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateProfile");
                return BadRequest(ex.Message);
            }
        }

        // POST: api/account/change-password
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            try
            {
                var claims = User.Claims.Select(c => $"{c.Type}: {c.Value}");
                Console.WriteLine("Claims in token: " + string.Join(", ", claims));
                var subClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                if (string.IsNullOrEmpty(subClaim))
                {
                    Console.WriteLine("Sub claim not found. Available claims: " + string.Join(", ", claims));
                    throw new InvalidOperationException("User ID not found in token");
                }

                var userId = int.Parse(subClaim);
                await _accountService.ChangePasswordAsync(userId, changePasswordDto);
                return Ok("Password changed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ChangePassword");
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/account/delete-account
        [HttpDelete("delete-account")]
        [Authorize]
        public async Task<IActionResult> DeleteAccount()
        {
            try
            {
                var claims = User.Claims.Select(c => $"{c.Type}: {c.Value}");
                Console.WriteLine("Claims in token: " + string.Join(", ", claims));
                var subClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                if (string.IsNullOrEmpty(subClaim))
                {
                    Console.WriteLine("Sub claim not found. Available claims: " + string.Join(", ", claims));
                    throw new InvalidOperationException("User ID not found in token");
                }

                var userId = int.Parse(subClaim);
                await _accountService.DeleteAccountAsync(userId);
                return Ok("Account deletion request submitted.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAccount");
                return BadRequest(ex.Message);
            }
        }
    }
}
