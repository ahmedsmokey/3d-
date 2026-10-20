import React, { useState } from 'react';
import { X, Star, ShoppingCart, ShieldCheck, Check, Cpu, CheckCircle } from 'lucide-react';

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  t,
  lang
}) {
  const [qty, setQty] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) return null;

  const title = lang === 'ar' ? product.name_ar : product.name_en;

  const handleAdd = () => {
    onAddToCart(product, qty);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  return (
    <div className="modal-backdrop animate-fade" onClick={onClose}>
      <div className="modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-grid">
          {/* Left Media */}
          <div className="modal-media-col">
            <img src={product.image_url} alt={title} className="modal-img" />
            <div className="modal-badges-bar">
              <span className="badge badge-orange">SKU: {product.sku}</span>
              {product.is_universal ? (
                <span className="badge badge-amber">{t.universalBadge}</span>
              ) : (
                <span className="badge badge-green">
                  <ShieldCheck size={14} />
                  {t.verifiedCompatible}
                </span>
              )}
            </div>
          </div>

          {/* Right Info */}
          <div className="modal-info-col">
            <span className="modal-category">
              {lang === 'ar' ? product.category_name_ar : product.category_name_en}
            </span>

            <h2 className="modal-title">{title}</h2>

            <div className="modal-meta-row">
              <div className="rating-box">
                <Star size={16} className="star-filled" />
                <span className="rating-score">{product.rating}</span>
                <span className="rating-count">({product.reviews_count} تقييم)</span>
              </div>
              <span className="stock-indicator in-stock">
                <span className="stock-dot"></span>
                {t.inStock} ({product.stock_quantity})
              </span>
            </div>

            <div className="modal-price-box" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <div className="current-price modal-price">
                {Number(product.price).toLocaleString()} {lang === 'ar' ? 'د.ع' : 'IQD'}
              </div>
              {product.original_price && (
                <div className="original-price modal-orig-price">
                  {Number(product.original_price).toLocaleString()} {lang === 'ar' ? 'د.ع' : 'IQD'}
                </div>
              )}
            </div>

            {/* Technical Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="modal-specs-section">
                <h4 className="specs-heading">
                  <Cpu size={16} className="text-orange" />
                  {t.specifications}
                </h4>
                <div className="specs-table">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="specs-row">
                      <span className="specs-key">{key}:</span>
                      <span className="specs-val">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compatible Printers */}
            {product.compatible_printers_list && product.compatible_printers_list.length > 0 && (
              <div className="modal-compat-section">
                <h4 className="specs-heading">
                  <CheckCircle size={16} className="text-orange" />
                  {t.compatibleModels}
                </h4>
                <div className="modal-printer-tags">
                  {product.compatible_printers_list.map((pr, idx) => (
                    <span key={idx} className="modal-printer-pill">
                      {pr}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add Button */}
            <div className="modal-action-row">
              <div className="qty-picker">
                <button
                  className="qty-btn"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                >
                  -
                </button>
                <span className="qty-value">{qty}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQty(Math.min(product.stock_quantity, qty + 1))}
                  disabled={qty >= product.stock_quantity}
                >
                  +
                </button>
              </div>

              <button
                className={`btn btn-primary modal-add-btn ${addedAnimation ? 'btn-success' : ''}`}
                onClick={handleAdd}
              >
                {addedAnimation ? <Check size={18} /> : <ShoppingCart size={18} />}
                <span>{addedAnimation ? (lang === 'ar' ? 'تمت الإضافة للسلة!' : 'Added to Cart!') : t.addToCart}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
