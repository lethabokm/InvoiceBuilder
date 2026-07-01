using System.Net.Http.Json;

namespace InvoiceBuilderAPI.IntegrationTests;

internal static class ApiTestHelpers
{
    public static async Task<CustomerContract> CreateCustomerAsync(HttpClient client, string email)
    {
        var payload = new CustomerContract
        {
            CompanyName = "Acme Logistics",
            ContactPerson = "Jane Doe",
            Address = "123 Main Rd",
            Email = email,
            TaxId = "TAX-123",
            PostalCode = "2000"
        };

        var response = await client.PostAsJsonAsync("/api/customers", payload);
        response.EnsureSuccessStatusCode();

        return (await response.Content.ReadFromJsonAsync<CustomerContract>())!;
    }

    public static async Task<SenderContract> CreateSenderAsync(HttpClient client, string email)
    {
        var payload = new SenderContract
        {
            CompanyName = "BigDeal Pty",
            ContactPerson = "Lerato M",
            Address = "77 Market Street",
            Email = email,
            TaxId = "TAX-555",
            Phone = "+27110000000",
            BankDetails = "Bank XYZ 123456"
        };

        var response = await client.PostAsJsonAsync("/api/senders", payload);
        response.EnsureSuccessStatusCode();

        return (await response.Content.ReadFromJsonAsync<SenderContract>())!;
    }
}
