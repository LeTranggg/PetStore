using System.ComponentModel.DataAnnotations.Schema;

namespace Pet.Models
{
    public class ValueClassification
    {
        public int ValueId { get; set; }
        [ForeignKey("ValueId")]
        public Value Value { get; set; }
        public int ClassificationId { get; set; }
        [ForeignKey("ClassificationId")]
        public Classification Classification { get; set; }
    }
}
