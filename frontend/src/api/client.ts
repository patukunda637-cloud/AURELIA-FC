import type {
  ArticleCard, ArticleDetail, AuthResponse, ClubInfo, ContactMessageResult, CreateOrderRequest,
  Department, Executive, Faq, FieldErrors, Fixture, GalleryImage, Honour, Hospitality,
  LeagueTable, MatchDetail, Milestone, Order, Partner, PlayerCard, PlayerDetail,
  Product, ProductCategory, QuickLink, SeasonTier, Team, TicketFixture, ClubValue,
} from './types';

const BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const TOKEN_KEY = 'aurelia.auth.token';

/** Thrown for any non-2xx API response; carries field errors for form mapping. */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldErrors;

  constructor(status: number, message: string, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, 'Unable to reach the Aurelia FC service. Please check your connection and try again.');
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const payload = text ? safeJson(text) : null;

  if (!res.ok) {
    const fieldErrors: FieldErrors = {};
    if (payload && typeof payload === 'object' && 'errors' in payload) {
      const raw = (payload as { errors?: Record<string, string[]> }).errors ?? {};
      for (const [key, value] of Object.entries(raw)) {
        fieldErrors[key.charAt(0).toLowerCase() + key.slice(1)] = Array.isArray(value) ? value[0] : String(value);
      }
    }
    const message =
      (payload as { detail?: string; title?: string } | null)?.detail ||
      (payload as { title?: string } | null)?.title ||
      `Request failed (${res.status}).`;
    throw new ApiError(res.status, message, fieldErrors);
  }

  return payload as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const api = {
  // ---- club / content ----
  club: () => request<ClubInfo>('/api/content/club'),
  milestones: () => request<Milestone[]>('/api/content/milestones'),
  clubValues: () => request<ClubValue[]>('/api/content/values'),
  honours: () => request<Honour[]>('/api/content/honours'),
  executives: () => request<Executive[]>('/api/content/executives'),
  partners: () => request<Partner[]>('/api/content/partners'),
  quickLinks: () => request<QuickLink[]>('/api/content/quick-links'),
  faqs: () => request<Faq[]>('/api/content/faqs'),
  departments: () => request<Department[]>('/api/content/departments'),

  // ---- squads / players ----
  teams: () => request<Team[]>('/api/squads'),
  team: (id: number) => request<Team>(`/api/squads/${id}`),
  teamPlayers: (id: number) => request<PlayerCard[]>(`/api/squads/${id}/players`),
  players: (params: { teamId?: number; position?: string; search?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.teamId) q.set('teamId', String(params.teamId));
    if (params.position && params.position !== 'All') q.set('position', params.position);
    if (params.search) q.set('search', params.search);
    const qs = q.toString();
    return request<PlayerCard[]>(`/api/players${qs ? `?${qs}` : ''}`);
  },
  player: (id: number) => request<PlayerDetail>(`/api/players/${id}`),

  // ---- matches ----
  matches: (status?: 'upcoming' | 'results' | 'all') => {
    const qs = status && status !== 'all' ? `?status=${status}` : '';
    return request<Fixture[]>(`/api/matches${qs}`);
  },
  match: (id: number) => request<MatchDetail>(`/api/matches/${id}`),
  standings: (season?: string) =>
    request<LeagueTable>(`/api/matches/standings${season ? `?season=${encodeURIComponent(season)}` : ''}`),

  // ---- tickets ----
  ticketFixtures: () => request<TicketFixture[]>('/api/tickets'),
  seasonTiers: () => request<SeasonTier[]>('/api/tickets/season-tiers'),
  hospitality: () => request<Hospitality[]>('/api/tickets/hospitality'),

  // ---- shop ----
  categories: () => request<ProductCategory[]>('/api/shop/categories'),
  products: (category?: string) =>
    request<Product[]>(`/api/shop/products${category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : ''}`),
  featuredProduct: () => request<Product>('/api/shop/featured'),

  // ---- news ----
  news: (category?: string) =>
    request<ArticleCard[]>(`/api/news${category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : ''}`),
  featuredArticle: () => request<ArticleCard>('/api/news/featured'),
  article: (slug: string) => request<ArticleDetail>(`/api/news/${encodeURIComponent(slug)}`),
  relatedArticles: (slug: string) => request<ArticleCard[]>(`/api/news/${encodeURIComponent(slug)}/related`),

  // ---- gallery ----
  gallery: (category?: string) =>
    request<GalleryImage[]>(`/api/gallery${category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : ''}`),

  // ---- contact ----
  sendContactMessage: (body: { fullName: string; email: string; subject: string; message: string }) =>
    request<ContactMessageResult>('/api/contact', { method: 'POST', body: JSON.stringify(body) }),

  // ---- auth ----
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body: {
    firstName: string; lastName: string; email: string; password: string; confirmPassword: string;
  }) => request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  // ---- orders ----
  createOrder: (body: CreateOrderRequest) =>
    request<Order>('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
  myOrders: () => request<Order[]>('/api/orders/mine'),
};
