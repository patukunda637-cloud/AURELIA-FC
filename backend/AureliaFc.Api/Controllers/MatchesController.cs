using AureliaFc.Api.Contracts;
using AureliaFc.Api.Data;
using AureliaFc.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AureliaFc.Api.Controllers;

[ApiController]
[Route("api/matches")]
public class MatchesController(AureliaDbContext db) : ControllerBase
{
    /// <summary>
    /// Fixtures &amp; results. status = upcoming | results | all (default all).
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<FixtureDto>>> GetMatches([FromQuery] string? status)
    {
        var query = db.Matches.AsNoTracking()
            .Include(m => m.Competition).Include(m => m.TicketFixture).AsQueryable();

        switch (status?.ToLowerInvariant())
        {
            case "upcoming":
                query = query.Where(m => m.Status == "Scheduled");
                break;
            case "results":
                query = query.Where(m => m.Status == "Completed");
                break;
        }

        var matches = await query.OrderByDescending(m => m.KickoffAt).ToListAsync();
        return Ok(matches.Select(Mappers.ToFixture));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MatchDetailDto>> GetMatch(int id)
    {
        var m = await db.Matches.AsNoTracking()
            .Include(x => x.Competition)
            .Include(x => x.Events)
            .Include(x => x.Stats)
            .Include(x => x.Lineups)
            .FirstOrDefaultAsync(x => x.Id == id);
        return m is null ? NotFound() : Ok(Mappers.ToDetail(m));
    }

    /// <summary>The 12-team league table for the current season.</summary>
    [HttpGet("standings")]
    public async Task<ActionResult<LeagueTableDto>> GetStandings([FromQuery] string? season)
    {
        var competition = await db.Competitions.AsNoTracking()
            .Where(c => season == null || c.Season == season)
            .OrderBy(c => c.Id).FirstOrDefaultAsync();
        if (competition is null) return NotFound();

        var rows = await db.LeagueStandings.AsNoTracking()
            .Where(s => s.CompetitionId == competition.Id)
            .OrderBy(s => s.Position).ToListAsync();

        return Ok(new LeagueTableDto(competition.Name, competition.Season, rows.Select(Mappers.ToDto).ToList()));
    }
}
