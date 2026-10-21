namespace AureliaFc.Api.Configuration;

/// <summary>
/// Strongly-typed configuration bound from the "Jwt" section. Values must be
/// supplied through appsettings, user-secrets or environment variables
/// (e.g. <c>Jwt__Key</c>) — never hard-coded in source.
/// </summary>
public class JwtSettings
{
    public const string SectionName = "Jwt";

    /// <summary>HMAC signing key (min 32 chars). Supplied via configuration.</summary>
    public string Key { get; set; } = string.Empty;

    public string Issuer { get; set; } = "AureliaFc.Api";
    public string Audience { get; set; } = "AureliaFc.Web";

    /// <summary>Token lifetime in minutes.</summary>
    public int ExpiryMinutes { get; set; } = 480;
}
