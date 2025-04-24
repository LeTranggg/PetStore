using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Pet.Datas;
using System.ComponentModel.DataAnnotations;

namespace Pet.Models
{
    public enum ShippingMethod
    {
        Road,
        Air,
        Sea,
        Rail
    }

    public class Shipping
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(50)]
        public ShippingMethod Method { get; set; } = ShippingMethod.Road;
        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        public ICollection<Order> Orders { get; set; }

        /*public decimal CalculateShippingCost(decimal weight, decimal length, decimal width, decimal height)
        {
            decimal volumetricWeight = (length * width * height) / 5000;
            if (Method == ShippingMethod.Road || Method == ShippingMethod.Air)
                return weight > volumetricWeight ? weight * Price : volumetricWeight * Price;
            else if (Method == ShippingMethod.Sea) return weight < 1000 ? weight * Price : volumetricWeight * Price;
            else if (Method == ShippingMethod.Rail)
            {
                if (weight <= 20) return weight * Price;
                else return ((weight / 20) * Price);
            }
            return 0;

        }*/

        public decimal CalculateShippingCost(decimal weight, decimal length, decimal width, decimal height)
        {
            // Calculate volumetric weight
            decimal volumetricWeight = (length * width * height) / 5000;
            Console.WriteLine($"CalculateShippingCost: Volumetric Weight = (Length: {length} * Width: {width} * Height: {height}) / 5000 = {volumetricWeight}");

            // Log the comparison between actual weight and volumetric weight
            Console.WriteLine($"CalculateShippingCost: Actual Weight = {weight}, Volumetric Weight = {volumetricWeight}");

            // Calculate shipping cost based on the shipping method
            if (Method == ShippingMethod.Road || Method == ShippingMethod.Air)
            {
                decimal cost = weight > volumetricWeight ? weight * Price : volumetricWeight * Price;
                Console.WriteLine($"CalculateShippingCost: Method = {Method}, Using {(weight > volumetricWeight ? "Actual Weight" : "Volumetric Weight")}, Cost = {(weight > volumetricWeight ? weight : volumetricWeight)} * Price ({Price}) = {cost} VND");
                return cost;
            }
            else if (Method == ShippingMethod.Sea)
            {
                decimal cost = weight < 1000 ? weight * Price : volumetricWeight * Price;
                Console.WriteLine($"CalculateShippingCost: Method = Sea, Weight {(weight < 1000 ? "< 1000, Using Actual Weight" : ">= 1000, Using Volumetric Weight")}, Cost = {(weight < 1000 ? weight : volumetricWeight)} * Price ({Price}) = {cost} VND");
                return cost;
            }
            else if (Method == ShippingMethod.Rail)
            {
                if (weight <= 20)
                {
                    decimal cost = weight * Price;
                    Console.WriteLine($"CalculateShippingCost: Method = Rail, Weight <= 20, Cost = Weight ({weight}) * Price ({Price}) = {cost} VND");
                    return cost;
                }
                else
                {
                    decimal cost = ((weight / 20) * Price);
                    Console.WriteLine($"CalculateShippingCost: Method = Rail, Weight > 20, Cost = (Weight ({weight}) / 20) * Price ({Price}) = {cost} VND");
                    return cost;
                }
            }
            else
            {
                Console.WriteLine($"CalculateShippingCost: Unknown Shipping Method ({Method}), Returning 0");
                return 0;
            }
        }
    }
}
