using System.ComponentModel.DataAnnotations;

namespace AureliaFc.Api.Models;

/// <summary>A squad within the club structure (first team, academy, women's team...).</summary>
public class Team
{
    public int Id { get; set; }

    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Coach { get; set; } = string.Empty;

    public int PlayerCount { get; set; }

    [MaxLength(255)]
    public string? Description { get; set; }

    [MaxLength(255)]
    public string? ImagePath { get; set; }

    public int SortOrder { get; set; }

    public ICollection<Player> Players { get; set; } = new List<Player>();
}

/// <summary>Playing position lookup (Goalkeeper, Defender, Midfielder, Forward).</summary>
public class Position
{
    public int Id { get; set; }

    [MaxLength(40)]
    public string Name { get; set; } = string.Empty;

    public ICollection<Player> Players { get; set; } = new List<Player>();
}

/// <summary>A footballer registered to a squad.</summary>
public class Player
{
    public int Id { get; set; }
    public int TeamId { get; set; }
    public int PositionId { get; set; }

    public int SquadNumber { get; set; }

    [MaxLength(80)]
    public string FirstName { get; set; } = string.Empty;

    [MaxLength(80)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(3)]
    public string Nationality { get; set; } = string.Empty;

    public DateOnly? DateOfBirth { get; set; }
    public int? HeightCm { get; set; }
    public string? Bio { get; set; }

    [MaxLength(255)]
    public string? ImagePath { get; set; }

    public int Goals { get; set; }
    public int Assists { get; set; }
    public int Appearances { get; set; }
    public decimal AvgRating { get; set; }

    public Team? Team { get; set; }
    public Position? Position { get; set; }
    public ICollection<PlayerSeasonStat> SeasonStats { get; set; } = new List<PlayerSeasonStat>();
    public ICollection<PlayerCareerHistory> CareerHistory { get; set; } = new List<PlayerCareerHistory>();

    public string FullName => $"{FirstName} {LastName}";
}

/// <summary>Per-month statistics shown in the Season Statistics table.</summary>
public class PlayerSeasonStat
{
    public int Id { get; set; }
    public int PlayerId { get; set; }

    [MaxLength(20)]
    public string Season { get; set; } = string.Empty;

    [MaxLength(40)]
    public string MonthLabel { get; set; } = string.Empty;

    public int SortOrder { get; set; }
    public int Apps { get; set; }
    public int Goals { get; set; }
    public int Assists { get; set; }

    public Player? Player { get; set; }
}

/// <summary>A previous club spell shown in the Career History panel.</summary>
public class PlayerCareerHistory
{
    public int Id { get; set; }
    public int PlayerId { get; set; }

    [MaxLength(120)]
    public string ClubName { get; set; } = string.Empty;

    [MaxLength(40)]
    public string Period { get; set; } = string.Empty;

    public int? Appearances { get; set; }
    public int? Goals { get; set; }

    [MaxLength(120)]
    public string? Note { get; set; }

    public int SortOrder { get; set; }

    public Player? Player { get; set; }
}
