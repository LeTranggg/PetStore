using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos.Role;
using Pet.Services.IServices;

namespace Pet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RoleController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        // GET: api/role
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoleDto>>> GetAllRoles()
        {
            return Ok(await _roleService.GetAllRolesAsync());
        }

        // GET: api/role/1
        [HttpGet("{id}")]
        public async Task<ActionResult<RoleDto>> GetRole(int id)
        {
            try
            {
                var role = await _roleService.GetRoleByIdAsync(id);
                return Ok(role);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // POST: api/role
        [HttpPost]
        public async Task<ActionResult<RoleDto>> CreateRole([FromBody] UpdateRoleDto createRoleDto)
        {
            try
            {
                var role = await _roleService.CreateRoleAsync(createRoleDto);
                return CreatedAtAction(nameof(GetRole), new { id = role.Id }, role);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/role/1
        [HttpPut("{id}")]
        public async Task<ActionResult<RoleDto>> UpdateRole(int id, [FromBody] UpdateRoleDto updateRoleDto)
        {
            try
            {
                var role = await _roleService.UpdateRoleAsync(id, updateRoleDto);
                return Ok(role);
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

        // DELETE: api/role/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            try
            {
                var role = await _roleService.DeleteRoleAsync(id);
                if (!role) return NotFound($"Role with ID {id} not found.");
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
