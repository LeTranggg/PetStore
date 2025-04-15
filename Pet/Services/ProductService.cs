using AutoMapper;
using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using Pet.Datas;
using Pet.Models;
using Pet.Services.IServices;
using Pet.Dtos.Product;
using Microsoft.EntityFrameworkCore;
using Pet.Dtos.User;

namespace Pet.Services
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly Cloudinary _cloudinary;

        public ProductService(ApplicationDbContext context, IMapper mapper, Cloudinary cloudinary)
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

        // Xem danh sách products
        public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.Variants).ThenInclude(v => v.VariantValues).ThenInclude(vv => vv.Value).ThenInclude(vf => vf.Feature) // Include Value để lấy Name
                .ToListAsync();

            return _mapper.Map<IEnumerable<ProductDto>>(products);
        }

        // Xem chi tiết product theo ID
        public async Task<ProductDto> GetProductByIdAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) throw new KeyNotFoundException($"Product with ID {id} not found.");

            await _context.Entry(product).Reference(p => p.Category).LoadAsync();
            await _context.Entry(product).Reference(p => p.Supplier).LoadAsync();
            await _context.Entry(product).Collection(p => p.Variants).Query()
                                         .Include(v => v.VariantValues).ThenInclude(vv => vv.Value)
                                         .LoadAsync(); // Load Variants với VariantValues và Value

            return _mapper.Map<ProductDto>(product);
        }

        // Tạo product mới
        public async Task<ProductDto> CreateProductAsync(int userId, CreateProductDto createProductDto)
        {
            await CheckUserAsync(userId);

            if (await _context.Products.AnyAsync(s => s.Name == createProductDto.Name))
                throw new InvalidOperationException($"Product with mame '{createProductDto.Name}' already exists.");

            var product = _mapper.Map<Product>(createProductDto);

            if (createProductDto.Image != null)
                product.Image = await UploadImageToCloudinaryAsync(createProductDto.Image);

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            await _context.Entry(product).Reference(p => p.Category).LoadAsync();
            await _context.Entry(product).Reference(p => p.Supplier).LoadAsync();
            await _context.Entry(product).Collection(p => p.Variants).Query()
                                         .Include(v => v.VariantValues).ThenInclude(vv => vv.Value)
                                         .LoadAsync(); // Load Variants với VariantValues và Value

            return _mapper.Map<ProductDto>(product);
        }

        // Cập nhật product
        public async Task<ProductDto> UpdateProductAsync(int userId, int id, UpdateProductDto updateProductDto)
        {
            await CheckUserAsync(userId);

            var product = await _context.Products.FindAsync(id);
            if (product == null) throw new KeyNotFoundException($"Product with ID {id} not found.");

            if (updateProductDto.Name != null && updateProductDto.Name != product.Name)
            {
                if (await _context.Products.AnyAsync(s => s.Name == updateProductDto.Name))
                    throw new InvalidOperationException($"Product with name '{updateProductDto.Name}' already exists.");

                product.Name = updateProductDto.Name;
            }
            if (updateProductDto.Description != null) product.Description = updateProductDto.Description;
            if (updateProductDto.Price.HasValue) product.Price = updateProductDto.Price.Value;
            if (updateProductDto.Image != null) product.Image = await UploadImageToCloudinaryAsync(updateProductDto.Image);
            if (updateProductDto.CategoryId.HasValue) product.CategoryId = updateProductDto.CategoryId.Value;
            if (updateProductDto.SupplierId.HasValue) product.SupplierId = updateProductDto.SupplierId.Value;

            _context.Products.Update(product);
            await _context.SaveChangesAsync();

            await _context.Entry(product).Reference(p => p.Category).LoadAsync();
            await _context.Entry(product).Reference(p => p.Supplier).LoadAsync();
            await _context.Entry(product).Collection(p => p.Variants).Query()
                                         .Include(v => v.VariantValues).ThenInclude(vv => vv.Value)
                                         .LoadAsync();

            return _mapper.Map<ProductDto>(product);
        }

        // Xoá product
        public async Task<bool> DeleteProductAsync(int userId, int id)
        {
            await CheckUserAsync(userId);

            var product = await _context.Products.FindAsync(id);
            if (product == null) return false;

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
