using System.ComponentModel.DataAnnotations;

namespace AureliaFc.Api.Models;

/// <summary>An editorial story shown on the News screens.</summary>
public class NewsArticle
{
    public int Id { get; set; }

    [MaxLength(180)]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(60)]
    public string Category { get; set; } = string.Empty;

    [MaxLength(220)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Excerpt { get; set; } = string.Empty;

    public string Body { get; set; } = string.Empty;

    [MaxLength(120)]
    public string? AuthorName { get; set; }

    [MaxLength(500)]
    public string? PullQuote { get; set; }

    [MaxLength(120)]
    public string? PullQuoteBy { get; set; }

    [MaxLength(255)]
    public string? ImagePath { get; set; }

    public DateTime PublishedAt { get; set; }
    public bool IsFeatured { get; set; }

    public ICollection<NewsTag> Tags { get; set; } = new List<NewsTag>();
}

public class NewsTag
{
    public int Id { get; set; }
    public int ArticleId { get; set; }

    [MaxLength(60)]
    public string Tag { get; set; } = string.Empty;

    public NewsArticle? Article { get; set; }
}

/// <summary>Photograph shown in the Media Gallery.</summary>
public class GalleryImage
{
    public int Id { get; set; }

    [MaxLength(20)]
    public string Category { get; set; } = string.Empty;

    [MaxLength(180)]
    public string Caption { get; set; } = string.Empty;

    [MaxLength(255)]
    public string ImagePath { get; set; } = string.Empty;

    public int WidthPx { get; set; }
    public int HeightPx { get; set; }
    public int SortOrder { get; set; }
}
