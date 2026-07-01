using InvoiceBuilderAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvoiceBuilderAPI.Data.Configurations
{
    public class EntityConfiguration : IEntityTypeConfiguration<Entity>
    {
        public void Configure(EntityTypeBuilder<Entity> builder)
        {
            builder.HasKey(e => e.Id);
            builder.Property(e => e.CompanyName)
                .IsRequired()
                .HasMaxLength(200);
            builder.Property(e => e.ContactPerson)
                .IsRequired()
                .HasMaxLength(150);
            builder.Property(e => e.Address)
                .IsRequired()
                .HasMaxLength(300);
            builder.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(200);
            builder.Property(e => e.TaxId)
                .IsRequired()
                .HasMaxLength(50);
            builder.Property(e => e.Active)
                .IsRequired();
            builder.Property(e => e.CreatedAt)
                .IsRequired();
            builder.Property(e => e.ModifiedAt)
                .IsRequired();
            builder.HasIndex(e => e.Email);
        }
    }
}
