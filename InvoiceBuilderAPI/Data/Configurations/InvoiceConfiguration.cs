using InvoiceBuilderAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvoiceBuilderAPI.Data.Configurations
{
    public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
    {
        public void Configure(EntityTypeBuilder<Invoice> builder)
        {
            builder.HasKey(i => i.Id);
            builder.Property(i => i.InvoiceDate)
                .IsRequired();
            builder.Property(i => i.DueDate)
                .IsRequired();
            builder.Property(i => i.Currency)
                .IsRequired()
                .HasMaxLength(10);
            builder.Property(i => i.TaxRate)
                .IsRequired();
            builder.Property(i => i.Notes)
                .HasMaxLength(1000);
            builder.Property(i => i.InvoiceNumber)
                .IsRequired()
                .HasMaxLength(50);
            builder.HasIndex(i => i.InvoiceNumber)
                .IsUnique();
            builder.Property(i => i.StatusId)
                .IsRequired();
            builder.Property(i => i.SenderEmail)
                .IsRequired()
                .HasMaxLength(200);
            builder.Property(i => i.CustomerEmail)
                .IsRequired()
                .HasMaxLength(200);
            builder.Property(i => i.CreatedAt)
                .IsRequired();
            builder.Property(i => i.ModifiedAt)
                .IsRequired();

            builder.HasOne<Status>()
                .WithMany()
                .HasForeignKey(i => i.StatusId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
