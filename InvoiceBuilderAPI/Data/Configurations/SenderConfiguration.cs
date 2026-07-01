using InvoiceBuilderAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvoiceBuilderAPI.Data.Configurations
{
    public class SenderConfiguration : IEntityTypeConfiguration<Sender>
    {
        public void Configure(EntityTypeBuilder<Sender> builder)
        {
            builder.Property(s => s.Phone)
                .IsRequired()
                .HasMaxLength(20);
            builder.Property(s => s.BankDetails)
                .IsRequired()
                .HasMaxLength(200);
        }
    }
}
