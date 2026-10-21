import { useMemo } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import PageHero from '../components/PageHero';
import { Loading, ErrorState, EmptyState } from '../components/States';
import { formatMoney as formatCurrency, formatDate } from '../lib/format';
import './AccountPage.css';

const STATUS_TONE: Record<string, string> = {
  Paid: 'badge--gold',
  Confirmed: 'badge--gold',
  Pending: 'badge--muted',
  Cancelled: 'badge--muted',
  Refunded: 'badge--muted',
};

export default function AccountPage() {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  // Only fetch order history once we know who the user is; an anonymous visit is
  // redirected below, so firing the request would just produce a wasted 401.
  const orders = useAsync(() => api.myOrders(), [user?.userId], isAuthenticated && user !== null);

  const stats = useMemo(() => {
    const list = orders.data ?? [];
    const spend = list.reduce((sum, o) => sum + o.totalAmount, 0);
    const tickets = list
      .flatMap((o) => o.items)
      .filter((i) => i.itemType === 'MatchTicket' || i.itemType === 'SeasonTicket')
      .reduce((sum, i) => sum + i.quantity, 0);
    return { count: list.length, spend, tickets };
  }, [orders.data]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/signin" replace />;
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  const onSignOut = () => {
    signOut();
    navigate('/', { replace: true });
  };

  return (
    <>
      {/* The Account screen is not part of the 16 Figma frames, so it reuses the
          established PageHero treatment without borrowing another screen's artwork. */}
      <PageHero
        eyebrow="Membership Portal"
        title={`Welcome back, ${user.firstName}`}
        subtitle="Track your orders, tickets and account details in one place."
        compact
      />

      <section className="section">
        <div className="container account-grid">
          {/* ---------- Profile ---------- */}
          <aside className="account-side">
            <div className="account-identity">
              <span className="account-avatar" aria-hidden="true">{initials}</span>
              <h2>{user.firstName} {user.lastName}</h2>
              <p className="muted account-email">{user.email}</p>
              <span className="badge badge--gold">
                {user.role === 'Admin' ? 'Club Administrator' : 'Member'}
              </span>
            </div>

            <dl className="account-stats">
              <div>
                <dt>Orders</dt>
                <dd>{orders.loading ? '—' : stats.count}</dd>
              </div>
              <div>
                <dt>Tickets</dt>
                <dd>{orders.loading ? '—' : stats.tickets}</dd>
              </div>
              <div>
                <dt>Total Spent</dt>
                <dd>{orders.loading ? '—' : formatCurrency(stats.spend)}</dd>
              </div>
            </dl>

            <div className="account-actions">
              <Link to="/shop" className="btn btn--primary btn--block">Visit Shop</Link>
              <Link to="/tickets" className="btn btn--ghost btn--block">Buy Tickets</Link>
              <button type="button" className="btn btn--ghost btn--block" onClick={onSignOut}>
                Sign Out
              </button>
            </div>
          </aside>

          {/* ---------- Orders ---------- */}
          <div className="account-main">
            <div className="section-head">
              <div>
                <p className="eyebrow">Purchase History</p>
                <h2 className="section-title">Your Orders</h2>
              </div>
              <Link to="/shop" className="auth-card__link">Order again →</Link>
            </div>

            {orders.loading && <Loading label="Loading your orders…" />}
            {orders.error && <ErrorState message={orders.error} onRetry={orders.reload} />}

            {!orders.loading && !orders.error && (orders.data ?? []).length === 0 && (
              <EmptyState title="No orders yet">
                Anything you buy from the shop or box office will appear here. <Link to="/shop" className="gold">Start shopping</Link>.
              </EmptyState>
            )}

            {!orders.loading && !orders.error && (orders.data ?? []).length > 0 && (
              <div className="order-list">
                {(orders.data ?? []).map((order) => (
                  <article key={order.id} className="order-card">
                    <header className="order-card__head">
                      <div>
                        <h3>{order.reference}</h3>
                        <p className="dim">{order.orderType} order · {formatDate(order.createdAt)}</p>
                      </div>
                      <div className="order-card__right">
                        <span className={`badge ${STATUS_TONE[order.status] ?? 'badge--muted'}`}>{order.status}</span>
                        <strong className="order-card__total">{formatCurrency(order.totalAmount)}</strong>
                      </div>
                    </header>

                    <ul className="order-card__items">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          <span>{item.description}</span>
                          <span className="dim">
                            {item.quantity} × {formatCurrency(item.unitPrice)}
                          </span>
                          <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
