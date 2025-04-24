using AutoMapper;
using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Dtos.Supplier;
using Pet.Dtos.User;
using Pet.Models;
using Pet.Services.IServices;

namespace Pet.Services
{
    public class SupplierService : ISupplierService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly Cloudinary _cloudinary;

        public SupplierService(ApplicationDbContext context, IMapper mapper, Cloudinary cloudinary)
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

        // Xem danh sách suppliers
        public async Task<IEnumerable<SupplierDto>> GetAllSuppliersAsync()
        {
            var suppliers = await _context.Suppliers.ToListAsync();

            return _mapper.Map<IEnumerable<SupplierDto>>(suppliers);
        }

        // Xem chi tiết supplier theo ID
        public async Task<SupplierDto> GetSupplierByIdAsync(int id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) throw new KeyNotFoundException($"Supplier with ID {id} not found.");

            return _mapper.Map<SupplierDto>(supplier);
        }

        // Tạo supplier mới
        public async Task<SupplierDto> CreateSupplierAsync(int userId, CreateSupplierDto createSupplierDto)
        {
            await CheckUserAsync(userId);

            if (await _context.Suppliers.AnyAsync(s => s.Email == createSupplierDto.Email))
                throw new InvalidOperationException($"Email {createSupplierDto.Email} already exists.");

            var supplier = _mapper.Map<Supplier>(createSupplierDto);

            if (createSupplierDto.Image != null)
                supplier.Image = await UploadImageToCloudinaryAsync(createSupplierDto.Image);

            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync();

            return _mapper.Map<SupplierDto>(supplier);
        }

        // Cập nhật supplier
        public async Task<SupplierDto> UpdateSupplierAsync(int userId, int id, UpdateSupplierDto updateSupplierDto)
        {
            await CheckUserAsync(userId);

            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) throw new KeyNotFoundException($"Supplier with ID {id} not found.");

            if (updateSupplierDto.Name != null) supplier.Name = updateSupplierDto.Name;
            if (updateSupplierDto.Email != null && updateSupplierDto.Email != supplier.Email)
            {
                if (await _context.Suppliers.AnyAsync(s => s.Email == updateSupplierDto.Email))
                    throw new InvalidOperationException($"Email {updateSupplierDto.Email} already exists.");
                
                supplier.Email = updateSupplierDto.Email;
            }
            if (updateSupplierDto.PhoneNumber != null) supplier.PhoneNumber = updateSupplierDto.PhoneNumber;
            if (updateSupplierDto.Address != null) supplier.Address = updateSupplierDto.Address;
            if (updateSupplierDto.Image != null) supplier.Image = await UploadImageToCloudinaryAsync(updateSupplierDto.Image);

            _context.Suppliers.Update(supplier);
            await _context.SaveChangesAsync();

            return _mapper.Map<SupplierDto>(supplier);
        }

        // Xoá supplier
        public async Task<bool> DeleteSupplierAsync (int userId, int id)
        {
            await CheckUserAsync(userId);

            var supplier = await _context.Suppliers.FindAsync (id);
            if (supplier == null) return false;

            _context.Suppliers.Remove(supplier);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
