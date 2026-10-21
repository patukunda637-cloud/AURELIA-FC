using AureliaFc.Api.Contracts;
using AureliaFc.Api.Data;
using AureliaFc.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AureliaFc.Api.Controllers;

[ApiController]
[Route("api/squads")]
public class SquadsController(AureliaDbContext db) : ControllerBase
{
    /// <summary>All squads shown on the Teams page.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TeamDto>>> GetTeams() =>
        Ok(await db.Teams.AsNoTracking().OrderBy(t => t.SortOrder)
            .Select(t => new TeamDto(t.Id, t.Name, t.Coach, t.PlayerCount, t.Description, t.ImagePath))
            .ToListAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TeamDto>> GetTeam(int id)
    {
        var t = await db.Teams.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        return t is null ? NotFound() : Ok(Mappers.ToDto(t));
    }

    /// <summary>Players belonging to one squad.</summary>
    [HttpGet("{id:int}/players")]
    public async Task<ActionResult<IEnumerable<PlayerCardDto>>> GetTeamPlayers(int id)
    {
        var players = await db.Players.AsNoTracking()
            .Include(p => p.Position).Include(p => p.Team)
            .Where(p => p.TeamId == id)
            .OrderBy(p => p.SquadNumber)
            .ToListAsync();
        return Ok(players.Select(Mappers.ToCard));
    }
}

[ApiController]
[Route("api/players")]
public class PlayersController(AureliaDbContext db) : ControllerBase
{
    /// <summary>
    /// Squad listing with optional position filter and free-text search.
    /// position = Goalkeepers | Defenders | Midfielders | Forwards
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PlayerCardDto>>> GetPlayers(
        [FromQuery] int? teamId, [FromQuery] string? position, [FromQuery] string? search)
    {
        var query = db.Players.AsNoTracking().Include(p => p.Position).Include(p => p.Team).AsQueryable();

        if (teamId.HasValue)
            query = query.Where(p => p.TeamId == teamId.Value);

        if (!string.IsNullOrWhiteSpace(position) && !position.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            var group = position.Trim();
            query = query.Where(p => p.PositionId == (group == "Goalkeepers" ? 1
                : group == "Defenders" ? 2
                : group == "Midfielders" ? 3
                : group == "Forwards" ? 4 : 0));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(p =>
                (p.FirstName + " " + p.LastName).Contains(term) ||
                p.Position!.Name.Contains(term) ||
                p.Nationality.Contains(term));
        }

        var players = await query.OrderBy(p => p.TeamId).ThenBy(p => p.SquadNumber).ToListAsync();
        return Ok(players.Select(Mappers.ToCard));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PlayerDetailDto>> GetPlayer(int id)
    {
        var p = await db.Players.AsNoTracking()
            .Include(x => x.Position).Include(x => x.Team)
            .Include(x => x.SeasonStats).Include(x => x.CareerHistory)
            .FirstOrDefaultAsync(x => x.Id == id);
        if (p is null) return NotFound();
        var season = p.SeasonStats.FirstOrDefault()?.Season ?? "2026/2027";
        return Ok(Mappers.ToDetail(p, season));
    }
}
