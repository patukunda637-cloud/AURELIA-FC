using AureliaFc.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AureliaFc.Api.Data;

/// <summary>
/// EF Core context mapped onto the MySQL 8 schema in <c>database/01_schema.sql</c>.
/// Column names match that script exactly so the same database can be created by
/// either the SQL script or <c>Database.EnsureCreated()</c>.
/// </summary>
public class AureliaDbContext(DbContextOptions<AureliaDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<Position> Positions => Set<Position>();
    public DbSet<Player> Players => Set<Player>();
    public DbSet<PlayerSeasonStat> PlayerSeasonStats => Set<PlayerSeasonStat>();
    public DbSet<PlayerCareerHistory> PlayerCareerHistories => Set<PlayerCareerHistory>();
    public DbSet<Competition> Competitions => Set<Competition>();
    public DbSet<LeagueStanding> LeagueStandings => Set<LeagueStanding>();
    public DbSet<Match> Matches => Set<Match>();
    public DbSet<MatchEvent> MatchEvents => Set<MatchEvent>();
    public DbSet<MatchStat> MatchStats => Set<MatchStat>();
    public DbSet<MatchLineup> MatchLineups => Set<MatchLineup>();
    public DbSet<NewsArticle> NewsArticles => Set<NewsArticle>();
    public DbSet<NewsTag> NewsTags => Set<NewsTag>();
    public DbSet<GalleryImage> GalleryImages => Set<GalleryImage>();
    public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<TicketFixture> TicketFixtures => Set<TicketFixture>();
    public DbSet<SeasonTicketTier> SeasonTicketTiers => Set<SeasonTicketTier>();
    public DbSet<SeasonTicketFeature> SeasonTicketFeatures => Set<SeasonTicketFeature>();
    public DbSet<HospitalityPackage> HospitalityPackages => Set<HospitalityPackage>();
    public DbSet<ContactDepartment> ContactDepartments => Set<ContactDepartment>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
    public DbSet<Faq> Faqs => Set<Faq>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<ClubInfo> ClubInfos => Set<ClubInfo>();
    public DbSet<ClubMilestone> ClubMilestones => Set<ClubMilestone>();
    public DbSet<ClubValue> ClubValues => Set<ClubValue>();
    public DbSet<ClubHonour> ClubHonours => Set<ClubHonour>();
    public DbSet<ClubExecutive> ClubExecutives => Set<ClubExecutive>();
    public DbSet<Partner> Partners => Set<Partner>();
    public DbSet<QuickLink> QuickLinks => Set<QuickLink>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // ---- users ----
        b.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.FirstName).HasColumnName("first_name");
            e.Property(x => x.LastName).HasColumnName("last_name");
            e.Property(x => x.Email).HasColumnName("email");
            e.Property(x => x.PasswordHash).HasColumnName("password_hash");
            e.Property(x => x.Role).HasColumnName("role");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(x => x.Email).IsUnique();
        });

        b.Entity<PasswordResetToken>(e =>
        {
            e.ToTable("password_reset_tokens");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.Property(x => x.TokenHash).HasColumnName("token_hash");
            e.Property(x => x.ExpiresAt).HasColumnName("expires_at");
            e.Property(x => x.UsedAt).HasColumnName("used_at");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId);
        });

        // ---- squads ----
        b.Entity<Team>(e =>
        {
            e.ToTable("teams");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name");
            e.Property(x => x.Coach).HasColumnName("coach");
            e.Property(x => x.PlayerCount).HasColumnName("player_count");
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.ImagePath).HasColumnName("image_path");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
        });

        b.Entity<Position>(e =>
        {
            e.ToTable("positions");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name");
        });

        b.Entity<Player>(e =>
        {
            e.ToTable("players");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.TeamId).HasColumnName("team_id");
            e.Property(x => x.PositionId).HasColumnName("position_id");
            e.Property(x => x.SquadNumber).HasColumnName("squad_number");
            e.Property(x => x.FirstName).HasColumnName("first_name");
            e.Property(x => x.LastName).HasColumnName("last_name");
            e.Property(x => x.Nationality).HasColumnName("nationality");
            e.Property(x => x.DateOfBirth).HasColumnName("date_of_birth");
            e.Property(x => x.HeightCm).HasColumnName("height_cm");
            e.Property(x => x.Bio).HasColumnName("bio");
            e.Property(x => x.ImagePath).HasColumnName("image_path");
            e.Property(x => x.Goals).HasColumnName("goals");
            e.Property(x => x.Assists).HasColumnName("assists");
            e.Property(x => x.Appearances).HasColumnName("appearances");
            e.Property(x => x.AvgRating).HasColumnName("avg_rating").HasPrecision(4, 2);
            e.HasIndex(x => new { x.TeamId, x.SquadNumber }).IsUnique();
            e.HasOne(x => x.Team).WithMany(t => t.Players).HasForeignKey(x => x.TeamId);
            e.HasOne(x => x.Position).WithMany(p => p.Players).HasForeignKey(x => x.PositionId);
        });

        b.Entity<PlayerSeasonStat>(e =>
        {
            e.ToTable("player_season_stats");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.PlayerId).HasColumnName("player_id");
            e.Property(x => x.Season).HasColumnName("season");
            e.Property(x => x.MonthLabel).HasColumnName("month_label");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
            e.Property(x => x.Apps).HasColumnName("apps");
            e.Property(x => x.Goals).HasColumnName("goals");
            e.Property(x => x.Assists).HasColumnName("assists");
            e.HasOne(x => x.Player).WithMany(p => p.SeasonStats).HasForeignKey(x => x.PlayerId);
        });

        b.Entity<PlayerCareerHistory>(e =>
        {
            e.ToTable("player_career_history");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.PlayerId).HasColumnName("player_id");
            e.Property(x => x.ClubName).HasColumnName("club_name");
            e.Property(x => x.Period).HasColumnName("period");
            e.Property(x => x.Appearances).HasColumnName("appearances");
            e.Property(x => x.Goals).HasColumnName("goals");
            e.Property(x => x.Note).HasColumnName("note");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
            e.HasOne(x => x.Player).WithMany(p => p.CareerHistory).HasForeignKey(x => x.PlayerId);
        });

        // ---- competitions & matches ----
        b.Entity<Competition>(e =>
        {
            e.ToTable("competitions");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name");
            e.Property(x => x.Type).HasColumnName("type");
            e.Property(x => x.Season).HasColumnName("season");
        });

        b.Entity<LeagueStanding>(e =>
        {
            e.ToTable("league_standings");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.CompetitionId).HasColumnName("competition_id");
            e.Property(x => x.Position).HasColumnName("position");
            e.Property(x => x.ClubName).HasColumnName("club_name");
            e.Property(x => x.Played).HasColumnName("played");
            e.Property(x => x.Won).HasColumnName("won");
            e.Property(x => x.Drawn).HasColumnName("drawn");
            e.Property(x => x.Lost).HasColumnName("lost");
            e.Property(x => x.GoalsFor).HasColumnName("goals_for");
            e.Property(x => x.GoalsAgainst).HasColumnName("goals_against");
            e.Ignore(x => x.GoalDifference);
            e.Ignore(x => x.Points);
            e.HasOne(x => x.Competition).WithMany(c => c.Standings).HasForeignKey(x => x.CompetitionId);
        });

        b.Entity<Match>(e =>
        {
            e.ToTable("matches");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.CompetitionId).HasColumnName("competition_id");
            e.Property(x => x.HomeTeam).HasColumnName("home_team");
            e.Property(x => x.AwayTeam).HasColumnName("away_team");
            e.Property(x => x.KickoffAt).HasColumnName("kickoff_at");
            e.Property(x => x.Venue).HasColumnName("venue");
            e.Property(x => x.IsHome).HasColumnName("is_home");
            e.Property(x => x.Status).HasColumnName("status");
            e.Property(x => x.HomeScore).HasColumnName("home_score");
            e.Property(x => x.AwayScore).HasColumnName("away_score");
            e.Property(x => x.Attendance).HasColumnName("attendance");
            e.Property(x => x.MatchReport).HasColumnName("match_report");
            e.HasOne(x => x.Competition).WithMany(c => c.Matches).HasForeignKey(x => x.CompetitionId);
        });

        b.Entity<MatchEvent>(e =>
        {
            e.ToTable("match_events");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.MatchId).HasColumnName("match_id");
            e.Property(x => x.Minute).HasColumnName("minute");
            e.Property(x => x.TeamSide).HasColumnName("team_side");
            e.Property(x => x.PlayerName).HasColumnName("player_name");
            e.Property(x => x.EventType).HasColumnName("event_type");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
            e.HasOne(x => x.Match).WithMany(m => m.Events).HasForeignKey(x => x.MatchId);
        });

        b.Entity<MatchStat>(e =>
        {
            e.ToTable("match_stats");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.MatchId).HasColumnName("match_id");
            e.Property(x => x.StatLabel).HasColumnName("stat_label");
            e.Property(x => x.HomeValue).HasColumnName("home_value");
            e.Property(x => x.AwayValue).HasColumnName("away_value");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
            e.HasOne(x => x.Match).WithMany(m => m.Stats).HasForeignKey(x => x.MatchId);
        });

        b.Entity<MatchLineup>(e =>
        {
            e.ToTable("match_lineups");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.MatchId).HasColumnName("match_id");
            e.Property(x => x.Side).HasColumnName("side");
            e.Property(x => x.Formation).HasColumnName("formation");
            e.Property(x => x.SquadNo).HasColumnName("squad_no");
            e.Property(x => x.PlayerName).HasColumnName("player_name");
            e.Property(x => x.RoleCode).HasColumnName("role_code");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
            e.HasOne(x => x.Match).WithMany(m => m.Lineups).HasForeignKey(x => x.MatchId);
        });

        // ---- content ----
        b.Entity<NewsArticle>(e =>
        {
            e.ToTable("news_articles");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Slug).HasColumnName("slug");
            e.Property(x => x.Category).HasColumnName("category");
            e.Property(x => x.Title).HasColumnName("title");
            e.Property(x => x.Excerpt).HasColumnName("excerpt");
            e.Property(x => x.Body).HasColumnName("body");
            e.Property(x => x.AuthorName).HasColumnName("author_name");
            e.Property(x => x.PullQuote).HasColumnName("pull_quote");
            e.Property(x => x.PullQuoteBy).HasColumnName("pull_quote_by");
            e.Property(x => x.ImagePath).HasColumnName("image_path");
            e.Property(x => x.PublishedAt).HasColumnName("published_at");
            e.Property(x => x.IsFeatured).HasColumnName("is_featured");
            e.HasIndex(x => x.Slug).IsUnique();
        });

        b.Entity<NewsTag>(e =>
        {
            e.ToTable("news_tags");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.ArticleId).HasColumnName("article_id");
            e.Property(x => x.Tag).HasColumnName("tag");
            e.HasOne(x => x.Article).WithMany(a => a.Tags).HasForeignKey(x => x.ArticleId);
        });

        b.Entity<GalleryImage>(e =>
        {
            e.ToTable("gallery_images");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Category).HasColumnName("category");
            e.Property(x => x.Caption).HasColumnName("caption");
            e.Property(x => x.ImagePath).HasColumnName("image_path");
            e.Property(x => x.WidthPx).HasColumnName("width_px");
            e.Property(x => x.HeightPx).HasColumnName("height_px");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
        });

        // ---- shop ----
        b.Entity<ProductCategory>(e =>
        {
            e.ToTable("product_categories");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
        });

        b.Entity<Product>(e =>
        {
            e.ToTable("products");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.CategoryId).HasColumnName("category_id");
            e.Property(x => x.Name).HasColumnName("name");
            e.Property(x => x.Price).HasColumnName("price").HasPrecision(8, 2);
            e.Property(x => x.ImagePath).HasColumnName("image_path");
            e.Property(x => x.Badge).HasColumnName("badge");
            e.Property(x => x.IsFeatured).HasColumnName("is_featured");
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
            e.HasOne(x => x.Category).WithMany(c => c.Products).HasForeignKey(x => x.CategoryId);
        });

        // ---- tickets ----
        b.Entity<TicketFixture>(e =>
        {
            e.ToTable("ticket_fixtures");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.MatchId).HasColumnName("match_id");
            e.Property(x => x.PriceMin).HasColumnName("price_min").HasPrecision(8, 2);
            e.Property(x => x.PriceMax).HasColumnName("price_max").HasPrecision(8, 2);
            e.Property(x => x.AvailableSeats).HasColumnName("available_seats");
            e.Property(x => x.StatusLabel).HasColumnName("status_label");
            e.HasIndex(x => x.MatchId).IsUnique();
            e.HasOne(x => x.Match).WithOne(m => m.TicketFixture).HasForeignKey<TicketFixture>(x => x.MatchId);
        });

        b.Entity<SeasonTicketTier>(e =>
        {
            e.ToTable("season_ticket_tiers");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name");
            e.Property(x => x.Price).HasColumnName("price").HasPrecision(8, 2);
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
        });

        b.Entity<SeasonTicketFeature>(e =>
        {
            e.ToTable("season_ticket_features");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.TierId).HasColumnName("tier_id");
            e.Property(x => x.Feature).HasColumnName("feature");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
            e.HasOne(x => x.Tier).WithMany(t => t.Features).HasForeignKey(x => x.TierId);
        });

        b.Entity<HospitalityPackage>(e =>
        {
            e.ToTable("hospitality_packages");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name");
            e.Property(x => x.Price).HasColumnName("price").HasPrecision(10, 2);
            e.Property(x => x.PriceUnit).HasColumnName("price_unit");
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.ImagePath).HasColumnName("image_path");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
        });

        // ---- contact ----
        b.Entity<ContactDepartment>(e =>
        {
            e.ToTable("contact_departments");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name");
            e.Property(x => x.Email).HasColumnName("email");
            e.Property(x => x.Phone).HasColumnName("phone");
            e.Property(x => x.Note).HasColumnName("note");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
        });

        b.Entity<ContactMessage>(e =>
        {
            e.ToTable("contact_messages");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.FullName).HasColumnName("full_name");
            e.Property(x => x.Email).HasColumnName("email");
            e.Property(x => x.Subject).HasColumnName("subject");
            e.Property(x => x.Message).HasColumnName("message");
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.IsHandled).HasColumnName("is_handled");
            e.HasOne(x => x.User).WithMany(u => u.ContactMessages).HasForeignKey(x => x.UserId);
        });

        b.Entity<Faq>(e =>
        {
            e.ToTable("faqs");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Question).HasColumnName("question");
            e.Property(x => x.Answer).HasColumnName("answer");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
        });

        // ---- orders ----
        b.Entity<Order>(e =>
        {
            e.ToTable("orders");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.Property(x => x.Reference).HasColumnName("reference");
            e.Property(x => x.OrderType).HasColumnName("order_type");
            e.Property(x => x.Status).HasColumnName("status");
            e.Property(x => x.TotalAmount).HasColumnName("total_amount").HasPrecision(10, 2);
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.HasIndex(x => x.Reference).IsUnique();
            e.HasOne(x => x.User).WithMany(u => u.Orders).HasForeignKey(x => x.UserId);
        });

        b.Entity<OrderItem>(e =>
        {
            e.ToTable("order_items");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.OrderId).HasColumnName("order_id");
            e.Property(x => x.ItemType).HasColumnName("item_type");
            e.Property(x => x.ItemRefId).HasColumnName("item_ref_id");
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.Quantity).HasColumnName("quantity");
            e.Property(x => x.UnitPrice).HasColumnName("unit_price").HasPrecision(8, 2);
            e.HasOne(x => x.Order).WithMany(o => o.Items).HasForeignKey(x => x.OrderId);
        });

        // ---- club ----
        b.Entity<ClubInfo>(e =>
        {
            e.ToTable("club_info");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.ClubName).HasColumnName("club_name");
            e.Property(x => x.Motto).HasColumnName("motto");
            e.Property(x => x.FoundedYear).HasColumnName("founded_year");
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.StadiumName).HasColumnName("stadium_name");
            e.Property(x => x.Capacity).HasColumnName("capacity");
            e.Property(x => x.BuiltYear).HasColumnName("built_year");
            e.Property(x => x.RecordAttendance).HasColumnName("record_attendance");
            e.Property(x => x.Address).HasColumnName("address");
            e.Property(x => x.Phone).HasColumnName("phone");
        });

        b.Entity<ClubMilestone>(e =>
        {
            e.ToTable("club_milestones");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.YearLabel).HasColumnName("year_label");
            e.Property(x => x.Title).HasColumnName("title");
            e.Property(x => x.Body).HasColumnName("body");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
        });

        b.Entity<ClubValue>(e =>
        {
            e.ToTable("club_values");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Title).HasColumnName("title");
            e.Property(x => x.Body).HasColumnName("body");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
        });

        b.Entity<ClubHonour>(e =>
        {
            e.ToTable("club_honours");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Title).HasColumnName("title");
            e.Property(x => x.Years).HasColumnName("years");
            e.Property(x => x.CountLabel).HasColumnName("count_label");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
        });

        b.Entity<ClubExecutive>(e =>
        {
            e.ToTable("club_executives");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.FullName).HasColumnName("full_name");
            e.Property(x => x.RoleTitle).HasColumnName("role_title");
            e.Property(x => x.ImagePath).HasColumnName("image_path");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
        });

        b.Entity<Partner>(e =>
        {
            e.ToTable("partners");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
        });

        b.Entity<QuickLink>(e =>
        {
            e.ToTable("quick_links");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Label).HasColumnName("label");
            e.Property(x => x.Href).HasColumnName("href");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
        });
    }
}
