using System.ComponentModel.DataAnnotations;

namespace InvoiceBuilderAPI.Models
{
    public class InvoiceLineItem
    {
        public int Id { get; set; }
        public int InvoiceId { get; set; }
        public string InvoiceNumber { get; set; } = null!;

        [Required]
        [StringLength(500)]
        public string Description { get; set; } = null!;

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [Range(0.01, 999999999.99)]
        public decimal UnitPrice { get; set; }

        [Range(0.01, 999999999.99)]
        public decimal Total { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime ModifiedAt { get; set; }
    }
}
