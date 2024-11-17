using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pet.Models
{
    public class Payment
    {
        [Key]
        public int Id { get; set; }
        public bool ByCash { get; set; }
        [Required]
        public DateTime DateCreated { get; set; } = DateTime.Now;
        public bool IsSuccessfull { get; set; }

        [ValidateNever]
        public Order Order { get; set; }
    }
}
