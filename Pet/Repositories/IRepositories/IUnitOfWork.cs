namespace Pet.Repositories.IRepositories
{
    public interface IUnitOfWork
    {
        IUserRepository UserRepository { get; }
        IRoleRepository RoleRepository { get; }
        ICategoryRepository CategoryRepository { get; }
        ISupplierRepository SupplierRepository { get; }

        Task<int> SaveAsync();
    }
}
