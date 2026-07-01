using System.ComponentModel.DataAnnotations;

namespace InvoiceBuilderAPI.Models
{
    public class Sender : Entity
    {
        [Required]
        [Phone]
        [StringLength(50)]
        public string Phone { get; set; } = null!;

        [Required]
        [StringLength(500)]
        public string BankDetails { get; set; } = null!;
    }
}
