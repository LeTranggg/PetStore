using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Dtos.Payment;
using Pet.Models;
using Pet.Services.IServices;
using PaymentMethod = Pet.Models.PaymentMethod;
using Stripe;

namespace Pet.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;

        public PaymentService(ApplicationDbContext context, IMapper mapper, IConfiguration configuration)
        {
            _context = context;
            _mapper = mapper;
            _configuration = configuration;
        }

        // Kiểm tra trạng thái user
        private async Task CheckUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new KeyNotFoundException($"User with ID {userId} not found.");

            var localTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var localNow = TimeZoneInfo.ConvertTimeFromUtc(DateTimeOffset.UtcNow.UtcDateTime, localTimeZone);
            if (user.LockoutEnabled && user.LockoutEnd.HasValue && user.LockoutEnd > localNow)
                throw new UnauthorizedAccessException("Your account is currently locked. Please try again later or contact support.");
        }

        // Tạo payment mới
        public async Task<PaymentDto> CreatePaymentAsync(int userId, CreatePaymentDto createPaymentDto)
        {
            await CheckUserAsync(userId);

            var payment = new Payment
            {
                Method = createPaymentDto.Method,
                Amount = createPaymentDto.Amount,
                OrderId = createPaymentDto.OrderId,
                DateCreated = DateTime.UtcNow,
                IsSuccessful = false
            };

            if (createPaymentDto.Method == PaymentMethod.Stripe)
            {
                var options = new PaymentIntentCreateOptions
                {
                    Amount = (long)createPaymentDto.Amount,
                    Currency = "vnd",
                    Description = $"Payment for Order #{createPaymentDto.OrderId}",
                    AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                    {
                        Enabled = true,
                    },
                };
                var service = new PaymentIntentService();
                var paymentIntent = await service.CreateAsync(options);
                payment.TransactionId = paymentIntent.Id;
            }

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return _mapper.Map<PaymentDto>(payment);
        }

        // Xác nhận payment
        public async Task<PaymentDto> ConfirmPaymentAsync(int userId, int Id, string paymentIntentId)
        {
            await CheckUserAsync(userId);

            var payment = await _context.Payments.Include(p => p.Order).FirstOrDefaultAsync(p => p.Id == Id);
            if (payment == null) throw new KeyNotFoundException($"Payment with ID {Id} not found.");

            if (payment.IsSuccessful) throw new InvalidOperationException("Payment already confirmed.");

            if (payment.Method == PaymentMethod.Stripe)
            {
                if (string.IsNullOrEmpty(paymentIntentId))
                    throw new ArgumentException("Payment Intent ID is required for Stripe payment.");

                var service = new PaymentIntentService();
                var paymentIntent = await service.GetAsync(paymentIntentId);

                if (paymentIntent.Status == "succeeded")
                {
                    payment.IsSuccessful = true;
                    payment.DateConfirmed = DateTime.UtcNow;
                }
                else
                {
                    throw new InvalidOperationException("Payment confirmation failed.");
                }
            }
            else if (payment.Method == PaymentMethod.Cash)
            {
                throw new InvalidOperationException("Cash payments are confirmed when order status is Received.");
            }

            await _context.SaveChangesAsync();

            return _mapper.Map<PaymentDto>(payment);
        }

        // Xem trạng thái payment
        public async Task<PaymentDto> GetPaymentStatusAsync(int userId, int Id)
        {
            await CheckUserAsync(userId);

            var payment = await _context.Payments.Include(p => p.Order).FirstOrDefaultAsync(p => p.Id == Id);
            if (payment == null) throw new KeyNotFoundException($"Payment with ID {Id} not found.");

            return _mapper.Map<PaymentDto>(payment);
        }

        // Xem lịch sử payment
        public async Task<IEnumerable<PaymentDto>> GetPaymentHistoryAsync(int userId, int orderId)
        {
            await CheckUserAsync(userId);

            var payments = await _context.Payments.Include(p => p.Order).Where(p => p.OrderId == orderId).ToListAsync();

            return _mapper.Map<IEnumerable<PaymentDto>>(payments);
        }

    }
}
