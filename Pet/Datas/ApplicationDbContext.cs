using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Pet.Models;

namespace Pet.Datas
{
    public class ApplicationDbContext : IdentityDbContext<User, Role, int>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<PostCategory> PostCategories { get; set; } // Bảng trung gian
        public DbSet<Product> Products { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ReviewDetail> ReviewDetails { get; set; }
        public DbSet<Shipping> Shippings { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Value> Values { get; set; }
        public DbSet<Variant> Variants { get; set; }
        public DbSet<VariantValue> VariantValues { get; set; } // Bảng trung gian

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Định nghĩa khóa chính lưu các thông tin đăng nhập bên thứ ba
            modelBuilder.Entity<IdentityUserLogin<int>>()
                .HasKey(l => new { l.LoginProvider, l.ProviderKey });

            // Định nghĩa khóa chính để đảm bảo mỗi user không có nhiều token trùng lặp từ cùng một provider
            modelBuilder.Entity<IdentityUserToken<int>>()
                .HasKey(t => new { t.UserId, t.LoginProvider, t.Name });

            // User
            modelBuilder.Entity<User>()
                .Property(u => u.DateOfBirth)
                .HasColumnType("date"); // Lưu date trong database

            modelBuilder.Entity<User>()
                .Property(u => u.Gender)
                .HasConversion<string>(); // Chuyển đổi enum thành chuỗi

            modelBuilder.Entity<User>()
                .Property(u => u.LockReason)
                .HasConversion<string>();

            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Cart)
                .WithOne(c => c.User)
                .HasForeignKey<Cart>(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // CartItem
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Cart)
                .WithMany(c => c.CartItems)
                .HasForeignKey(ci => ci.CartId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Variant)
                .WithMany(v => v.CartItems)
                .HasForeignKey(ci => ci.VariantId)
                .OnDelete(DeleteBehavior.Restrict);

            // Product
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Product>()
                .HasOne(p => p.Supplier)
                .WithMany(s => s.Products)
                .HasForeignKey(p => p.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            // Variant
            modelBuilder.Entity<Variant>()
                .HasOne(v => v.Product)
                .WithMany(p => p.Variants)
                .HasForeignKey(v => v.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // Order
            modelBuilder.Entity<Order>()
                .Property(o => o.Status)
                .HasConversion<string>(); // Chuyển đổi enum thành chuỗi

            modelBuilder.Entity<Order>()
                .Property(o => o.CancelReason)
                .HasConversion<string>(); 

            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.Shipping)
                .WithMany(s => s.Orders)
                .HasForeignKey(o => o.ShippingId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.Payment)
                .WithMany(p => p.Orders)
                .HasForeignKey(o => o.PaymentId)
                .OnDelete(DeleteBehavior.Restrict);

            // OrderDetail
            modelBuilder.Entity<OrderDetail>()
                .HasOne(od => od.Order)
                .WithMany(o => o.OrderDetails)
                .HasForeignKey(od => od.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderDetail>()
                .HasOne(od => od.Variant)
                .WithMany(v => v.OrderDetails)
                .HasForeignKey(od => od.VariantId)
                .OnDelete(DeleteBehavior.Restrict);

            // Post
            modelBuilder.Entity<Post>()
                .HasOne(p => p.User)
                .WithMany(u => u.Posts)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // PostCategory
            modelBuilder.Entity<PostCategory>()
                .HasKey(pc => new { pc.PostId, pc.CategoryId });

            modelBuilder.Entity<PostCategory>()
                .HasOne(pc => pc.Post)
                .WithMany(p => p.PostCategories)
                .HasForeignKey(pc => pc.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PostCategory>()
                .HasOne(pc => pc.Category)
                .WithMany(c => c.PostCategories)
                .HasForeignKey(pc => pc.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Review
            modelBuilder.Entity<Review>()
                .Property(u => u.Status)
                .HasConversion<string>(); // Chuyển đổi enum thành chuỗi

            modelBuilder.Entity<Review>()
                .Property(u => u.ReportReason)
                .HasConversion<string>();

            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // ReviewDetail
            modelBuilder.Entity<ReviewDetail>()
                .HasOne(rd => rd.Review)
                .WithMany(r => r.ReviewDetails)
                .HasForeignKey(rd => rd.ReviewId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ReviewDetail>()
                .HasOne(rd => rd.Variant)
                .WithMany(v => v.ReviewDetails)
                .HasForeignKey(rd => rd.VariantId)
                .OnDelete(DeleteBehavior.Restrict);

            // VariantValue
            modelBuilder.Entity<VariantValue>()
                .HasKey(vv => new { vv.VariantId, vv.ValueId });

            modelBuilder.Entity<VariantValue>()
                .HasOne(vv => vv.Variant)
                .WithMany(v => v.VariantValues)
                .HasForeignKey(vv => vv.VariantId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<VariantValue>()
                .HasOne(vv => vv.Value)
                .WithMany(v => v.VariantValues)
                .HasForeignKey(vv => vv.ValueId)
                .OnDelete(DeleteBehavior.Restrict);

            // Payment
            modelBuilder.Entity<Payment>()
                .Property(u => u.Method)
                .HasConversion<string>(); // Chuyển đổi enum thành chuỗi

            // Shipping
            modelBuilder.Entity<Shipping>()
                .Property(u => u.Method)
                .HasConversion<string>(); // Chuyển đổi enum thành chuỗi

            // Seed Admin role
            var adminRoleId = 1;
            modelBuilder.Entity<Role>().HasData(
                new Role
                {
                    Id = adminRoleId,
                    Name = "Admin",
                    NormalizedName = "ADMIN",
                    ConcurrencyStamp = Guid.NewGuid().ToString()
                }
            );

            // Seed Admin user
            var adminId = 1;
            var hasher = new PasswordHasher<User>();
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = adminId,
                    UserName = "admin@petshop.com",
                    NormalizedUserName = "ADMIN@PETSHOP.COM",
                    Email = "admin@petshop.com",
                    NormalizedEmail = "ADMIN@PETSHOP.COM",
                    EmailConfirmed = true,
                    PasswordHash = hasher.HashPassword(null, "Admin@123"),
                    SecurityStamp = Guid.NewGuid().ToString(),
                    PhoneNumber = "0123456789",
                    Name = "Administrator",
                    DateOfBirth = new DateTime(1999, 1, 1),
                    Gender = Gender.Male,
                    Address = "System Address",
                    LoyaltyCoins = 0,
                    LockoutEnabled = false,
                    LockReason = LockReason.None,
                    RoleId = adminRoleId
                }
            );

        }
    }
}
