using Microsoft.AspNetCore.Identity;
using Pet.Datas;
using Pet.Models;
using Pet.Repositories.IRepositories;

namespace Pet.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHasher<User> _passwordHasher;

        public IUserRepository UserRepository { get; private set; }
        public IRoleRepository RoleRepository { get; private set; }
        public ICategoryRepository CategoryRepository { get; private set; }
        public ISupplierRepository SupplierRepository { get; private set; }
        public IProductRepository ProductRepository { get; private set; }
        public IClassificationRepository ClassificationRepository { get; private set; }
        public IShippingRepository ShippingRepository { get; private set; }
        public ICartRepository CartRepository { get; private set; }
        public ICartItemRepository CartItemRepository { get; private set; }
        public IPaymentRepository PaymentRepository { get; private set; }
        public IOrderRepository OrderRepository { get; private set; }  
        public IOrderDetailRepository OrderDetailRepository { get; private set; }

        public UnitOfWork(ApplicationDbContext context, IPasswordHasher<User> passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;

            UserRepository = new UserRepository(_context, _passwordHasher);
            RoleRepository = new RoleRepository(_context);
            CategoryRepository = new CategoryRepository(_context);
            SupplierRepository = new SupplierRepository(_context);
            ProductRepository = new ProductRepository(_context);
            ClassificationRepository = new ClassificationRepository(_context);
            ShippingRepository = new ShippingRepository(_context);
            CartRepository = new CartRepository(_context);
            CartItemRepository = new CartItemRepository(_context);
            PaymentRepository = new PaymentRepository(_context);
            OrderRepository = new OrderRepository(_context);   
            OrderDetailRepository = new OrderDetailRepository(_context);

        }

        public async Task<int> SaveAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}
