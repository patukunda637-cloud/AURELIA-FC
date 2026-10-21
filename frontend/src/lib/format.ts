/** Shared formatting helpers. */

export function formatMoney(value: number): string {
  return `£${value.toFixed(2)}`;
}

export function formatMoneyRange(min: number, max: number): string {
  return `£${min.toFixed(0)} – £${max.toFixed(0)}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-GB');
}

/** Formats an ISO date string as e.g. "12 August 2026". */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Lists a numbered range, e.g. 1..12 used by the goalkeeper options. */
export function range(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i + 1);
}
