using System.ComponentModel.DataAnnotations;

namespace InvoiceBuilderAPI.Models
{
    public class Invoice
    {
        public int Id { get; set; }
        public string InvoiceNumber { get; set; } = null!;

        [Required]
        public DateTime InvoiceDate { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        [Required]
        [StringLength(3, MinimumLength = 3)]
        public string Currency { get; set; } = null!;

        [Range(0, 100)]
        public decimal TaxRate { get; set; }

        [StringLength(4000)]
        public string Notes { get; set; } = null!;

        [Range(1, int.MaxValue)]
        public int StatusId { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(320)]
        public string SenderEmail { get; set; } = null!;

        [Required]
        [EmailAddress]
        [StringLength(320)]
        public string CustomerEmail { get; set; } = null!;

        public DateTime CreatedAt { get; set; }
        public DateTime ModifiedAt { get; set; }

        [MinLength(1)]
        public ICollection<InvoiceLineItem> InvoiceLineItems { get; set; } = new List<InvoiceLineItem>();
    }
}
