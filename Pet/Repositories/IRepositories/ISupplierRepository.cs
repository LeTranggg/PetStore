using Pet.Models;

namespace Pet.Repositories.IRepositories
{
    public interface ISupplierRepository : IRepository<Supplier>
    {
        Task<Supplier> GetSupplierByNameAsync(string supplierName); //Phương thức để lấy role dựa trên tên role
        Task<IEnumerable<Supplier>> GetAllSuppliersWithProductsAsync();
        Task<Supplier> GetSupplierByEmailAsync(string email);
    }
}
