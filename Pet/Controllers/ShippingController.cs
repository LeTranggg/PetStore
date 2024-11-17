using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos;
using Pet.Models;
using Pet.Repositories.IRepositories;

namespace Pet.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class ShippingController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public ShippingController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetShippings()
        {
            var Shippings = await _unitOfWork.ShippingRepository.GetAllAsync();
            return Ok(Shippings);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetShipping(int id)
        {
            var Shipping = await _unitOfWork.ShippingRepository.GetByIdAsync(id);
            if (Shipping == null) return NotFound();
            return Ok(Shipping);
        }
    }
}
