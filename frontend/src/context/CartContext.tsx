import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { OrderItemPayload } from '../api/types';

const CART_KEY = 'aurelia.cart';

export interface CartLine extends OrderItemPayload {
  /** Stable key for React list rendering. */
  key: string;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (item: OrderItemPayload) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => loadCart());

  const commit = useCallback((next: CartLine[]) => {
    setLines(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  }, []);

  const add = useCallback((item: OrderItemPayload) => {
    const key = `${item.itemType}-${item.itemRefId ?? item.description}`;
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      const next = existing
        ? prev.map((l) => (l.key === key ? { ...l, quantity: Math.min(99, l.quantity + item.quantity) } : l))
        : [...prev, { ...item, key }];
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((key: string) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.key !== key);
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((prev) => {
      const next = prev
        .map((l) => (l.key === key ? { ...l, quantity: Math.max(1, Math.min(99, quantity)) } : l))
        .filter((l) => l.quantity > 0);
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => commit([]), [commit]);

  const value = useMemo<CartContextValue>(() => ({
    lines,
    count: lines.reduce((sum, l) => sum + l.quantity, 0),
    subtotal: lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
    add, remove, setQuantity, clear,
  }), [lines, add, remove, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
