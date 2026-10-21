// ---------------------------------------------------------------------------
// API response types — mirror the DTOs in backend/AureliaFc.Api/Contracts/Dtos.cs
// ---------------------------------------------------------------------------

export interface ClubInfo {
  clubName: string;
  motto: string;
  foundedYear: number;
  description: string;
  stadiumName: string;
  capacity: number;
  builtYear: number;
  recordAttendance: number;
  address: string;
  phone: string;
}

export interface Milestone { yearLabel: string; title: string; body: string }
export interface ClubValue { title: string; body: string }
export interface Honour { title: string; years: string; countLabel: string }
export interface Executive { fullName: string; roleTitle: string; imagePath: string }
export interface Partner { name: string }
export interface QuickLink { label: string; href: string }
export interface Department { name: string; email: string; phone: string | null }
export interface Faq { question: string; answer: string }

export interface Team {
  id: number;
  name: string;
  coach: string;
  playerCount: number;
  description: string | null;
  imagePath: string | null;
}

export interface PlayerCard {
  id: number;
  squadNumber: number;
  fullName: string;
  firstName: string;
  lastName: string;
  position: string;
  positionGroup: string;
  nationality: string;
  imagePath: string | null;
  goals: number;
  assists: number;
  appearances: number;
  avgRating: number;
  teamId: number;
  teamName: string;
}

export interface SeasonStat { month: string; apps: number; goals: number; assists: number }
export interface CareerEntry {
  clubName: string;
  period: string;
  appearances: number | null;
  goals: number | null;
  note: string | null;
}

export interface PlayerDetail extends PlayerCard {
  dateOfBirth: string | null;
  heightCm: number | null;
  bio: string | null;
  season: string;
  seasonStats: SeasonStat[];
  careerHistory: CareerEntry[];
}

export interface Standing {
  position: number;
  clubName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface LeagueTable { competition: string; season: string; rows: Standing[] }

export interface Fixture {
  id: number;
  competition: string;
  competitionType: string;
  date: string;
  dateLabel: string;
  timeLabel: string;
  kickoffIso: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  isHome: boolean;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  homeScore: number | null;
  awayScore: number | null;
  scoreLabel: string;
  ticketsAvailable: boolean;
  priceMin: number | null;
  priceMax: number | null;
  availableSeats: number | null;
  ticketStatus: string | null;
}

export interface MatchEvent { minute: number; side: string; playerName: string; eventType: string }
export interface MatchStat { label: string; home: string; away: string }
export interface Lineup { side: string; formation: string; squadNo: string; playerName: string; roleCode: string }

export interface MatchDetail {
  id: number;
  competition: string;
  statusLabel: string;
  dateLabel: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  attendance: number | null;
  scoreLabel: string;
  report: string;
  homeScore: number | null;
  awayScore: number | null;
  events: MatchEvent[];
  stats: MatchStat[];
  lineups: Lineup[];
}

export interface TicketFixture {
  id: number;
  matchId: number;
  dateLabel: string;
  monthLabel: string;
  dayLabel: string;
  tournament: string;
  matchLabel: string;
  venue: string;
  kickoffLabel: string;
  priceMin: number;
  priceMax: number;
  availableSeats: number;
  statusLabel: string;
}

export interface SeasonTier {
  name: string;
  price: number;
  description: string;
  features: string[];
}

export interface Hospitality {
  name: string;
  price: number;
  priceUnit: string;
  description: string;
  imagePath: string | null;
}

export interface ProductCategory { id: number; name: string }

export interface Product {
  id: number;
  categoryId: number;
  category: string;
  name: string;
  price: number;
  imagePath: string | null;
  badge: string | null;
  isFeatured: boolean;
  description: string | null;
}

export interface ArticleCard {
  id: number;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  imagePath: string | null;
  dateLabel: string;
  publishedIso: string;
  isFeatured: boolean;
}

export interface ArticleDetail extends ArticleCard {
  body: string;
  authorName: string | null;
  pullQuote: string | null;
  pullQuoteBy: string | null;
  tags: string[];
}

export interface GalleryImage {
  id: number;
  category: string;
  caption: string;
  imagePath: string;
  width: number;
  height: number;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface ContactMessageResult { id: number; reference: string; message: string }

export interface OrderItemPayload {
  itemType: 'Product' | 'MatchTicket' | 'SeasonTicket' | 'Hospitality';
  itemRefId?: number | null;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderRequest {
  orderType: 'Shop' | 'Tickets' | 'SeasonTicket' | 'Hospitality';
  items: OrderItemPayload[];
}

export interface OrderItem extends OrderItemPayload { id: number }

export interface Order {
  id: number;
  reference: string;
  orderType: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

/** Field-level validation errors returned by ProblemDetails responses. */
export type FieldErrors = Record<string, string>;
