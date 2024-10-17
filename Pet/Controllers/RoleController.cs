using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Models;
using Pet.Repositories.IRepositories;
using System.Data;

namespace Pet.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public RoleController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _unitOfWork.RoleRepository.GetAllAsync();
            return Ok(roles);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRole(int id)
        {
            var role = await _unitOfWork.RoleRepository.GetByIdAsync(id);
            if (role == null) return NotFound();
            return Ok(role);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] Role role)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            role.NormalizedName = role.Name.ToUpper(); // Tự động gán NormalizedName
            await _unitOfWork.RoleRepository.AddAsync(role);
            await _unitOfWork.SaveAsync();

            return CreatedAtAction(nameof(GetRole), new { id = role.Id }, role);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] Role role)
        {
            if (id != role.Id) return BadRequest();
            if (!ModelState.IsValid) return BadRequest(ModelState);
            // Tìm role từ database
            var existingRole = await _unitOfWork.RoleRepository.GetByIdAsync(id);
            if (existingRole == null) return NotFound("Role not found.");

            // Cập nhật các giá trị cần thiết
            existingRole.Name = role.Name;
            existingRole.NormalizedName = role.Name.ToUpper(); // Đảm bảo không bị null

            _unitOfWork.RoleRepository.UpdateAsync(existingRole);
            await _unitOfWork.SaveAsync();

            return Ok(role);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var role = await _unitOfWork.RoleRepository.GetByIdAsync(id);
            if (role == null) return NotFound();

            _unitOfWork.RoleRepository.DeleteAsync(role);
            await _unitOfWork.SaveAsync();

            return Ok();
        }
    }

}
