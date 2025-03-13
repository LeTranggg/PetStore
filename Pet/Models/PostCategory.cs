using System.ComponentModel.DataAnnotations.Schema;

namespace Pet.Models
{
    public class PostCategory
    {
        public int PostId { get; set; }
        [ForeignKey("PostId")]
        public Post Post { get; set; }
        public int CategoryId { get; set; }
        [ForeignKey("CategoryId")]
        public Category Category { get; set; }
    }
}
