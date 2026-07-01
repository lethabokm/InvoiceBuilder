using InvoiceBuilderAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace InvoiceBuilderAPI.Data
{
    public class InvoiceBuilderDbContext : DbContext
    {
        public InvoiceBuilderDbContext(DbContextOptions<InvoiceBuilderDbContext> options)
            : base(options)
        {
        }

        public DbSet<Entity> Entities => Set<Entity>();
        public DbSet<Sender> Senders => Set<Sender>();
        public DbSet<Customer> Customers => Set<Customer>();
        public DbSet<Status> Statuses => Set<Status>();
        public DbSet<Invoice> Invoices => Set<Invoice>();
        public DbSet<InvoiceLineItem> InvoiceLineItems => Set<InvoiceLineItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Entity>().ToTable("Entities");
            modelBuilder.Entity<Sender>().ToTable("Senders");
            modelBuilder.Entity<Customer>().ToTable("Customers");
            modelBuilder.Entity<Status>().ToTable("Statuses");
            modelBuilder.Entity<Invoice>().ToTable("Invoices");
            modelBuilder.Entity<InvoiceLineItem>().ToTable("InvoiceLineItems");

            modelBuilder.ApplyConfiguration(new Configurations.EntityConfiguration());
            modelBuilder.ApplyConfiguration(new Configurations.SenderConfiguration());
            modelBuilder.ApplyConfiguration(new Configurations.CustomerConfiguration());
            modelBuilder.ApplyConfiguration(new Configurations.StatusConfiguration());
            modelBuilder.ApplyConfiguration(new Configurations.InvoiceConfiguration());
            modelBuilder.ApplyConfiguration(new Configurations.InvoiceLineItemConfiguration());

            modelBuilder.Entity<Status>().HasData(
                new Status { Id = 1, Name = "Draft" },
                new Status { Id = 2, Name = "Sent" },
                new Status { Id = 3, Name = "Paid" });
        }
    }
}
