using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Pet.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Pet.Dtos
{
    public class CreateClassificationDto
    {
        [Required]
        public string Value { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public decimal Price { get; set; }
        [Required]
        public int Quantity { get; set; }
        [Required]
        public decimal Weight { get; set; }
        [Required]
        public decimal Height { get; set; }
        [Required]
        public decimal Length { get; set; }
        [Required]
        public decimal Width { get; set; }
        [Required]
        public string Product { get; set; }
    }
}
