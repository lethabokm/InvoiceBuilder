using Xunit;

namespace InvoiceBuilderAPI.IntegrationTests;

[CollectionDefinition("Api collection")]
public class IntegrationTestCollection : ICollectionFixture<ApiWebApplicationFactory>
{
}
