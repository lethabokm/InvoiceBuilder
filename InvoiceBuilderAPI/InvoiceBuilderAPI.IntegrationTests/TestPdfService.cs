using InvoiceBuilderAPI.Models;
using InvoiceBuilderAPI.Services.Pdf;

namespace InvoiceBuilderAPI.IntegrationTests;

internal sealed class TestPdfService : IInvoicePdfService
{
    public Task<byte[]> GenerateInvoicePdfAsync(Invoice invoice, Customer customer, Sender sender, CancellationToken cancellationToken)
    {
        return Task.FromResult("%PDF-1.4 test pdf"u8.ToArray());
    }
}
