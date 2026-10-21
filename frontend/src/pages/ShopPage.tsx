import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { Loading, ErrorState, EmptyState, StatusBanner } from '../components/States';
import { formatMoney } from '../lib/format';
import './ShopPage.css';

const FILTERS = ['All', 'Kits', 'Training', 'Accessories', 'Lifestyle'] as const;

export default function ShopPage() {
  const [category, setCategory] = useState<string>('All');
  const featured = useAsync(() => api.featuredProduct(), []);
  const products = useAsync(() => api.products(category), [category]);

  const { lines, count, subtotal, add, remove, setQuantity, clear } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = (product: { id: number; name: string; price: number }) => {
    add({
      itemType: 'Product',
      itemRefId: product.id,
      description: product.name,
      quantity: 1,
      unitPrice: product.price,
    });
  };

  const placeOrder = async () => {
    setCheckoutError(null);
    setConfirmation(null);
    setSubmitting(true);
    try {
      if (!isAuthenticated) {
        throw new ApiError(401, 'Please sign in to complete your order.');
      }
      const order = await api.createOrder({
        orderType: 'Shop',
        items: lines.map(({ itemType, itemRefId, description, quantity, unitPrice }) => ({
          itemType, itemRefId, description, quantity, unitPrice,
        })),
      });
      clear();
      setConfirmation(`Order ${order.reference} placed successfully. Total ${formatMoney(order.totalAmount)}.`);
    } catch (err) {
      setCheckoutError(err instanceof ApiError ? err.message : 'We could not place your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const featuredProduct = featured.data;
  const catalogue = products.data ?? [];

  return (
    <>
      <section className="section shop-banner-section">
        <div className="container">
          {/* Figma (shop.pdf): a single 1280x560 banner inset at x=80 with the
              category chips above it and the headline/description/SHOP NOW CTA
              overlaid on the artwork. There is no separate page-title hero. */}
          <div className="chips shop-filters" role="group" aria-label="Filter products">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={`chip${category === f ? ' chip--active' : ''}`}
                aria-pressed={category === f}
                onClick={() => setCategory(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {featuredProduct && (
            <article className="shop-banner">
              <img
                className="shop-banner__img"
                src={`/${featuredProduct.imagePath ?? 'assets/images/shop-hero-kit.jpg'}`}
                alt=""
              />
              <div className="shop-banner__overlay" aria-hidden="true" />
              <div className="shop-banner__body">
                <p className="eyebrow shop-banner__eyebrow">NEW ARRIVAL</p>
                <h1 className="shop-banner__title">{featuredProduct.name}</h1>
                {featuredProduct.description && (
                  <p className="shop-banner__desc">{featuredProduct.description}</p>
                )}
                <div className="shop-banner__actions">
                  <span className="shop-banner__price">{formatMoney(featuredProduct.price)}</span>
                  <button type="button" className="btn btn--primary" onClick={() => handleAdd(featuredProduct)}>
                    SHOP NOW
                  </button>
                </div>
              </div>
            </article>
          )}
        </div>
      </section>

      {/* ---------- Catalogue ---------- */}
      <section className="section section--surface">
        <div className="container">
          {products.loading && <Loading label="Loading products…" />}
          {products.error && <ErrorState message={products.error} onRetry={products.reload} />}
          {!products.loading && !products.error && catalogue.length === 0 && (
            <EmptyState title="No products in this category">Try a different filter.</EmptyState>
          )}

          {catalogue.length > 0 && (
            <div className="grid grid--4">
              {catalogue.map((p) => <ProductCard key={p.id} product={p} onAdd={handleAdd} />)}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Basket ---------- */}
      <section className="section" aria-label="Shopping basket">
        <div className="container">
          <div className="basket">
            <div className="basket__head">
              <h2>Your Basket</h2>
              <span className="badge badge--gold">{count} item{count === 1 ? '' : 's'}</span>
            </div>

            {confirmation && <StatusBanner tone="success">{confirmation}</StatusBanner>}
            {checkoutError && <StatusBanner tone="error">{checkoutError}</StatusBanner>}

            {lines.length === 0 ? (
              <EmptyState title="Your basket is empty">
                Add products from the store to get started.
              </EmptyState>
            ) : (
              <>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">ITEM</th>
                      <th scope="col">QTY</th>
                      <th scope="col">UNIT</th>
                      <th scope="col">TOTAL</th>
                      <th scope="col"><span className="visually-hidden">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line) => (
                      <tr key={line.key}>
                        <td className="standings__club">{line.description}</td>
                        <td>
                          <div className="qty">
                            <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(line.key, line.quantity - 1)}>−</button>
                            <span>{line.quantity}</span>
                            <button type="button" aria-label="Increase quantity" onClick={() => setQuantity(line.key, line.quantity + 1)}>+</button>
                          </div>
                        </td>
                        <td>{formatMoney(line.unitPrice)}</td>
                        <td className="gold">{formatMoney(line.unitPrice * line.quantity)}</td>
                        <td>
                          <button type="button" className="basket__remove" onClick={() => remove(line.key)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="basket__summary">
                  <div>
                    <span className="dim">Subtotal</span>
                    <strong className="basket__total">{formatMoney(subtotal)}</strong>
                  </div>
                  {isAuthenticated ? (
                    <button type="button" className="btn btn--primary" onClick={placeOrder} disabled={submitting}>
                      {submitting ? 'PLACING ORDER…' : 'PLACE ORDER'}
                    </button>
                  ) : (
                    <Link to="/signin" className="btn btn--primary">SIGN IN TO CHECKOUT</Link>
                  )}
                </div>

                {!isAuthenticated && (
                  <p className="dim basket__note">
                    Signed in as {user?.email ?? 'a guest'}? Sign in to save your order history.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
