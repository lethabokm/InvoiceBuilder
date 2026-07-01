using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace InvoiceBuilderAPI.IntegrationTests;

[Collection("Api collection")]
public class CustomerCrudTests
{
    private readonly HttpClient _client;

    public CustomerCrudTests(ApiWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CustomerCrud_WorksEndToEnd()
    {
        var email = "customer-crud@test.com";
        var createPayload = new CustomerContract
        {
            CompanyName = "TruckingStuff",
            ContactPerson = "John Smith",
            Address = "12 Dock Road",
            Email = email,
            TaxId = "TX-987",
            PostalCode = "4001"
        };

        var createResponse = await _client.PostAsJsonAsync("/api/customers", createPayload);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var getResponse = await _client.GetAsync($"/api/customers/{Uri.EscapeDataString(email)}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        var updatePayload = new CustomerContract
        {
            CompanyName = "TruckingStuff Updated",
            ContactPerson = createPayload.ContactPerson,
            Address = createPayload.Address,
            Email = createPayload.Email,
            TaxId = createPayload.TaxId,
            PostalCode = createPayload.PostalCode
        };
        var updateResponse = await _client.PutAsJsonAsync($"/api/customers/{Uri.EscapeDataString(email)}", updatePayload);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        var updated = await updateResponse.Content.ReadFromJsonAsync<CustomerContract>();
        Assert.NotNull(updated);
        Assert.Equal("TruckingStuff Updated", updated.CompanyName);

        var deleteResponse = await _client.DeleteAsync($"/api/customers/{Uri.EscapeDataString(email)}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var getDeletedResponse = await _client.GetAsync($"/api/customers/{Uri.EscapeDataString(email)}");
        Assert.Equal(HttpStatusCode.NotFound, getDeletedResponse.StatusCode);
    }
}
