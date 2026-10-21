namespace AureliaFc.Api.Contracts;

// ---------------------------------------------------------------------------
// Read models (API responses). These are deliberately flat/shaped for the
// React front-end so no EF navigation cycles leak over the wire.
// ---------------------------------------------------------------------------

// ---- club ----
public record ClubInfoDto(
    string ClubName, string Motto, int FoundedYear, string Description,
    string StadiumName, int Capacity, int BuiltYear, int RecordAttendance,
    string Address, string Phone);

public record MilestoneDto(string YearLabel, string Title, string Body);
public record ValueDto(string Title, string Body);
public record HonourDto(string Title, string Years, string CountLabel);
public record ExecutiveDto(string FullName, string RoleTitle, string ImagePath);
public record PartnerDto(string Name);
public record QuickLinkDto(string Label, string Href);

// ---- squads / players ----
public record TeamDto(
    int Id, string Name, string Coach, int PlayerCount,
    string? Description, string? ImagePath);

public record PositionDto(int Id, string Name);

public record PlayerCardDto(
    int Id, int SquadNumber, string FullName, string FirstName, string LastName,
    string Position, string PositionGroup, string Nationality,
    string? ImagePath, int Goals, int Assists, int Appearances, decimal AvgRating,
    int TeamId, string TeamName);

public record SeasonStatDto(string Month, int Apps, int Goals, int Assists);
public record CareerEntryDto(string ClubName, string Period, int? Appearances, int? Goals, string? Note);

public record PlayerDetailDto(
    int Id, int SquadNumber, string FullName, string FirstName, string LastName,
    string Position, string PositionGroup, string Nationality, string? DateOfBirth,
    int? HeightCm, string? Bio, string? ImagePath,
    int Goals, int Assists, int Appearances, decimal AvgRating,
    int TeamId, string TeamName, string Season,
    IReadOnlyList<SeasonStatDto> SeasonStats,
    IReadOnlyList<CareerEntryDto> CareerHistory);

// ---- competitions / matches ----
public record StandingDto(
    int Position, string ClubName, int Played, int Won, int Drawn, int Lost,
    int GoalsFor, int GoalsAgainst, int GoalDifference, int Points);

public record LeagueTableDto(string Competition, string Season, IReadOnlyList<StandingDto> Rows);

public record FixtureDto(
    int Id, string Competition, string CompetitionType,
    string Date, string DateLabel, string TimeLabel, string KickoffIso,
    string HomeTeam, string AwayTeam, string Venue, bool IsHome,
    string Status, int? HomeScore, int? AwayScore, string ScoreLabel,
    bool TicketsAvailable, decimal? PriceMin, decimal? PriceMax,
    int? AvailableSeats, string? TicketStatus);

public record MatchEventDto(int Minute, string Side, string PlayerName, string EventType);
public record MatchStatDto(string Label, string Home, string Away);
public record LineupDto(string Side, string Formation, string SquadNo, string PlayerName, string RoleCode);
public record MatchDetailDto(
    int Id, string Competition, string StatusLabel, string DateLabel,
    string HomeTeam, string AwayTeam, string Venue, int? Attendance,
    string ScoreLabel, string Report, int? HomeScore, int? AwayScore,
    IReadOnlyList<MatchEventDto> Events,
    IReadOnlyList<MatchStatDto> Stats,
    IReadOnlyList<LineupDto> Lineups);

// ---- tickets ----
public record TicketFixtureDto(
    int Id, int MatchId, string DateLabel, string MonthLabel, string DayLabel,
    string Tournament, string MatchLabel, string Venue, string KickoffLabel,
    decimal PriceMin, decimal PriceMax, int AvailableSeats, string StatusLabel);

public record SeasonTierDto(string Name, decimal Price, string Description, IReadOnlyList<string> Features);
public record HospitalityDto(string Name, decimal Price, string PriceUnit, string Description, string? ImagePath);

// ---- shop ----
public record ProductCategoryDto(int Id, string Name);
public record ProductDto(
    int Id, int CategoryId, string Category, string Name, decimal Price,
    string? ImagePath, string? Badge, bool IsFeatured, string? Description);

// ---- news ----
public record ArticleCardDto(
    int Id, string Slug, string Category, string Title, string Excerpt,
    string? ImagePath, string DateLabel, string PublishedIso, bool IsFeatured);

public record ArticleDetailDto(
    int Id, string Slug, string Category, string Title, string Excerpt, string Body,
    string? AuthorName, string? PullQuote, string? PullQuoteBy, string? ImagePath,
    string DateLabel, string PublishedIso, bool IsFeatured, IReadOnlyList<string> Tags);

// ---- gallery ----
public record GalleryImageDto(int Id, string Category, string Caption, string ImagePath, int Width, int Height);

// ---- contact ----
public record DepartmentDto(string Name, string Email, string? Phone);
public record FaqDto(string Question, string Answer);

// ---- auth ----
public record RegisterRequest(string FirstName, string LastName, string Email, string Password, string? ConfirmPassword);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, string ExpiresAt, int UserId, string FirstName, string LastName, string Email, string Role);
public record UserDto(int Id, string FirstName, string LastName, string Email, string Role, string CreatedAt);

// ---- misc writes ----
public record ContactMessageRequest(string FullName, string Email, string Subject, string Message);
public record ContactMessageResult(int Id, string Reference, string Message);

public record OrderItemRequest(string ItemType, int? ItemRefId, string Description, int Quantity, decimal UnitPrice);
public record CreateOrderRequest(string OrderType, IReadOnlyList<OrderItemRequest> Items, int? UserId);
public record OrderItemDto(int Id, string ItemType, int? ItemRefId, string Description, int Quantity, decimal UnitPrice);
public record OrderDto(
    int Id, string Reference, string OrderType, string Status, decimal TotalAmount,
    string CreatedAt, IReadOnlyList<OrderItemDto> Items);
