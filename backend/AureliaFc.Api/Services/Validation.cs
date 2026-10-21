using System.Net.Mail;
using System.Text.RegularExpressions;

namespace AureliaFc.Api.Services;

/// <summary>Shared input validation used by the write endpoints.</summary>
public static partial class Validation
{
    [GeneratedRegex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$")]
    private static partial Regex StrongPasswordRegex();

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")]
    private static partial Regex EmailRegex();

    public static bool IsEmail(string? value) =>
        !string.IsNullOrWhiteSpace(value) && EmailRegex().IsMatch(value.Trim());

    public static bool IsStrongPassword(string? value) =>
        !string.IsNullOrEmpty(value) && StrongPasswordRegex().IsMatch(value);

    public static bool HasText(string? value, int min = 1, int max = int.MaxValue)
    {
        if (string.IsNullOrWhiteSpace(value)) return false;
        var len = value.Trim().Length;
        return len >= min && len <= max;
    }

    /// <summary>Normalises an email to lower-case trimmed form.</summary>
    public static string Normalize(string email) => email.Trim().ToLowerInvariant();
}
