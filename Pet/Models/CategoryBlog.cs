using System.ComponentModel.DataAnnotations.Schema;

namespace Pet.Models
{
    public class CategoryBlog
    {
        public int CategoryId { get; set; }
        [ForeignKey("CategoryId")]
        public Category Category { get; set; }
        public int BlogId { get; set; }
        [ForeignKey("BlogId")]
        public Blog Blog { get; set; }
    }
}
