using AureliaFc.Api.Contracts;
using AureliaFc.Api.Models;

namespace AureliaFc.Api.Services;

/// <summary>
/// Converts EF entities into the flat DTOs the React app consumes, applying the
/// same date/number formatting used by the Figma reference (e.g. "Sep 12, 2026").
/// </summary>
public static class Mappers
{
    private static readonly string[] Months =
        { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };

    private static readonly string[] FullMonths =
        { "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" };

    private static readonly string[] Days =
        { "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" };

    public static string ShortDate(DateTime d) => $"{Months[d.Month - 1]} {d.Day}, {d.Year}";
    public static string TimeLabel(DateTime d) => $"{d.Hour:00}:{d.Minute:00}";

    public static ClubInfoDto ToDto(ClubInfo c) => new(
        c.ClubName, c.Motto, c.FoundedYear, c.Description, c.StadiumName,
        c.Capacity, c.BuiltYear, c.RecordAttendance, c.Address, c.Phone);

    public static TeamDto ToDto(Team t) =>
        new(t.Id, t.Name, t.Coach, t.PlayerCount, t.Description, t.ImagePath);

    public static string PositionGroup(int positionId) => positionId switch
    {
        1 => "Goalkeepers",
        2 => "Defenders",
        3 => "Midfielders",
        4 => "Forwards",
        _ => "Other",
    };

    public static PlayerCardDto ToCard(Player p) => new(
        p.Id, p.SquadNumber, p.FullName, p.FirstName, p.LastName,
        p.Position?.Name ?? string.Empty, PositionGroup(p.PositionId), p.Nationality,
        p.ImagePath, p.Goals, p.Assists, p.Appearances, p.AvgRating,
        p.TeamId, p.Team?.Name ?? string.Empty);

    public static PlayerDetailDto ToDetail(Player p, string season) => new(
        p.Id, p.SquadNumber, p.FullName, p.FirstName, p.LastName,
        p.Position?.Name ?? string.Empty, PositionGroup(p.PositionId), p.Nationality,
        p.DateOfBirth?.ToString("yyyy-MM-dd"), p.HeightCm, p.Bio, p.ImagePath,
        p.Goals, p.Assists, p.Appearances, p.AvgRating,
        p.TeamId, p.Team?.Name ?? string.Empty, season,
        p.SeasonStats.OrderBy(s => s.SortOrder)
            .Select(s => new SeasonStatDto(s.MonthLabel, s.Apps, s.Goals, s.Assists)).ToList(),
        p.CareerHistory.OrderBy(h => h.SortOrder)
            .Select(h => new CareerEntryDto(h.ClubName, h.Period, h.Appearances, h.Goals, h.Note)).ToList());

    public static StandingDto ToDto(LeagueStanding s) => new(
        s.Position, s.ClubName, s.Played, s.Won, s.Drawn, s.Lost,
        s.GoalsFor, s.GoalsAgainst, s.GoalDifference, s.Points);

    public static FixtureDto ToFixture(Match m)
    {
        var completed = m.Status == "Completed";
        var score = completed && m.HomeScore.HasValue && m.AwayScore.HasValue
            ? $"{m.HomeScore} - {m.AwayScore}"
            : "VS";
        var ticket = m.TicketFixture;
        return new FixtureDto(
            m.Id, m.Competition?.Name ?? string.Empty, m.Competition?.Type ?? "League",
            ShortDate(m.KickoffAt), ShortDate(m.KickoffAt), TimeLabel(m.KickoffAt),
            m.KickoffAt.ToString("yyyy-MM-ddTHH:mm:ss"), m.HomeTeam, m.AwayTeam, m.Venue,
            m.IsHome, m.Status, m.HomeScore, m.AwayScore, score,
            ticket is not null && ticket.AvailableSeats > 0,
            ticket?.PriceMin, ticket?.PriceMax, ticket?.AvailableSeats, ticket?.StatusLabel);
    }

    public static MatchDetailDto ToDetail(Match m) => new(
        m.Id, m.Competition?.Name ?? string.Empty,
        m.Status == "Completed" ? "COMPLETED MATCH" : "UPCOMING FIXTURE",
        ShortDate(m.KickoffAt), m.HomeTeam, m.AwayTeam, m.Venue, m.Attendance,
        m.HomeScore.HasValue && m.AwayScore.HasValue ? $"{m.HomeScore} – {m.AwayScore}" : "–",
        m.MatchReport ?? string.Empty, m.HomeScore, m.AwayScore,
        m.Events.OrderBy(e => e.SortOrder).Select(e => new MatchEventDto(e.Minute, e.TeamSide, e.PlayerName, e.EventType)).ToList(),
        m.Stats.OrderBy(s => s.SortOrder).Select(s => new MatchStatDto(s.StatLabel, s.HomeValue, s.AwayValue)).ToList(),
        m.Lineups.OrderBy(l => l.Side).ThenBy(l => l.SortOrder)
            .Select(l => new LineupDto(l.Side, l.Formation, l.SquadNo, l.PlayerName, l.RoleCode)).ToList());

    public static TicketFixtureDto ToDto(TicketFixture t)
    {
        var m = t.Match!;
        return new TicketFixtureDto(
            t.Id, t.MatchId, $"{Days[(int)m.KickoffAt.DayOfWeek]} · {ShortDate(m.KickoffAt)}",
            FullMonths[m.KickoffAt.Month - 1], m.KickoffAt.Day.ToString("00"),
            m.Competition?.Name ?? string.Empty, $"{m.HomeTeam} vs {m.AwayTeam}", m.Venue,
            TimeLabel(m.KickoffAt), t.PriceMin, t.PriceMax, t.AvailableSeats, t.StatusLabel);
    }

    public static SeasonTierDto ToDto(SeasonTicketTier t) => new(
        t.Name, t.Price, t.Description,
        t.Features.OrderBy(f => f.SortOrder).Select(f => f.Feature).ToList());

    public static ProductDto ToDto(Product p) => new(
        p.Id, p.CategoryId, p.Category?.Name ?? string.Empty, p.Name, p.Price,
        p.ImagePath, p.Badge, p.IsFeatured, p.Description);

    public static ArticleCardDto ToCard(NewsArticle a) => new(
        a.Id, a.Slug, a.Category, a.Title, a.Excerpt, a.ImagePath,
        ShortDate(a.PublishedAt), a.PublishedAt.ToString("yyyy-MM-dd"), a.IsFeatured);

    public static ArticleDetailDto ToDetail(NewsArticle a) => new(
        a.Id, a.Slug, a.Category, a.Title, a.Excerpt, a.Body, a.AuthorName,
        a.PullQuote, a.PullQuoteBy, a.ImagePath, ShortDate(a.PublishedAt),
        a.PublishedAt.ToString("yyyy-MM-dd"), a.IsFeatured,
        a.Tags.Select(t => t.Tag).ToList());

    public static OrderDto ToDto(Order o) => new(
        o.Id, o.Reference, o.OrderType, o.Status, o.TotalAmount,
        o.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
        o.Items.Select(i => new OrderItemDto(i.Id, i.ItemType, i.ItemRefId, i.Description, i.Quantity, i.UnitPrice)).ToList());
}
