using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pet.Models
{
    public class Payment
    {
        [Key]
        public int Id { get; set; }
        public bool ByCash { get; set; } = true;
        public bool IsSuccessfull { get; set; } = false;

        [ValidateNever]
        public Order Order { get; set; }
    }
}
