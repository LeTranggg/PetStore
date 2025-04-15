using Pet.Dtos.Payment;

namespace Pet.Services.IServices
{
    public interface IPaymentService
    {
        Task<PaymentDto> CreatePaymentAsync(int userId, CreatePaymentDto createPaymentDto);
        Task<PaymentDto> ConfirmPaymentAsync(int userId, int Id, string stripeToken = null);
        Task<PaymentDto> GetPaymentStatusAsync(int userId, int Id);
        Task<IEnumerable<PaymentDto>> GetPaymentHistoryAsync(int userId, int orderId);
    }
}
