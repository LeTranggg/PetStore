using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pet.Dtos;
using Pet.Models;
using Pet.Repositories;
using Pet.Repositories.IRepositories;
using Pet.Services;

namespace Pet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public PaymentController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpPost("process-payment")]
        public IActionResult ProcessPayment([FromBody] PaymentDto request)
        {
            if (request.ByCash)
            {
                // Xử lý thanh toán bằng cash
                var payment = new Payment
                {
                    ByCash = true,
                    IsSuccessfull = false,
                    Order = request.Order
                };

                _unitOfWork.PaymentRepository.AddAsync(payment);
                _unitOfWork.SaveAsync();
                return Ok(new { message = "Order created successfully. Payment pending." });
            }
            else
            {
                // Xử lý thanh toán qua VNPay
                return BadRequest(new { message = "Payment failed." });
            }
        }

    }

}
