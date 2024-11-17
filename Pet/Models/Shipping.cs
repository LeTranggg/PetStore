using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Pet.Datas;
using System.ComponentModel.DataAnnotations;

namespace Pet.Models
{
    public class Shipping
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public ShippingMethod ShippingMethod { get; set; }
        [Required]
        public decimal Price { get; set; }

        [ValidateNever]
        public ICollection<Order> Orders { get; set; }

        public decimal CalculateShippingCost(decimal weight, decimal length, decimal width, decimal height)
        {
            decimal volumetricWeight = (length * width * height) / 5000;
            if (ShippingMethod == ShippingMethod.Road || ShippingMethod == ShippingMethod.Air)
            {
                return weight > volumetricWeight ? weight * Price : volumetricWeight * Price;
            }
            else if (ShippingMethod == ShippingMethod.Sea)
            {
                return weight < 1000 ? weight * Price : volumetricWeight * Price;
            }
            else if (ShippingMethod == ShippingMethod.Rail)
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
