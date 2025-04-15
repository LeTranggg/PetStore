using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Dtos.Shipping;
using Pet.Models;
using Pet.Services.IServices;

namespace Pet.Services
{
    public class ShippingService : IShippingService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public ShippingService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
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

        // Xem danh sách shippings
        public async Task<IEnumerable<ShippingDto>> GetAllShippingsAsync(int userId)
        {
            await CheckUserAsync(userId);

            var shippings = await _context.Shippings.ToListAsync();
            
            return _mapper.Map<IEnumerable<ShippingDto>>(shippings);
        }

        // Xem chi tiết shipping theo Id
        public async Task<ShippingDto> GetShippingByIdAsync(int userId, int id)
        {
            await CheckUserAsync(userId);

            var shipping = await _context.Shippings.FindAsync(id);
            if (shipping == null) throw new KeyNotFoundException($"Shipping with ID {id} not found.");

            return _mapper.Map<ShippingDto>(shipping);
        }

        // Tạo shipping mới
        public async Task<ShippingDto> CreateShippingAsync(int userId, CreateShippingDto createShippingDto)
        {
            await CheckUserAsync(userId);

            if (await _context.Shippings.AnyAsync(s => s.Method == createShippingDto.Method))
                throw new InvalidOperationException($"Shipping with method '{createShippingDto.Method}' already exists.");

            var shipping = _mapper.Map<Shipping>(createShippingDto);

            _context.Shippings.Add(shipping);
            await _context.SaveChangesAsync();

            return _mapper.Map<ShippingDto>(shipping);
        }

        // Cập nhật shipping
        public async Task<ShippingDto> UpdateShippingAsync(int userId, int id, UpdateShippingDto updateShippingDto)
        {
            await CheckUserAsync(userId);

            var shipping = await _context.Shippings.FindAsync(id);
            if (shipping == null) throw new KeyNotFoundException($"Shipping with ID {id} not found.");

            if (updateShippingDto.Method.HasValue && updateShippingDto.Method != shipping.Method)
            {
                if (await _context.Shippings.AnyAsync(s => s.Method == updateShippingDto.Method))
                    throw new InvalidOperationException($"Shipping with method '{updateShippingDto.Method}' already exists.");

                shipping.Method = updateShippingDto.Method.Value;
            }
            if (updateShippingDto.Price.HasValue) shipping.Price = updateShippingDto.Price.Value;

            _context.Shippings.Update(shipping);
            await _context.SaveChangesAsync();

            return _mapper.Map<ShippingDto>(shipping);
        }

        // Xoá shipping
        public async Task<bool> DeleteShippingAsync(int userId, int id)
        {
            await CheckUserAsync(userId);

            var shipping = await _context.Shippings.FindAsync(id);
            if (shipping == null) return false;

            _context.Shippings.Remove(shipping);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
