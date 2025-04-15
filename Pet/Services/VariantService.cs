using AutoMapper;
using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using Pet.Datas;
using Pet.Models;
using Pet.Services.IServices;
using Pet.Dtos.Variant;
using Microsoft.EntityFrameworkCore;

namespace Pet.Services
{
    public class VariantService : IVariantService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly Cloudinary _cloudinary;

        public VariantService(ApplicationDbContext context, IMapper mapper, Cloudinary cloudinary)
        {
            _context = context;
            _mapper = mapper;
            _cloudinary = cloudinary;
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

        // Tải ảnh lên Cloudinary
        private async Task<string> UploadImageToCloudinaryAsync(IFormFile image)
        {
            if (image == null) return null;

            using var stream = image.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(image.FileName, stream),
                PublicId = Guid.NewGuid().ToString()
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            return uploadResult.SecureUrl.ToString();
        }

        // Xem danh sách variants
        public async Task<IEnumerable<VariantDto>> GetAllVariantsAsync()
        {
            var variants = await _context.Variants
                .Include(v => v.Product)
                .Include(v => v.VariantValues).ThenInclude(vv => vv.Value) // Include Value để lấy Name
                .ToListAsync();

            return _mapper.Map<IEnumerable<VariantDto>>(variants);
        }

        // Xem chi tiết variant theo ID
        public async Task<VariantDto> GetVariantByIdAsync(int id)
        {
            var variant = await _context.Variants.FindAsync(id);
            if (variant == null) throw new KeyNotFoundException($"Variant with ID {id} not found.");

            await _context.Entry(variant).Reference(v => v.Product).LoadAsync();
            await _context.Entry(variant).Collection(v => v.VariantValues).LoadAsync();
            foreach (var vv in variant.VariantValues)
            {
                await _context.Entry(vv).Reference(vv => vv.Value).LoadAsync();
            }    
            
            return _mapper.Map<VariantDto>(variant);
        }

        // Tạo variant mới
        public async Task<VariantDto> CreateVariantAsync(int userId, CreateVariantDto createVariantDto)
        {
            await CheckUserAsync(userId);

            var variant = _mapper.Map<Variant>(createVariantDto);

            if (createVariantDto.Image != null)
                variant.Image = await UploadImageToCloudinaryAsync(createVariantDto.Image);

            // Thêm VariantValues từ ValueIds
            variant.VariantValues = createVariantDto.ValueIds.Select(valueId => new VariantValue { ValueId = valueId }).ToList();

            _context.Variants.Add(variant);
            await _context.SaveChangesAsync();

            await _context.Entry(variant).Reference(v => v.Product).LoadAsync();
            await _context.Entry(variant).Collection(v => v.VariantValues).LoadAsync();
            foreach (var vv in variant.VariantValues)
            {
                await _context.Entry(vv).Reference(vv => vv.Value).LoadAsync();
            }

            return _mapper.Map<VariantDto>(variant);
        }

        // Cập nhật variant
        public async Task<VariantDto> UpdateVariantAsync(int userId, int id, UpdateVariantDto updateVariantDto)
        {
            await CheckUserAsync(userId);

            var variant = await _context.Variants.Include(v => v.VariantValues).FirstOrDefaultAsync(v => v.Id == id);
            if (variant == null) throw new KeyNotFoundException($"Variant with ID {id} not found.");

            Console.WriteLine($"Before update: VariantValues count = {variant.VariantValues?.Count ?? 0}");

            if (updateVariantDto.AdditionalFee.HasValue) variant.AdditionalFee = updateVariantDto.AdditionalFee.Value;
            if (updateVariantDto.Quantity.HasValue) variant.Quantity = updateVariantDto.Quantity.Value;
            if (updateVariantDto.Image != null) variant.Image = await UploadImageToCloudinaryAsync(updateVariantDto.Image);
            if (updateVariantDto.Weight.HasValue) variant.Weight = updateVariantDto.Weight.Value;
            if (updateVariantDto.Height.HasValue) variant.Height = updateVariantDto.Height.Value;
            if (updateVariantDto.Width.HasValue) variant.Width = updateVariantDto.Width.Value;
            if (updateVariantDto.Length.HasValue) variant.Length = updateVariantDto.Length.Value;
            if (updateVariantDto.ProductId.HasValue) variant.ProductId = updateVariantDto.ProductId.Value;

            if (updateVariantDto.ValueIds != null)
            {
                Console.WriteLine($"New ValueIds: {string.Join(", ", updateVariantDto.ValueIds)}");
                if (variant.VariantValues != null) _context.VariantValues.RemoveRange(variant.VariantValues);
                variant.VariantValues = updateVariantDto.ValueIds
                    .Select(valueId => new VariantValue { VariantId = id, ValueId = valueId }).ToList();
                Console.WriteLine($"After update: VariantValues count = {variant.VariantValues.Count}");
            }

            _context.Variants.Update(variant);
            await _context.SaveChangesAsync();

            await _context.Entry(variant).Reference(v => v.Product).LoadAsync();
            await _context.Entry(variant).Collection(v => v.VariantValues).LoadAsync();
            foreach (var vv in variant.VariantValues)
            {
                await _context.Entry(vv).Reference(vv => vv.Value).LoadAsync();
            }
            
            return _mapper.Map<VariantDto>(variant);
        }

        // Xoá variant
        public async Task<bool> DeleteVariantAsync(int userId, int id)
        {
            await CheckUserAsync(userId);

            var variant = await _context.Variants.FindAsync(id);
            if (variant == null) return false;

            _context.Variants.Remove(variant);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
