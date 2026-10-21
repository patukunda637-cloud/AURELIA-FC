using System.ComponentModel.DataAnnotations;

namespace AureliaFc.Api.Models;

/// <summary>Purchase record for shop items, tickets or packages.</summary>
public class Order
{
    public int Id { get; set; }
    public int? UserId { get; set; }

    [MaxLength(12)]
    public string Reference { get; set; } = string.Empty;

    [MaxLength(20)]
    public string OrderType { get; set; } = "Shop";

    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }

    public User? User { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }

    [MaxLength(20)]
    public string ItemType { get; set; } = "Product";

    public int? ItemRefId { get; set; }

    [MaxLength(180)]
    public string Description { get; set; } = string.Empty;

    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }

    public Order? Order { get; set; }
}

/// <summary>Single-row table holding club identity and stadium facts.</summary>
public class ClubInfo
{
    public int Id { get; set; }

    [MaxLength(120)]
    public string ClubName { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Motto { get; set; } = string.Empty;

    public int FoundedYear { get; set; }

    [MaxLength(600)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(120)]
    public string StadiumName { get; set; } = string.Empty;

    public int Capacity { get; set; }
    public int BuiltYear { get; set; }
    public int RecordAttendance { get; set; }

    [MaxLength(180)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(60)]
    public string Phone { get; set; } = string.Empty;
}

public class ClubMilestone
{
    public int Id { get; set; }

    [MaxLength(20)]
    public string YearLabel { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(300)]
    public string Body { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}

public class ClubValue
{
    public int Id { get; set; }

    [MaxLength(80)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(300)]
    public string Body { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}

public class ClubHonour
{
    public int Id { get; set; }

    [MaxLength(120)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Years { get; set; } = string.Empty;

    [MaxLength(40)]
    public string CountLabel { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}

public class ClubExecutive
{
    public int Id { get; set; }

    [MaxLength(120)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(120)]
    public string RoleTitle { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? ImagePath { get; set; }

    public int SortOrder { get; set; }
}

public class Partner
{
    public int Id { get; set; }

    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}

public class QuickLink
{
    public int Id { get; set; }

    [MaxLength(120)]
    public string Label { get; set; } = string.Empty;

    [MaxLength(180)]
    public string Href { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}

public class PasswordResetToken
{
    public int Id { get; set; }
    public int UserId { get; set; }

    [MaxLength(64)]
    public string TokenHash { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }
    public DateTime CreatedAt { get; set; }

    public User? User { get; set; }
}
