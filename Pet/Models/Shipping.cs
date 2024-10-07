using System.ComponentModel.DataAnnotations;

namespace Pet.Models
{
    public class Shipping
    {
        [Key]
        public int Id { get; set; }
        [Required, MaxLength(20)]
        public string Name { get; set; }
        [Required]
        public decimal Price { get; set; }

        public decimal CalculateShippingCost(decimal weight, decimal length, decimal width, decimal height)
        {
            decimal volumetricWeight = (length * width * height) / 5000;
            if (Name == "Road" || Name == "Air")
            {
                return weight > volumetricWeight ? weight * Price : volumetricWeight * Price;
            }
            else if (Name == "Sea")
            {
                return weight < 1000 ? weight * Price : volumetricWeight * Price;
            }
            else if (Name == "Rail")
            {
                if (weight <= 20)
                    return weight * Price;
                else
                    return ((weight / 20) * Price);
            }
            return 0;

        }

    }
}
