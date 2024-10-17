namespace Pet.Repositories.IRepositories
{
    public interface IUnitOfWork
    {
        IUserRepository UserRepository { get; }
        IRoleRepository RoleRepository { get; }

        Task<int> SaveAsync();
    }
}
