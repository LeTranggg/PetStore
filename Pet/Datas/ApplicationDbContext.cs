using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Pet.Models;
using System.Reflection.Metadata;



namespace Pet.Datas
{
    public class ApplicationDbContext : IdentityDbContext<User, Role, int>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Variant> Variants { get; set; }
        public DbSet<Value> Values { get; set; }
        public DbSet<VariantValue> VariantValues { get; set; } // Thêm bảng trung gian
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<PostCategory> PostCategories { get; set; } // Thêm bảng trung gian
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ReviewDetail> ReviewDetails { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Shipping> Shippings { get; set; }
        public DbSet<Payment> Payments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Định nghĩa khóa chính lưu các thông tin đăng nhập bên thứ ba
            modelBuilder.Entity<IdentityUserLogin<int>>()
                .HasKey(l => new { l.LoginProvider, l.ProviderKey });

            // Định nghĩa khóa chính cho bảng trung gian mối quan hệ giữa User và Role
            modelBuilder.Entity<IdentityUserRole<int>>()
                .HasKey(ur => new { ur.UserId, ur.RoleId });

            // Định nghĩa khóa chính để đảm bảo mỗi user không có nhiều token trùng lặp từ cùng một provider
            modelBuilder.Entity<IdentityUserToken<int>>()
                .HasKey(t => new { t.UserId, t.LoginProvider, t.Name });

            // Product - Category & Supplier
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId);

            modelBuilder.Entity<Product>()
                .HasOne(p => p.Supplier)
                .WithMany(s => s.Products)
                .HasForeignKey(p => p.SupplierId);

            // Variant - Product
            modelBuilder.Entity<Variant>()
                .HasOne(v => v.Product)
                .WithMany(p => p.Variants)
                .HasForeignKey(v => v.ProductId);

            // Variant - Value (N:M with VariantValue)
            modelBuilder.Entity<VariantValue>()
                .HasKey(vv => new { vv.VariantId, vv.ValueId });
            modelBuilder.Entity<VariantValue>()
                .HasOne(vv => vv.Variant)
                .WithMany(v => v.VariantValues)
                .HasForeignKey(vv => vv.VariantId);
            modelBuilder.Entity<VariantValue>()
                .HasOne(vv => vv.Value)
                .WithMany(v => v.VariantValues)
                .HasForeignKey(vv => vv.ValueId);

            // Post - User & Category (N:M with PostCategory)
            modelBuilder.Entity<Post>()
                .HasOne(p => p.User)
                .WithMany(u => u.Posts)
                .HasForeignKey(p => p.UserId);

            modelBuilder.Entity<PostCategory>()
                .HasKey(pc => new { pc.PostId, pc.CategoryId });
            modelBuilder.Entity<PostCategory>()
                .HasOne(pc => pc.Post)
                .WithMany(p => p.PostCategories)
                .HasForeignKey(pc => pc.PostId);
            modelBuilder.Entity<PostCategory>()
                .HasOne(pc => pc.Category)
                .WithMany(c => c.PostCategories)
                .HasForeignKey(pc => pc.CategoryId);

            // Review - User & ReviewDetail - Variant
            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.UserId);

            modelBuilder.Entity<ReviewDetail>()
                .HasOne(rd => rd.Review)
                .WithMany(r => r.ReviewDetails)
                .HasForeignKey(rd => rd.ReviewId);

            modelBuilder.Entity<ReviewDetail>()
                .HasOne(rd => rd.Variant)
                .WithMany(v => v.ReviewDetails)
                .HasForeignKey(rd => rd.VariantId);

            // Cart - User & CartItem - Variant
            modelBuilder.Entity<Cart>()
                .HasOne(c => c.User)
                .WithOne(u => u.Cart)
                .HasForeignKey<Cart>(c => c.UserId)
                .IsRequired(false); // UserId trong Cart không bắt buộc

            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Cart)
                .WithMany(c => c.CartItems)
                .HasForeignKey(ci => ci.CartId);

            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Variant)
                .WithMany(v => v.CartItems)
                .HasForeignKey(ci => ci.VariantId);

            // Order - User, Shipping, Payment & OrderDetail - Variant
            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.Shipping)
                .WithMany(s => s.Orders)
                .HasForeignKey(o => o.ShippingId);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.Payment)
                .WithMany(p => p.Orders)
                .HasForeignKey(o => o.PaymentId);

            modelBuilder.Entity<OrderDetail>()
                .HasOne(od => od.Order)
                .WithMany(o => o.OrderDetails)
                .HasForeignKey(od => od.OrderId);

            modelBuilder.Entity<OrderDetail>()
                .HasOne(od => od.Variant)
                .WithMany(v => v.OrderDetails)
                .HasForeignKey(od => od.VariantId);

            // User
            modelBuilder.Entity<User>()
                .Property(u => u.DateOfBirth)
                .HasColumnType("date"); //Make sure to save as date in database

            // Seed vai trò Admin
            modelBuilder.Entity<Role>().HasData(
                new Role
                {
                    Id = 1,
                    Name = "Admin",
                    NormalizedName = "ADMIN"
                }
            );

            // Seed tài khoản Admin
            var hasher = new PasswordHasher<User>();
            var adminUser = new User
            {
                Id = 1,
                UserName = "admin",
                NormalizedUserName = "ADMIN",
                Email = "admin@example.com",
                NormalizedEmail = "ADMIN@EXAMPLE.COM",
                EmailConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString(),
                Name = "Admin User",
                DateOfBirth = new DateTime(1980, 1, 1),
                Gender = "Male",
                PhoneNumber = "1234567890",
                Address = "Admin Address",
                LoyaltyCoins = 0,
                Status = "Active"
            };
            adminUser.PasswordHash = hasher.HashPassword(adminUser, "Admin@123");
            modelBuilder.Entity<User>().HasData(adminUser);

            // Liên kết User với Role
            modelBuilder.Entity<IdentityUserRole<int>>().HasData(
                new IdentityUserRole<int>
                {
                    UserId = 1,
                    RoleId = 1
                }
            );

        }
    }
}
