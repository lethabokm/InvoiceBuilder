using InvoiceBuilderAPI.Data;
using InvoiceBuilderAPI.Services.Pdf;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace InvoiceBuilderAPI.IntegrationTests;

public sealed class ApiWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbPath = Path.Combine(Path.GetTempPath(), $"invoicebuilder-tests-{Guid.NewGuid():N}.db");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = $"Data Source={_dbPath}"
            });
        });

        builder.ConfigureServices(services =>
        {
            services.RemoveAll(typeof(IInvoicePdfService));
            services.AddScoped<IInvoicePdfService, TestPdfService>();

            services.RemoveAll(typeof(DbContextOptions<InvoiceBuilderDbContext>));
            services.AddDbContext<InvoiceBuilderDbContext>(options => options.UseSqlite($"Data Source={_dbPath}"));
        });
    }

    public new async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();

        if (File.Exists(_dbPath))
        {
            File.Delete(_dbPath);
        }
    }
}
