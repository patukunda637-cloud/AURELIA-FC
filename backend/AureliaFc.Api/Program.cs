using System.Text;
using System.Text.Json.Serialization;
using AureliaFc.Api.Configuration;
using AureliaFc.Api.Data;
using AureliaFc.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

// ---------------------------------------------------------------------------
// Small CLI helper used by database/03_create_admin.sql:
//     dotnet run --project backend/AureliaFc.Api -- hash "YourPassword"
// Prints a BCrypt hash to paste into the admin INSERT statement.
// ---------------------------------------------------------------------------
if (args.Length == 2 && args[0].Equals("hash", StringComparison.OrdinalIgnoreCase))
{
    Console.WriteLine(BCrypt.Net.BCrypt.HashPassword(args[1], workFactor: 11));
    return;
}

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
var connectionString = builder.Configuration.GetConnectionString("Aurelia")
    ?? throw new InvalidOperationException(
        "Connection string 'Aurelia' is not configured. Set ConnectionStrings__Aurelia or update appsettings.");

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));
var jwt = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>() ?? new JwtSettings();

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------
builder.Services.AddDbContext<AureliaDbContext>(options =>
{
    // Pomelo 9 targets EF Core 9 internals, so AutoDetect (which queries the
    // server for its version and touches changed internal APIs) is avoided in
    // favour of an explicit server version. Update if the MySQL server changes.
    var serverVersion = new MySqlServerVersion(new Version(8, 0, 28));
    options.UseMySql(connectionString, serverVersion);
});

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
builder.Services.AddScoped<ITokenService, TokenService>();

// ---------------------------------------------------------------------------
// Authentication / authorisation
// ---------------------------------------------------------------------------
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(string.IsNullOrEmpty(jwt.Key) ? new string('x', 32) : jwt.Key)),
        };
    });
builder.Services.AddAuthorization();

// ---------------------------------------------------------------------------
// CORS for the Vite dev server + configurable production origins
// ---------------------------------------------------------------------------
const string CorsPolicy = "aurelia-web";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? new[] { "http://localhost:5173", "http://127.0.0.1:5173" };
        policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
    });
});

// ---------------------------------------------------------------------------
// MVC / JSON / Swagger
// ---------------------------------------------------------------------------
builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Aurelia FC API", Version = "v1" });
    var scheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste the JWT returned by /api/auth/login.",
        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" },
    };
    c.AddSecurityDefinition("Bearer", scheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement { [scheme] = Array.Empty<string>() });
});

var app = builder.Build();

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------
app.UseExceptionHandler(handler => handler.Run(async context =>
{
    var feature = context.Features.Get<IExceptionHandlerFeature>();
    var isDev = app.Environment.IsDevelopment();
    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
    context.Response.ContentType = "application/problem+json";
    await context.Response.WriteAsJsonAsync(new
    {
        type = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
        title = "An unexpected error occurred.",
        status = 500,
        detail = isDev ? feature?.Error.Message : null,
        traceId = context.TraceIdentifier,
    });
}));

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Aurelia FC API v1"));

app.UseCors(CorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => Results.Redirect("/swagger"));
app.MapGet("/health", async (AureliaDbContext db) =>
{
    var ok = await db.Database.CanConnectAsync();
    return Results.Ok(new { status = ok ? "healthy" : "degraded", database = ok });
});

app.Run();

/// <summary>Exposed so integration tests can host the API with WebApplicationFactory.</summary>
public partial class Program;
