using System.Net;
using System.Net.Http.Json;
using System.Text.RegularExpressions;
using Xunit;

namespace InvoiceBuilderAPI.IntegrationTests;

[Collection("Api collection")]
public class InvoiceCreationTests
{
    private readonly HttpClient _client;

    public InvoiceCreationTests(ApiWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateInvoice_WithLineItems_PersistsInvoiceAndLineItems()
    {
        var sender = await ApiTestHelpers.CreateSenderAsync(_client, "sender-create-invoice@test.com");
        var customer = await ApiTestHelpers.CreateCustomerAsync(_client, "customer-create-invoice@test.com");

        var payload = new InvoiceContract
        {
            InvoiceDate = DateTime.UtcNow.Date,
            DueDate = DateTime.UtcNow.Date.AddDays(30),
            Currency = "USD",
            TaxRate = 15,
            Notes = "Integration test invoice",
            StatusId = 1,
            SenderEmail = sender.Email,
            CustomerEmail = customer.Email,
            InvoiceLineItems =
            [
                new InvoiceLineItemContract { Description = "Item A", Quantity = 2, UnitPrice = 10, Total = 20 },
                new InvoiceLineItemContract { Description = "Item B", Quantity = 1, UnitPrice = 30, Total = 30 }
            ]
        };

        var createResponse = await _client.PostAsJsonAsync("/api/invoices", payload);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var created = await createResponse.Content.ReadFromJsonAsync<InvoiceContract>();
        Assert.NotNull(created);
        Assert.Matches(new Regex(@"^INV-\d{4}-\d+$"), created.InvoiceNumber);
        Assert.Equal(2, created.InvoiceLineItems.Count);

        var getResponse = await _client.GetAsync($"/api/invoices/{Uri.EscapeDataString(created.InvoiceNumber)}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        var fetched = await getResponse.Content.ReadFromJsonAsync<InvoiceContract>();
        Assert.NotNull(fetched);
        Assert.Equal(created.InvoiceNumber, fetched.InvoiceNumber);
        Assert.Equal(2, fetched.InvoiceLineItems.Count);
    }
}
