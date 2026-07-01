using System.ComponentModel.DataAnnotations;

namespace InvoiceBuilderAPI.Models
{
    public abstract class Entity
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string CompanyName { get; set; } = null!;

        [Required]
        [StringLength(200)]
        public string ContactPerson { get; set; } = null!;

        [Required]
        [StringLength(500)]
        public string Address { get; set; } = null!;

        [Required]
        [EmailAddress]
        [StringLength(320)]
        public string Email { get; set; } = null!;

        [Required]
        [StringLength(100)]
        public string TaxId { get; set; } = null!;

        public bool Active { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime ModifiedAt { get; set; }
    }
}
