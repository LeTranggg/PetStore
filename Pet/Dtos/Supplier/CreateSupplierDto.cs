namespace Pet.Dtos.Supplier
{
    public class CreateSupplierDto
    {
        public string Email { get; set; }
        public string Name { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public IFormFile? Image { get; set; }
    }
}
