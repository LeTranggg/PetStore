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
            var supplier = await _context.Suppliers.ToListAsync();

            return _mapper.Map<IEnumerable<SupplierDto>>(supplier);
        }

        // Xem chi tiết supplier theo ID
        public async Task<SupplierDto> GetSupplierByIdAsync(int id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) throw new KeyNotFoundException($"Supplier with ID {id} not found.");

            return _mapper.Map<SupplierDto>(supplier);
        }

        // Tạo supplier mới
        public async Task<SupplierDto> CreateSupplierAsync(CreateSupplierDto createSupplierDto)
        {
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
        public async Task<SupplierDto> UpdateSupplierAsync(int id, UpdateSupplierDto updateSupplierDto)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) throw new KeyNotFoundException($"Supplier with ID {id} not found.");

            if (updateSupplierDto.Name != null) supplier.Name = updateSupplierDto.Name;
            if (updateSupplierDto.Email != null)
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
        public async Task<bool> DeleteSupplierAsync (int id)
        {
            var supplier = await _context.Suppliers.FindAsync (id);
            if (supplier == null) return false;

            _context.Suppliers.Remove(supplier);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
