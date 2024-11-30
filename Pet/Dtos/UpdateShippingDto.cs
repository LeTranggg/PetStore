using Pet.Datas;
using System.ComponentModel.DataAnnotations;

namespace Pet.Dtos
{
    public class UpdateShippingDto
    {
        public ShippingMethod? ShippingMethod { get; set; }
        public decimal? Price { get; set; }
    }
}
