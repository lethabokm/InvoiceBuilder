using InvoiceBuilderAPI.Data;
using InvoiceBuilderAPI.Services.Pdf;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var corsPolicyName = "FrontendDev";

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<InvoiceBuilderDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IInvoicePdfService, PlaywrightInvoicePdfService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicyName, policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();
var app = builder.Build();

// Apply pending migrations and ensure database exists.
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<InvoiceBuilderDbContext>();
    dbContext.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Invoice Builder V1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();

app.UseCors(corsPolicyName);

app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program
{
}
