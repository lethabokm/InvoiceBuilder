using InvoiceBuilderAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvoiceBuilderAPI.Data.Configurations
{
    public class InvoiceLineItemConfiguration : IEntityTypeConfiguration<InvoiceLineItem>
    {
        public void Configure(EntityTypeBuilder<InvoiceLineItem> builder)
        {
            builder.HasKey(li => li.Id);
            builder.Property(li => li.InvoiceId)
                .IsRequired();
            builder.Property(li => li.InvoiceNumber)
                .IsRequired()
                .HasMaxLength(50);
            builder.Property(li => li.Description)
                .IsRequired()
                .HasMaxLength(1000);
            builder.Property(li => li.Quantity)
                .IsRequired();
            builder.Property(li => li.UnitPrice)
                .IsRequired();
            builder.Property(li => li.Total)
                .IsRequired();
            builder.Property(li => li.CreatedAt)
                .IsRequired();
            builder.Property(li => li.ModifiedAt)
                .IsRequired();

            builder.HasIndex(li => li.InvoiceId);

            builder.HasOne<Invoice>()
                .WithMany(i => i.InvoiceLineItems)
                .HasForeignKey(li => li.InvoiceId)
                .HasPrincipalKey(i => i.Id)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
