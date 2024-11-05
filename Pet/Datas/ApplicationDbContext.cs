using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Pet.Models;

namespace Pet.Datas
{
    public class ApplicationDbContext : IdentityDbContext<User, Role, int>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Classification> Classifications { get; set; }
        public DbSet<ClassificationMedia> ClassificationMedias { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ReviewDetail> ReviewDetails { get; set; }
        public DbSet<ReviewMedia> ReviewMedias { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Shipping> Shippings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Configuring relationships and constraints

            // Category
            modelBuilder.Entity<Category>()
                .HasMany(c => c.Products)
                .WithOne(p => p.Category)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            // Supplier
            modelBuilder.Entity<Supplier>()
                .HasMany(s => s.Products)
                .WithOne(p => p.Supplier)
                .HasForeignKey(p => p.SupplierId)
                .OnDelete(DeleteBehavior.Cascade);

            // Product
            modelBuilder.Entity<Product>()
                .HasMany(p => p.Classifications)
                .WithOne(c => c.Product)
                .HasForeignKey(c => c.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Product>()
                .HasMany(p => p.Reviews)
                .WithOne(r => r.Product)
                .HasForeignKey(r => r.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // Classification
            modelBuilder.Entity<Classification>()
                .HasMany(c => c.OrderDetails)
                .WithOne(od => od.Classification)
                .HasForeignKey(od => od.ClassificationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Classification>()
                .HasMany(c => c.ReviewDetails)
                .WithOne(rd => rd.Classification)
                .HasForeignKey(rd => rd.ClassificationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Classification>()
                .HasMany(c => c.CartItems)
                .WithOne(ci => ci.Classification)
                .HasForeignKey(ci => ci.ClassificationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Classification>()
                .HasMany(c => c.ClassificationMedias)
                .WithOne(cm => cm.Classification)
                .HasForeignKey(cm => cm.ClassificationId)
                .OnDelete(DeleteBehavior.Cascade);

            // User
            modelBuilder.Entity<User>()
                .Property(u => u.DateOfBirth)
                .HasColumnType("date"); //Make sure to save as date in database

            modelBuilder.Entity<User>()
                .HasMany(u => u.Carts)
                .WithOne(c => c.User)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<User>()
                .HasMany(u => u.Orders)
                .WithOne(o => o.User)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<User>()
                .HasMany(u => u.Reviews)
                .WithOne(r => r.User)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Cart
            modelBuilder.Entity<Cart>()
                .HasMany(c => c.CartItems)
                .WithOne(ci => ci.Cart)
                .HasForeignKey(ci => ci.CartId)
                .OnDelete(DeleteBehavior.Cascade);

            // Order
            modelBuilder.Entity<Order>()
                .HasMany(o => o.OrderDetails)
                .WithOne(od => od.Order)
                .HasForeignKey(od => od.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Review
            modelBuilder.Entity<Review>()
                .HasMany(r => r.ReviewDetails)
                .WithOne(rd => rd.Review)
                .HasForeignKey(rd => rd.ReviewId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasMany(r => r.ReviewMedias)
                .WithOne(rm => rm.Review)
                .HasForeignKey(rm => rm.ReviewId)
                .OnDelete(DeleteBehavior.Cascade);

            // Role
            modelBuilder.Entity<Role>()
                .HasMany(r => r.Users)
                .WithOne(u => u.Role)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            // Seed Admin Role
            var adminRoleId = 1;
            var adminRole = new Role
            {
                Id = adminRoleId,
                Name = "Admin",
                NormalizedName = "ADMIN"
            };

            // Seed Admin User
            var adminUserId = 1;
            var passwordHasher = new PasswordHasher<User>();
            var adminUser = new User
            {
                Id = adminUserId,
                UserName = "admin",
                NormalizedUserName = "ADMIN",
                Email = "admin@example.com",
                NormalizedEmail = "ADMIN@EXAMPLE.COM",
                EmailConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString(),
                FirstName = "Admin",
                LastName = "User",
                DateOfBirth = new DateTime(1980, 1, 1),
                Address = "Admin Address",
                PhoneNumber = "1234567890",
                RoleId = adminRoleId,
                IsBlock = false,
                LoyaltyCoin = 0
            };

            // Set PasswordHash for the Admin User
            adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, "Admin@123");

            // Seeding Data
            modelBuilder.Entity<Role>().HasData(adminRole);
            modelBuilder.Entity<User>().HasData(adminUser);

        }
    }
}
