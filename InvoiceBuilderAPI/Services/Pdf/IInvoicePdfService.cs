using InvoiceBuilderAPI.Models;

namespace InvoiceBuilderAPI.Services.Pdf
{
    public interface IInvoicePdfService
    {
        Task<byte[]> GenerateInvoicePdfAsync(Invoice invoice, Customer customer, Sender sender, CancellationToken cancellationToken);
    }
}
