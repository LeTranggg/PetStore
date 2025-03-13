using System.ComponentModel.DataAnnotations.Schema;

namespace Pet.Models
{
    public class VariantValue
    {
        public int VariantId { get; set; }
        [ForeignKey("VariantId")]
        public Variant Variant { get; set; }
        public int ValueId { get; set; }
        [ForeignKey("ValueId")]
        public Value Value { get; set; }
    }
}
