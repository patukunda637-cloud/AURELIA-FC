using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace AureliaFc.Api.Tests;

/// <summary>
/// Boots the real API in-process (WebApplicationFactory) against the configured
/// MySQL database and exercises the public surface end to end.
///
/// Running requirements: MySQL reachable with the schema/appsettings connection
/// string, exactly as for `dotnet run`.
/// </summary>
public sealed class ApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
    }

    public HttpClient Client()
    {
        var c = CreateClient();
        c.BaseAddress = new Uri("http://localhost/");
        return c;
    }
}

public sealed class ApiEndpointTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private static async Task<JsonElement> Body(HttpResponseMessage res) =>
        JsonDocument.Parse(await res.Content.ReadAsStringAsync()).RootElement.Clone();

    /// <summary>A second client carrying the given bearer token.</summary>
    private HttpClient Authed(string token)
    {
        var c = factory.Client();
        c.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return c;
    }

    // ---------------------------------------------------------------------
    // Health and content
    // ---------------------------------------------------------------------

    [Fact]
    public async Task Health_reports_database_connected()
    {
        var res = await factory.Client().GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var json = await Body(res);
        Assert.Equal("healthy", json.GetProperty("status").GetString());
        Assert.True(json.GetProperty("database").GetBoolean());
    }

    [Theory]
    [InlineData("/api/content/club")]
    [InlineData("/api/content/milestones")]
    [InlineData("/api/content/values")]
    [InlineData("/api/content/honours")]
    [InlineData("/api/content/executives")]
    [InlineData("/api/content/partners")]
    [InlineData("/api/content/quick-links")]
    [InlineData("/api/content/faqs")]
    [InlineData("/api/content/departments")]
    [InlineData("/api/squads")]
    [InlineData("/api/players")]
    [InlineData("/api/matches")]
    [InlineData("/api/matches/standings")]
    [InlineData("/api/tickets")]
    [InlineData("/api/tickets/season-tiers")]
    [InlineData("/api/tickets/hospitality")]
    [InlineData("/api/shop/categories")]
    [InlineData("/api/shop/products")]
    [InlineData("/api/shop/featured")]
    [InlineData("/api/news")]
    [InlineData("/api/news/featured")]
    [InlineData("/api/gallery")]
    public async Task Public_get_endpoints_return_200(string path)
    {
        var res = await factory.Client().GetAsync(path);
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var content = await res.Content.ReadAsStringAsync();
        Assert.False(string.IsNullOrWhiteSpace(content));
    }

    [Fact]
    public async Task Club_profile_is_seeded_and_well_formed()
    {
        var json = await Body(await factory.Client().GetAsync("/api/content/club"));
        Assert.Equal("Aurelia FC", json.GetProperty("clubName").GetString());
        Assert.True(json.GetProperty("capacity").GetInt32() > 0);
        Assert.True(json.GetProperty("foundedYear").GetInt32() > 1800);
    }

    [Fact]
    public async Task Unknown_player_and_squad_return_404()
    {
        var c = factory.Client();
        Assert.Equal(HttpStatusCode.NotFound, (await c.GetAsync("/api/players/999999")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await c.GetAsync("/api/squads/999999")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await c.GetAsync("/api/shop/products/999999")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await c.GetAsync("/api/matches/999999")).StatusCode);
    }

    [Fact]
    public async Task Player_filter_by_position_narrows_results()
    {
        var c = factory.Client();
        var all = await Body(await c.GetAsync("/api/players"));
        var allCount = all.GetArrayLength();
        Assert.True(allCount > 0);

        var gk = await Body(await c.GetAsync("/api/players?position=Goalkeeper"));
        Assert.True(gk.GetArrayLength() < allCount);
        foreach (var p in gk.EnumerateArray())
            Assert.Equal("Goalkeeper", p.GetProperty("position").GetString());
    }

    [Fact]
    public async Task Match_status_filter_splits_upcoming_and_results()
    {
        var c = factory.Client();
        var upcoming = await Body(await c.GetAsync("/api/matches?status=upcoming"));
        foreach (var m in upcoming.EnumerateArray())
            Assert.Equal("Scheduled", m.GetProperty("status").GetString());

        var results = await Body(await c.GetAsync("/api/matches?status=results"));
        foreach (var m in results.EnumerateArray())
            Assert.Equal("Completed", m.GetProperty("status").GetString());
    }

    // ---------------------------------------------------------------------
    // Contact form
    // ---------------------------------------------------------------------

    [Fact]
    public async Task Contact_message_is_persisted_with_msg_reference()
    {
        var c = factory.Client();
        var payload = new
        {
            fullName = "Integration Tester",
            email = $"it-{Guid.NewGuid():N}@example.com",
            subject = "Automated test",
            message = "This message was created by the automated integration test suite.",
        };
        var res = await c.PostAsJsonAsync("/api/contact", payload);
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);

        var json = await Body(res);
        Assert.True(json.GetProperty("id").GetInt32() > 0);
        Assert.StartsWith("MSG-", json.GetProperty("reference").GetString());
    }

    [Fact]
    public async Task Contact_message_validates_short_message()
    {
        var c = factory.Client();
        var res = await c.PostAsJsonAsync("/api/contact", new
        {
            fullName = "A B",
            email = "abc@example.com",
            subject = "Hi",
            message = "too short",
        });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        var json = await Body(res);
        Assert.True(json.TryGetProperty("errors", out var errors));
        Assert.True(errors.TryGetProperty("message", out _));
    }

    // ---------------------------------------------------------------------
    // Authentication
    // ---------------------------------------------------------------------

    private static async Task<(string token, int userId)> Register(HttpClient c, string? email = null)
    {
        email ??= $"it-{Guid.NewGuid():N}@example.com";
        var res = await c.PostAsJsonAsync("/api/auth/register", new
        {
            firstName = "Ada",
            lastName = "Lovelace",
            email,
            password = "RoyalPassword123",
            confirmPassword = "RoyalPassword123",
        });
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var json = await Body(res);
        return (json.GetProperty("token").GetString()!, json.GetProperty("userId").GetInt32());
    }

    [Fact]
    public async Task Register_login_and_me_round_trip()
    {
        var c = factory.Client();
        var email = $"it-{Guid.NewGuid():N}@example.com";
        var (token, userId) = await Register(c, email);
        Assert.False(string.IsNullOrWhiteSpace(token));

        // /me with the issued token.
        var me = Authed(token);
        var meRes = await me.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, meRes.StatusCode);
        var meJson = await Body(meRes);
        Assert.Equal(userId, meJson.GetProperty("id").GetInt32());
        Assert.Equal(email, meJson.GetProperty("email").GetString());

        // Login with the same credentials.
        var login = await c.PostAsJsonAsync("/api/auth/login", new { email, password = "RoyalPassword123" });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var loginJson = await Body(login);
        Assert.Equal(userId, loginJson.GetProperty("userId").GetInt32());
    }

    [Fact]
    public async Task Register_rejects_weak_password()
    {
        var c = factory.Client();
        var res = await c.PostAsJsonAsync("/api/auth/register", new
        {
            firstName = "Weak",
            lastName = "Password",
            email = $"it-{Guid.NewGuid():N}@example.com",
            password = "alllowercase",
            confirmPassword = "alllowercase",
        });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        var json = await Body(res);
        Assert.True(json.GetProperty("errors").TryGetProperty("password", out _));
    }

    [Fact]
    public async Task Register_rejects_mismatched_confirmation()
    {
        var c = factory.Client();
        var res = await c.PostAsJsonAsync("/api/auth/register", new
        {
            firstName = "Mismatch",
            lastName = "Check",
            email = $"it-{Guid.NewGuid():N}@example.com",
            password = "RoyalPassword123",
            confirmPassword = "DifferentPassword123",
        });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        var json = await Body(res);
        Assert.True(json.GetProperty("errors").TryGetProperty("confirmPassword", out _));
    }

    [Fact]
    public async Task Register_rejects_invalid_email()
    {
        var c = factory.Client();
        var res = await c.PostAsJsonAsync("/api/auth/register", new
        {
            firstName = "Bad",
            lastName = "Email",
            email = "not-an-email",
            password = "RoyalPassword123",
            confirmPassword = "RoyalPassword123",
        });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        Assert.True((await Body(res)).GetProperty("errors").TryGetProperty("email", out _));
    }

    [Fact]
    public async Task Register_duplicate_email_conflicts()
    {
        var c = factory.Client();
        var email = $"it-dup-{Guid.NewGuid():N}@example.com";
        await Register(c, email);
        var second = await c.PostAsJsonAsync("/api/auth/register", new
        {
            firstName = "Ada",
            lastName = "Lovelace",
            email,
            password = "RoyalPassword123",
            confirmPassword = "RoyalPassword123",
        });
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    [Fact]
    public async Task Login_with_wrong_password_is_unauthorized()
    {
        var c = factory.Client();
        var email = $"it-{Guid.NewGuid():N}@example.com";
        await Register(c, email);
        var res = await c.PostAsJsonAsync("/api/auth/login", new { email, password = "WrongPassword123" });
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task Me_without_token_is_unauthorized()
    {
        var res = await factory.Client().GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task Me_with_tampered_token_is_unauthorized()
    {
        var c = factory.Client();
        c.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "not.a.real.token");
        Assert.Equal(HttpStatusCode.Unauthorized, (await c.GetAsync("/api/auth/me")).StatusCode);
    }

    // ---------------------------------------------------------------------
    // Orders
    // ---------------------------------------------------------------------

    [Fact]
    public async Task Order_prices_are_re_derived_server_side()
    {
        var c = factory.Client();
        var (token, _) = await Register(c);
        var auth = Authed(token);

        var products = await Body(await c.GetAsync("/api/shop/products"));
        var product = products.EnumerateArray().First();
        var realPrice = product.GetProperty("price").GetDecimal();
        var productId = product.GetProperty("id").GetInt32();

        // Deliberately lie about the price: charge ourselves 0.01.
        var res = await auth.PostAsJsonAsync("/api/orders", new
        {
            orderType = "Shop",
            items = new[]
            {
                new { itemType = "Product", itemRefId = productId, description = "Tampered", quantity = 3, unitPrice = 0.01m },
            },
        });
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);

        var order = await Body(res);
        Assert.Equal(Math.Round(realPrice * 3, 2), Math.Round(order.GetProperty("totalAmount").GetDecimal(), 2));
        Assert.Equal(12, order.GetProperty("reference").GetString()!.Length);
        Assert.Equal("Pending", order.GetProperty("status").GetString());

        var line = order.GetProperty("items").EnumerateArray().First();
        Assert.Equal(Math.Round(realPrice, 2), Math.Round(line.GetProperty("unitPrice").GetDecimal(), 2));
    }

    [Fact]
    public async Task Order_can_be_read_back_by_its_owner()
    {
        var c = factory.Client();
        var (token, _) = await Register(c);
        var auth = Authed(token);

        var products = await Body(await c.GetAsync("/api/shop/products"));
        var productId = products.EnumerateArray().First().GetProperty("id").GetInt32();

        var created = await Body(await auth.PostAsJsonAsync("/api/orders", new
        {
            orderType = "Shop",
            items = new[] { new { itemType = "Product", itemRefId = productId, description = "x", quantity = 1, unitPrice = 1m } },
        }));
        var id = created.GetProperty("id").GetInt32();

        var read = await auth.GetAsync($"/api/orders/{id}");
        Assert.Equal(HttpStatusCode.OK, read.StatusCode);

        var mine = await Body(await auth.GetAsync("/api/orders/mine"));
        Assert.Contains(mine.EnumerateArray(), o => o.GetProperty("id").GetInt32() == id);
    }

    [Fact]
    public async Task Order_of_another_user_is_forbidden()
    {
        var c = factory.Client();
        var (ownerToken, _) = await Register(c);
        var owner = Authed(ownerToken);

        var products = await Body(await c.GetAsync("/api/shop/products"));
        var productId = products.EnumerateArray().First().GetProperty("id").GetInt32();
        var created = await Body(await owner.PostAsJsonAsync("/api/orders", new
        {
            orderType = "Shop",
            items = new[] { new { itemType = "Product", itemRefId = productId, description = "x", quantity = 1, unitPrice = 1m } },
        }));
        var orderId = created.GetProperty("id").GetInt32();

        var (otherToken, _) = await Register(c);
        var other = Authed(otherToken);

        Assert.Equal(HttpStatusCode.Forbidden, (await other.GetAsync($"/api/orders/{orderId}")).StatusCode);
    }

    [Fact]
    public async Task Order_with_unknown_product_is_rejected()
    {
        var c = factory.Client();
        var res = await c.PostAsJsonAsync("/api/orders", new
        {
            orderType = "Shop",
            items = new[] { new { itemType = "Product", itemRefId = 999999, description = "ghost", quantity = 1, unitPrice = 5m } },
        });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Order_with_empty_items_is_rejected()
    {
        var c = factory.Client();
        var res = await c.PostAsJsonAsync("/api/orders", new { orderType = "Shop", items = Array.Empty<object>() });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        Assert.True((await Body(res)).GetProperty("errors").TryGetProperty("items", out _));
    }

    [Fact]
    public async Task Order_with_unknown_type_is_rejected()
    {
        var c = factory.Client();
        var res = await c.PostAsJsonAsync("/api/orders", new
        {
            orderType = "Bitcoin",
            items = new[] { new { itemType = "Product", itemRefId = 1, description = "x", quantity = 1, unitPrice = 1m } },
        });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        Assert.True((await Body(res)).GetProperty("errors").TryGetProperty("orderType", out _));
    }

    [Fact]
    public async Task Order_with_quantity_out_of_range_is_rejected()
    {
        var c = factory.Client();
        var res = await c.PostAsJsonAsync("/api/orders", new
        {
            orderType = "Shop",
            items = new[] { new { itemType = "Product", itemRefId = 1, description = "x", quantity = 500, unitPrice = 1m } },
        });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Anonymous_order_is_allowed_but_has_no_owner()
    {
        var c = factory.Client();
        var products = await Body(await c.GetAsync("/api/shop/products"));
        var productId = products.EnumerateArray().First().GetProperty("id").GetInt32();

        var res = await c.PostAsJsonAsync("/api/orders", new
        {
            orderType = "Shop",
            items = new[] { new { itemType = "Product", itemRefId = productId, description = "guest", quantity = 1, unitPrice = 1m } },
        });
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
    }

    // ---------------------------------------------------------------------
    // Error handling
    // ---------------------------------------------------------------------

    [Fact]
    public async Task Unknown_route_returns_problem_details()
    {
        var res = await factory.Client().GetAsync("/api/does-not-exist");
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
    }

    [Fact]
    public async Task Swagger_document_is_served()
    {
        var res = await factory.Client().GetAsync("/swagger/v1/swagger.json");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var json = await Body(res);
        Assert.Equal("Aurelia FC API", json.GetProperty("info").GetProperty("title").GetString());
        Assert.True(json.GetProperty("paths").EnumerateObject().Count() >= 30);
    }
}
