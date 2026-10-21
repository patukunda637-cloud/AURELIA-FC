import type { Product } from '../api/types';
import { formatMoney } from '../lib/format';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-card__media">
        {product.imagePath ? (
          <img src={`/${product.imagePath}`} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card__placeholder" aria-hidden="true" />
        )}
        {product.badge && <span className="badge badge--solid product-card__badge">{product.badge}</span>}
      </div>
      <div className="product-card__body">
        <p className="product-card__category">{product.category}</p>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__price">{formatMoney(product.price)}</p>
        <button type="button" className="btn btn--primary btn--block" onClick={() => onAdd(product)}>
          ADD TO CART
        </button>
      </div>
    </article>
  );
}
