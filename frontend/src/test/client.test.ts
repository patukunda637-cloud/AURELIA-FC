import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ApiError, api, getToken, setToken } from '../api/client';

/**
 * The API client is the single choke point between the UI and the backend, so
 * its error normalisation (ProblemDetails -> field errors) is worth locking down.
 */
function mockFetch(response: Partial<Response> & { jsonBody?: unknown }) {
  const { jsonBody, ...rest } = response;
  const body = jsonBody === undefined ? '' : JSON.stringify(jsonBody);
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: rest.status ? rest.status! < 400 : true,
    status: rest.status ?? 200,
    text: async () => body,
    ...rest,
  } as Response);
}

describe('api client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('prefixes requests with the stored bearer token', async () => {
    setToken('abc.def.ghi');
    const fetchSpy = mockFetch({ status: 200, jsonBody: { clubName: 'Aurelia FC' } });

    await api.club();

    const [, init] = fetchSpy.mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(headers.get('Authorization')).toBe('Bearer abc.def.ghi');
    expect(headers.get('Content-Type')).toBeNull(); // GET must not set a body type
  });

  it('omits the Authorization header when signed out', async () => {
    const fetchSpy = mockFetch({ status: 200, jsonBody: [] });

    await api.teams();

    const [, init] = fetchSpy.mock.calls[0];
    expect(new Headers(init?.headers).get('Authorization')).toBeNull();
  });

  it('normalises PascalCase ProblemDetails field errors to camelCase', async () => {
    mockFetch({
      status: 400,
      jsonBody: {
        title: 'One or more validation errors occurred.',
        errors: { Password: ['Password must be 8+ characters.'] },
      },
    });

    const error = await api.login({ email: 'a@b.com', password: 'x' }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.fieldErrors.password).toBe('Password must be 8+ characters.');
  });

  it('surfaces the ProblemDetails detail as the error message', async () => {
    mockFetch({ status: 401, jsonBody: { title: 'Invalid credentials', detail: 'The email or password is incorrect.' } });

    const error = await api.login({ email: 'a@b.com', password: 'x' }).catch((e) => e);

    expect(error.message).toBe('The email or password is incorrect.');
  });

  it('maps a network failure to status 0 with a friendly message', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    const error = await api.club().catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/unable to reach/i);
  });

  it('encodes search and category filters into the query string', async () => {
    const fetchSpy = mockFetch({ status: 200, jsonBody: [] });

    await api.players({ teamId: 3, position: 'Forward', search: 'Ada Lovelace' });
    // URLSearchParams uses form encoding, so a space becomes "+" not "%20".
    expect(fetchSpy.mock.calls[0][0]).toBe('/api/players?teamId=3&position=Forward&search=Ada+Lovelace');

    // "All" is a UI sentinel and must not be sent to the API.
    await api.products('All');
    expect(fetchSpy.mock.calls[1][0]).toBe('/api/shop/products');

    await api.news('Match Report');
    // api.news builds its query with encodeURIComponent, so the space becomes %20.
    expect(fetchSpy.mock.calls[2][0]).toBe(`/api/news?category=${encodeURIComponent('Match Report')}`);
  });

  it('clears the token on sign-out', () => {
    setToken('abc.def.ghi');
    expect(getToken()).toBe('abc.def.ghi');
    setToken(null);
    expect(getToken()).toBeNull();
  });

  it('treats 204 No Content as an empty success', async () => {
    mockFetch({ status: 204 });
    await expect(api.myOrders()).resolves.toBeUndefined();
  });
});
