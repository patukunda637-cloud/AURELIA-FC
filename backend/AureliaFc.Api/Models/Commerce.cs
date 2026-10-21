using System.ComponentModel.DataAnnotations;

namespace AureliaFc.Api.Models;

/// <summary>Shop department (Kits, Training, Accessories, Lifestyle).</summary>
public class ProductCategory
{
    public int Id { get; set; }

    [MaxLength(60)]
    public string Name { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public ICollection<Product> Products { get; set; } = new List<Product>();
}

/// <summary>An item sold in the Official Store.</summary>
public class Product
{
    public int Id { get; set; }
    public int CategoryId { get; set; }

    [MaxLength(160)]
    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }

    [MaxLength(255)]
    public string? ImagePath { get; set; }

    [MaxLength(40)]
    public string? Badge { get; set; }

    public bool IsFeatured { get; set; }

    [MaxLength(255)]
    public string? Description { get; set; }

    public int SortOrder { get; set; }

    public ProductCategory? Category { get; set; }
}

/// <summary>Ticket availability for a home fixture.</summary>
public class TicketFixture
{
    public int Id { get; set; }
    public int MatchId { get; set; }
    public decimal PriceMin { get; set; }
    public decimal PriceMax { get; set; }
    public int AvailableSeats { get; set; }

    [MaxLength(60)]
    public string StatusLabel { get; set; } = string.Empty;

    public Match? Match { get; set; }
}

/// <summary>Season ticket product tier.</summary>
public class SeasonTicketTier
{
    public int Id { get; set; }

    [MaxLength(60)]
    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }

    [MaxLength(255)]
    public string Description { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public ICollection<SeasonTicketFeature> Features { get; set; } = new List<SeasonTicketFeature>();
}

public class SeasonTicketFeature
{
    public int Id { get; set; }
    public int TierId { get; set; }

    [MaxLength(160)]
    public string Feature { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public SeasonTicketTier? Tier { get; set; }
}

/// <summary>Matchday hospitality offering.</summary>
public class HospitalityPackage
{
    public int Id { get; set; }

    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }

    [MaxLength(20)]
    public string PriceUnit { get; set; } = "/ match";

    [MaxLength(400)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? ImagePath { get; set; }

    public int SortOrder { get; set; }
}

/// <summary>Club department contact details.</summary>
public class ContactDepartment
{
    public int Id { get; set; }

    [MaxLength(80)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(190)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(60)]
    public string? Phone { get; set; }

    [MaxLength(255)]
    public string? Note { get; set; }

    public int SortOrder { get; set; }
}

/// <summary>Message submitted through the Contact form.</summary>
public class ContactMessage
{
    public int Id { get; set; }

    [MaxLength(160)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(190)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Subject { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public int? UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsHandled { get; set; }

    public User? User { get; set; }
}

/// <summary>Frequently asked question on the Contact screen.</summary>
public class Faq
{
    public int Id { get; set; }

    [MaxLength(255)]
    public string Question { get; set; } = string.Empty;

    [MaxLength(600)]
    public string Answer { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}
