using AureliaFc.Api.Contracts;
using AureliaFc.Api.Data;
using AureliaFc.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AureliaFc.Api.Controllers;

[ApiController]
[Route("api/tickets")]
public class TicketsController(AureliaDbContext db) : ControllerBase
{
    /// <summary>Match ticket availability rows on the Tickets page.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketFixtureDto>>> GetFixtures()
    {
        var rows = await db.TicketFixtures.AsNoTracking()
            .Include(t => t.Match)!.ThenInclude(m => m!.Competition)
            .OrderBy(t => t.Match!.KickoffAt).ToListAsync();
        return Ok(rows.Select(Mappers.ToDto));
    }

    [HttpGet("season-tiers")]
    public async Task<ActionResult<IEnumerable<SeasonTierDto>>> GetSeasonTiers()
    {
        var tiers = await db.SeasonTicketTiers.AsNoTracking()
            .Include(t => t.Features)
            .OrderBy(t => t.SortOrder).ToListAsync();
        return Ok(tiers.Select(Mappers.ToDto));
    }

    [HttpGet("hospitality")]
    public async Task<ActionResult<IEnumerable<HospitalityDto>>> GetHospitality() =>
        Ok(await db.HospitalityPackages.AsNoTracking().OrderBy(h => h.SortOrder)
            .Select(h => new HospitalityDto(h.Name, h.Price, h.PriceUnit, h.Description, h.ImagePath))
            .ToListAsync());
}
