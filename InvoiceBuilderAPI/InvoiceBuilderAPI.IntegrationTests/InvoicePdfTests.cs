using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace InvoiceBuilderAPI.IntegrationTests;

[Collection("Api collection")]
public class InvoicePdfTests
{
    private readonly HttpClient _client;

    public InvoicePdfTests(ApiWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetInvoicePdf_ReturnsPdfFile()
    {
        var sender = await ApiTestHelpers.CreateSenderAsync(_client, "sender-pdf@test.com");
        var customer = await ApiTestHelpers.CreateCustomerAsync(_client, "customer-pdf@test.com");

        var payload = new InvoiceContract
        {
            InvoiceDate = DateTime.UtcNow.Date,
            DueDate = DateTime.UtcNow.Date.AddDays(14),
            Currency = "USD",
            TaxRate = 10,
            Notes = "PDF test invoice",
            StatusId = 1,
            SenderEmail = sender.Email,
            CustomerEmail = customer.Email,
            InvoiceLineItems =
            [
                new InvoiceLineItemContract { Description = "PDF line", Quantity = 1, UnitPrice = 100, Total = 100 }
            ]
        };

        var createResponse = await _client.PostAsJsonAsync("/api/invoices", payload);
        createResponse.EnsureSuccessStatusCode();
        var created = await createResponse.Content.ReadFromJsonAsync<InvoiceContract>();
        Assert.NotNull(created);

        var pdfResponse = await _client.GetAsync($"/api/invoices/{Uri.EscapeDataString(created.InvoiceNumber)}/pdf");
        Assert.Equal(HttpStatusCode.OK, pdfResponse.StatusCode);
        Assert.Equal("application/pdf", pdfResponse.Content.Headers.ContentType?.MediaType);

        var bytes = await pdfResponse.Content.ReadAsByteArrayAsync();
        Assert.NotEmpty(bytes);
    }
}
