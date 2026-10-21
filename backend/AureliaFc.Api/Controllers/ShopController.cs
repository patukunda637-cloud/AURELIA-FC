using AureliaFc.Api.Contracts;
using AureliaFc.Api.Data;
using AureliaFc.Api.Models;
using AureliaFc.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AureliaFc.Api.Controllers;

[ApiController]
[Route("api/shop")]
public class ShopController(AureliaDbContext db) : ControllerBase
{
    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<ProductCategoryDto>>> GetCategories() =>
        Ok(await db.ProductCategories.AsNoTracking().OrderBy(c => c.SortOrder)
            .Select(c => new ProductCategoryDto(c.Id, c.Name)).ToListAsync());

    /// <summary>Product listing; category = All | Kits | Training | Accessories | Lifestyle.</summary>
    [HttpGet("products")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts([FromQuery] string? category)
    {
        var query = db.Products.AsNoTracking().Include(p => p.Category).AsQueryable();
        if (!string.IsNullOrWhiteSpace(category) && !category.Equals("All", StringComparison.OrdinalIgnoreCase))
            query = query.Where(p => p.Category!.Name == category);

        var products = await query.OrderBy(p => p.SortOrder).ToListAsync();
        return Ok(products.Select(Mappers.ToDto));
    }

    [HttpGet("products/{id:int}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var p = await db.Products.AsNoTracking().Include(x => x.Category)
            .FirstOrDefaultAsync(x => x.Id == id);
        return p is null ? NotFound() : Ok(Mappers.ToDto(p));
    }

    /// <summary>The featured hero product on the Shop landing section.</summary>
    [HttpGet("featured")]
    public async Task<ActionResult<ProductDto>> GetFeatured()
    {
        var p = await db.Products.AsNoTracking().Include(x => x.Category)
            .Where(x => x.IsFeatured).OrderBy(x => x.SortOrder).FirstOrDefaultAsync();
        return p is null ? NotFound() : Ok(Mappers.ToDto(p));
    }
}
