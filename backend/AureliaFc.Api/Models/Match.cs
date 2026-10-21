using System.ComponentModel.DataAnnotations;

namespace AureliaFc.Api.Models;

/// <summary>League or cup that matches belong to.</summary>
public class Competition
{
    public int Id { get; set; }

    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(10)]
    public string Type { get; set; } = "League";

    [MaxLength(20)]
    public string Season { get; set; } = string.Empty;

    public ICollection<LeagueStanding> Standings { get; set; } = new List<LeagueStanding>();
    public ICollection<Match> Matches { get; set; } = new List<Match>();
}

/// <summary>One row of the league table.</summary>
public class LeagueStanding
{
    public int Id { get; set; }
    public int CompetitionId { get; set; }
    public int Position { get; set; }

    [MaxLength(120)]
    public string ClubName { get; set; } = string.Empty;

    public int Played { get; set; }
    public int Won { get; set; }
    public int Drawn { get; set; }
    public int Lost { get; set; }
    public int GoalsFor { get; set; }
    public int GoalsAgainst { get; set; }

    public Competition? Competition { get; set; }

    public int GoalDifference => GoalsFor - GoalsAgainst;
    public int Points => (Won * 3) + Drawn;
}

/// <summary>A fixture or completed match.</summary>
public class Match
{
    public int Id { get; set; }
    public int CompetitionId { get; set; }

    [MaxLength(120)]
    public string HomeTeam { get; set; } = string.Empty;

    [MaxLength(120)]
    public string AwayTeam { get; set; } = string.Empty;

    public DateTime KickoffAt { get; set; }

    [MaxLength(120)]
    public string Venue { get; set; } = string.Empty;

    public bool IsHome { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Scheduled";

    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public int? Attendance { get; set; }

    [MaxLength(255)]
    public string? MatchReport { get; set; }

    public Competition? Competition { get; set; }
    public TicketFixture? TicketFixture { get; set; }
    public ICollection<MatchEvent> Events { get; set; } = new List<MatchEvent>();
    public ICollection<MatchStat> Stats { get; set; } = new List<MatchStat>();
    public ICollection<MatchLineup> Lineups { get; set; } = new List<MatchLineup>();
}

/// <summary>Goal / booking entry on the match timeline.</summary>
public class MatchEvent
{
    public int Id { get; set; }
    public int MatchId { get; set; }
    public int Minute { get; set; }

    [MaxLength(10)]
    public string TeamSide { get; set; } = "Home";

    [MaxLength(120)]
    public string PlayerName { get; set; } = string.Empty;

    [MaxLength(60)]
    public string EventType { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public Match? Match { get; set; }
}

/// <summary>Head-to-head statistic row for a match.</summary>
public class MatchStat
{
    public int Id { get; set; }
    public int MatchId { get; set; }

    [MaxLength(60)]
    public string StatLabel { get; set; } = string.Empty;

    [MaxLength(10)]
    public string HomeValue { get; set; } = string.Empty;

    [MaxLength(10)]
    public string AwayValue { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public Match? Match { get; set; }
}

/// <summary>Starting XI entry for one side of a match.</summary>
public class MatchLineup
{
    public int Id { get; set; }
    public int MatchId { get; set; }

    [MaxLength(10)]
    public string Side { get; set; } = "Home";

    [MaxLength(12)]
    public string Formation { get; set; } = string.Empty;

    [MaxLength(4)]
    public string SquadNo { get; set; } = string.Empty;

    [MaxLength(120)]
    public string PlayerName { get; set; } = string.Empty;

    [MaxLength(4)]
    public string RoleCode { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public Match? Match { get; set; }
}
