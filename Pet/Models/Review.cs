using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Pet.Models
{
    public enum ReviewStatus
    {
        Reported,
        Unreported
    }

    public enum ReportReason
    {
        None,     
        Spam,         // Spam hoặc quảng cáo
        Harassment,   // Quấy rối, lạm dụng
        Fraud,        // Gian lận, giả mạo
        Violation,    // Vi phạm điều khoản
    }

    public class Review
    {
        [Key]
        public int Id { get; set; }
        public DateTime DateCreated { get; set; } = DateTime.Now;
        [Required]
        public ReviewStatus Status { get; set; } = ReviewStatus.Unreported;
        [MaxLength(200)]
        public ReportReason ReportReason { get; set; } = ReportReason.None;

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        public ICollection<ReviewDetail> ReviewDetails { get; set; }
    }
}
