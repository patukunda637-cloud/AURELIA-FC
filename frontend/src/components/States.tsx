import type { ReactNode } from 'react';

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <div className="spinner" />
      <p className="muted" style={{ margin: 0 }}>{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state state--error" role="alert">
      <h3 className="state__title">Something went wrong</h3>
      <p style={{ marginBottom: onRetry ? 20 : 0 }}>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--gold-outline" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'Nothing to show yet', children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="state">
      <h3 className="state__title">{title}</h3>
      {children && <p style={{ margin: 0 }}>{children}</p>}
    </div>
  );
}

export function StatusBanner({
  tone, children,
}: { tone: 'success' | 'error' | 'info'; children: ReactNode }) {
  const palette = {
    success: { border: 'rgba(34,197,94,0.45)', color: '#86efac' },
    error: { border: 'rgba(239,68,68,0.45)', color: '#fca5a5' },
    info: { border: 'rgba(251,191,36,0.45)', color: 'var(--accent-light)' },
  }[tone];

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      style={{
        border: `1px solid ${palette.border}`,
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius)',
        padding: '16px 20px',
        marginBottom: 24,
        color: palette.color,
      }}
    >
      {children}
    </div>
  );
}
