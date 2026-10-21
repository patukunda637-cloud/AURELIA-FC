using System.Security.Claims;
using AureliaFc.Api.Contracts;
using AureliaFc.Api.Data;
using AureliaFc.Api.Models;
using AureliaFc.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AureliaFc.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController(AureliaDbContext db) : ApiControllerBase
{
    private static readonly HashSet<string> OrderTypes =
        new(StringComparer.OrdinalIgnoreCase) { "Shop", "Tickets", "SeasonTicket", "Hospitality" };

    private static readonly HashSet<string> ItemTypes =
        new(StringComparer.OrdinalIgnoreCase) { "Product", "MatchTicket", "SeasonTicket", "Hospitality" };

    /// <summary>
    /// Creates an order (shop basket, match tickets, season ticket or hospitality).
    /// Prices are re-validated server side against the catalogue for products so the
    /// client cannot dictate the charged amount.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create(CreateOrderRequest req)
    {
        var errors = new Dictionary<string, string>();

        if (req.OrderType is null || !OrderTypes.Contains(req.OrderType))
            errors["orderType"] = "Order type must be Shop, Tickets, SeasonTicket or Hospitality.";

        if (req.Items is null || req.Items.Count == 0)
            errors["items"] = "An order must contain at least one item.";

        if (errors.Count == 0)
        {
            foreach (var item in req.Items!)
            {
                if (!ItemTypes.Contains(item.ItemType))
                    errors["items"] = $"Unknown item type '{item.ItemType}'.";
                if (item.Quantity < 1 || item.Quantity > 99)
                    errors["items"] = "Item quantity must be between 1 and 99.";
                if (item.UnitPrice < 0)
                    errors["items"] = "Unit price cannot be negative.";
            }
        }

        if (errors.Count > 0) return ValidationErrors(errors);

        // Re-price product lines from the database.
        var verifiedItems = new List<OrderItem>();
        foreach (var item in req.Items!)
        {
            var description = item.Description?.Trim() ?? string.Empty;
            var unitPrice = item.UnitPrice;

            if (item.ItemType.Equals("Product", StringComparison.OrdinalIgnoreCase) && item.ItemRefId.HasValue)
            {
                var product = await db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == item.ItemRefId.Value);
                if (product is null)
                    return BadRequest(new ProblemDetails { Title = "Unknown product", Detail = $"Product {item.ItemRefId} does not exist." });
                description = product.Name;
                unitPrice = product.Price;
            }

            if (string.IsNullOrWhiteSpace(description))
                description = item.ItemType;

            verifiedItems.Add(new OrderItem
            {
                ItemType = NormalizeItemType(item.ItemType),
                ItemRefId = item.ItemRefId,
                Description = description,
                Quantity = item.Quantity,
                UnitPrice = unitPrice,
            });
        }

        int? userId = null;
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(idClaim, out var parsed) && await db.Users.AnyAsync(u => u.Id == parsed))
            userId = parsed;
        else if (req.UserId.HasValue && await db.Users.AnyAsync(u => u.Id == req.UserId.Value))
            userId = req.UserId;

        var total = verifiedItems.Sum(i => i.UnitPrice * i.Quantity);

        var order = new Order
        {
            UserId = userId,
            Reference = ReferenceGenerator.NewReference("AUR"),
            OrderType = NormalizeOrderType(req.OrderType!),
            Status = "Pending",
            TotalAmount = total,
            CreatedAt = DateTime.UtcNow,
            Items = verifiedItems,
        };

        db.Orders.Add(order);
        await db.SaveChangesAsync();

        // Reload to include the persisted item ids.
        var created = await db.Orders.AsNoTracking().Include(o => o.Items)
            .FirstAsync(o => o.Id == order.Id);

        return CreatedAtAction(nameof(Get), new { id = order.Id }, Mappers.ToDto(created));
    }

    /// <summary>Order detail. Owners may read their own orders; admins may read any.</summary>
    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDto>> Get(int id)
    {
        var order = await db.Orders.AsNoTracking().Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);
        if (order is null) return NotFound();

        var isAdmin = User.IsInRole("Admin");
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isOwner = int.TryParse(idClaim, out var uid) && order.UserId == uid;

        if (!isAdmin && !isOwner) return Forbid();
        return Ok(Mappers.ToDto(order));
    }

    /// <summary>Order history for the signed-in supporter.</summary>
    [Authorize]
    [HttpGet("mine")]
    public async Task<ActionResult<IEnumerable<OrderDto>>> Mine()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(idClaim, out var uid)) return Unauthorized();

        var orders = await db.Orders.AsNoTracking().Include(o => o.Items)
            .Where(o => o.UserId == uid)
            .OrderByDescending(o => o.CreatedAt).ToListAsync();
        return Ok(orders.Select(Mappers.ToDto));
    }

    private static string NormalizeOrderType(string value) =>
        OrderTypes.First(t => t.Equals(value, StringComparison.OrdinalIgnoreCase));

    private static string NormalizeItemType(string value) =>
        ItemTypes.First(t => t.Equals(value, StringComparison.OrdinalIgnoreCase));
}
