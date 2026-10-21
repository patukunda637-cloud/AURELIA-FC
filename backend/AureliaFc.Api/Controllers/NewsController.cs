using AureliaFc.Api.Contracts;
using AureliaFc.Api.Data;
using AureliaFc.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AureliaFc.Api.Controllers;

[ApiController]
[Route("api/news")]
public class NewsController(AureliaDbContext db) : ControllerBase
{
    /// <summary>Article cards, newest first. category filters by tag category.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ArticleCardDto>>> GetArticles([FromQuery] string? category)
    {
        var query = db.NewsArticles.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(category) && !category.Equals("All", StringComparison.OrdinalIgnoreCase))
            query = query.Where(a => a.Category == category);

        var articles = await query.OrderByDescending(a => a.PublishedAt).ToListAsync();
        return Ok(articles.Select(Mappers.ToCard));
    }

    [HttpGet("featured")]
    public async Task<ActionResult<ArticleCardDto>> GetFeatured()
    {
        var a = await db.NewsArticles.AsNoTracking()
            .Where(x => x.IsFeatured).OrderByDescending(x => x.PublishedAt).FirstOrDefaultAsync();
        return a is null ? NotFound() : Ok(Mappers.ToCard(a));
    }

    /// <summary>Full article by URL slug, including tags.</summary>
    [HttpGet("{slug}")]
    public async Task<ActionResult<ArticleDetailDto>> GetArticle(string slug)
    {
        var a = await db.NewsArticles.AsNoTracking().Include(x => x.Tags)
            .FirstOrDefaultAsync(x => x.Slug == slug);
        return a is null ? NotFound() : Ok(Mappers.ToDetail(a));
    }

    /// <summary>Up to 4 related articles (same category, excluding the current one).</summary>
    [HttpGet("{slug}/related")]
    public async Task<ActionResult<IEnumerable<ArticleCardDto>>> GetRelated(string slug)
    {
        var current = await db.NewsArticles.AsNoTracking().FirstOrDefaultAsync(x => x.Slug == slug);
        if (current is null) return NotFound();

        var related = await db.NewsArticles.AsNoTracking()
            .Where(a => a.Id != current.Id)
            .OrderByDescending(a => a.Category == current.Category)
            .ThenByDescending(a => a.PublishedAt)
            .Take(4).ToListAsync();
        return Ok(related.Select(Mappers.ToCard));
    }
}

[ApiController]
[Route("api/gallery")]
public class GalleryController(AureliaDbContext db) : ControllerBase
{
    /// <summary>Gallery images; category = All | Match Day | Training | Events | Stadium.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GalleryImageDto>>> GetImages([FromQuery] string? category)
    {
        var query = db.GalleryImages.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(category) && !category.Equals("All", StringComparison.OrdinalIgnoreCase))
            query = query.Where(g => g.Category == category);

        return Ok(await query.OrderBy(g => g.SortOrder)
            .Select(g => new GalleryImageDto(g.Id, g.Category, g.Caption, g.ImagePath, g.WidthPx, g.HeightPx))
            .ToListAsync());
    }
}
