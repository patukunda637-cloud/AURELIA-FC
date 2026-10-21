import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// ---------------------------------------------------------------------------
// localStorage shim.
//
// The application stores the auth token and the cart in localStorage. Under the
// Node 26 + jsdom + Vitest combination used here, jsdom's Storage object is not
// copied onto globalThis, so `localStorage` is undefined and every component
// that touches it throws during render. Rather than depend on the environment
// getting this right, provide a minimal spec-compliant Storage implementation.
// ---------------------------------------------------------------------------
if (typeof globalThis.localStorage === 'undefined') {
  class MemoryStorage implements Storage {
    private store = new Map<string, string>();

    get length(): number {
      return this.store.size;
    }

    clear(): void {
      this.store.clear();
    }

    getItem(key: string): string | null {
      return this.store.has(key) ? (this.store.get(key) as string) : null;
    }

    key(index: number): string | null {
      return Array.from(this.store.keys())[index] ?? null;
    }

    removeItem(key: string): void {
      this.store.delete(key);
    }

    setItem(key: string, value: string): void {
      this.store.set(String(key), String(value));
    }
  }

  Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  });
}

// React Testing Library does not auto-clean when globals are injected by Vitest
// in this configuration, so unmount between tests explicitly.
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
