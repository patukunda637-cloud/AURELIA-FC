using AureliaFc.Api.Contracts;
using AureliaFc.Api.Data;
using AureliaFc.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AureliaFc.Api.Controllers;

[ApiController]
[Route("api/content")]
public class ContentController(AureliaDbContext db) : ControllerBase
{
    /// <summary>Club identity, stadium facts and address for the footer / about page.</summary>
    [HttpGet("club")]
    public async Task<ActionResult<ClubInfoDto>> GetClub()
    {
        var club = await db.ClubInfos.AsNoTracking().FirstOrDefaultAsync();
        return club is null ? NotFound() : Ok(Mappers.ToDto(club));
    }

    [HttpGet("milestones")]
    public async Task<ActionResult<IEnumerable<MilestoneDto>>> GetMilestones() =>
        Ok(await db.ClubMilestones.AsNoTracking().OrderBy(m => m.SortOrder)
            .Select(m => new MilestoneDto(m.YearLabel, m.Title, m.Body)).ToListAsync());

    [HttpGet("values")]
    public async Task<ActionResult<IEnumerable<ValueDto>>> GetValues() =>
        Ok(await db.ClubValues.AsNoTracking().OrderBy(v => v.SortOrder)
            .Select(v => new ValueDto(v.Title, v.Body)).ToListAsync());

    [HttpGet("honours")]
    public async Task<ActionResult<IEnumerable<HonourDto>>> GetHonours() =>
        Ok(await db.ClubHonours.AsNoTracking().OrderBy(h => h.SortOrder)
            .Select(h => new HonourDto(h.Title, h.Years, h.CountLabel)).ToListAsync());

    [HttpGet("executives")]
    public async Task<ActionResult<IEnumerable<ExecutiveDto>>> GetExecutives() =>
        Ok(await db.ClubExecutives.AsNoTracking().OrderBy(e => e.SortOrder)
            .Select(e => new ExecutiveDto(e.FullName, e.RoleTitle, e.ImagePath ?? string.Empty)).ToListAsync());

    [HttpGet("partners")]
    public async Task<ActionResult<IEnumerable<PartnerDto>>> GetPartners() =>
        Ok(await db.Partners.AsNoTracking().OrderBy(p => p.SortOrder)
            .Select(p => new PartnerDto(p.Name)).ToListAsync());

    [HttpGet("quick-links")]
    public async Task<ActionResult<IEnumerable<QuickLinkDto>>> GetQuickLinks() =>
        Ok(await db.QuickLinks.AsNoTracking().OrderBy(q => q.SortOrder)
            .Select(q => new QuickLinkDto(q.Label, q.Href)).ToListAsync());

    [HttpGet("faqs")]
    public async Task<ActionResult<IEnumerable<FaqDto>>> GetFaqs() =>
        Ok(await db.Faqs.AsNoTracking().OrderBy(f => f.SortOrder)
            .Select(f => new FaqDto(f.Question, f.Answer)).ToListAsync());

    [HttpGet("departments")]
    public async Task<ActionResult<IEnumerable<DepartmentDto>>> GetDepartments() =>
        Ok(await db.ContactDepartments.AsNoTracking().OrderBy(d => d.SortOrder)
            .Select(d => new DepartmentDto(d.Name, d.Email, d.Phone)).ToListAsync());
}
