import { describe, expect, it, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CartProvider, useCart } from '../context/CartContext';

/**
 * Cart maths is what the checkout total is built from. It is client-side state,
 * but the quantities it produces must stay inside the 1..99 range the server
 * enforces on POST /api/orders.
 */
const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>;

const shirt = { itemType: 'Product' as const, itemRefId: 1, description: 'Home Shirt', quantity: 1, unitPrice: 89.99 };

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts empty', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.lines).toHaveLength(0);
    expect(result.current.count).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it('merges a repeat add of the same item instead of duplicating the line', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add(shirt));
    act(() => result.current.add(shirt));

    expect(result.current.lines).toHaveLength(1);
    expect(result.current.count).toBe(2);
    expect(result.current.lines[0].quantity).toBe(2);
  });

  it('computes the subtotal from unit price and quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add({ ...shirt, quantity: 3 }));

    expect(result.current.subtotal).toBeCloseTo(89.99 * 3, 2);
  });

  it('caps an accumulated quantity at 99 to match server validation', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add({ ...shirt, quantity: 99 }));
    act(() => result.current.add({ ...shirt, quantity: 5 }));

    expect(result.current.lines[0].quantity).toBe(99);
  });

  it('clamps setQuantity into the 1..99 range', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.add(shirt));

    act(() => result.current.setQuantity(result.current.lines[0].key, 500));
    expect(result.current.lines[0].quantity).toBe(99);

    act(() => result.current.setQuantity(result.current.lines[0].key, 0));
    expect(result.current.lines[0].quantity).toBe(1);
  });

  it('removes a line and clears the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.add(shirt));

    act(() => result.current.remove(result.current.lines[0].key));
    expect(result.current.lines).toHaveLength(0);

    act(() => result.current.add(shirt));
    act(() => result.current.clear());
    expect(result.current.lines).toHaveLength(0);
    expect(localStorage.getItem('aurelia.cart')).toBe('[]');
  });

  it('persists lines to localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.add({ ...shirt, quantity: 2 }));

    const stored = JSON.parse(localStorage.getItem('aurelia.cart')!);
    expect(stored).toHaveLength(1);
    expect(stored[0].quantity).toBe(2);
  });

  it('recovers from corrupt persisted state', () => {
    localStorage.setItem('aurelia.cart', 'not json');
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.lines).toHaveLength(0);
  });
});
