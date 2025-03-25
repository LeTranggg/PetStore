using Pet.Dtos.Supplier;
using Pet.Models;

namespace Pet.Services.IServices
{
    public interface ISupplierService
    {
        Task<IEnumerable<SupplierDto>> GetAllSuppliersAsync();
        Task<SupplierDto> GetSupplierByIdAsync(int id);
        Task<SupplierDto> CreateSupplierAsync(CreateSupplierDto createSupplier);
        Task<SupplierDto> UpdateSupplierAsync(int id, UpdateSupplierDto updateSupplierDto);
        Task<bool> DeleteSupplierAsync(int id);
    }
}
