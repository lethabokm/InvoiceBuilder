using System.ComponentModel.DataAnnotations;

namespace InvoiceBuilderAPI.Models
{
    public class Customer : Entity
    {
        [Required]
        [StringLength(20)]
        public string PostalCode { get; set; } = null!;
    }
}
