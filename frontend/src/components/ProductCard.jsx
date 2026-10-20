import React from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';

export default function ProductCard({
  product,
  onAddToCart,
  onOpenProduct,
  onQuickView,
  isWishlisted = false,
  onToggleWishlist,
  t,
  lang
}) {
  const handleSelect = onOpenProduct || onQuickView;

  const numPrice = Number(product.price) || 0;
  const numOrigPrice = Number(product.original_price) || 0;
  const hasDiscount = numOrigPrice > numPrice;

  const discountPercent = hasDiscount
    ? Math.round(((numOrigPrice - numPrice) / numOrigPrice) * 100)
    : (product.is_deal && product.deal_discount_percentage > 0 ? Math.round(Number(product.deal_discount_percentage)) : null);

  const title = lang === 'ar' ? product.name_ar : product.name_en;

  const handleImageError = (e) => {
    if (e.target.src !== FALLBACK_IMG) {
      e.target.src = FALLBACK_IMG;
    }
  };

  return (
    <div
      className="bambu-product-card"
      onClick={() => handleSelect && handleSelect(product)}
    >
      {/* Top Image Stage */}
      <div className="bambu-card-image-wrap">
        <img
          src={product.image_url || FALLBACK_IMG}
          alt={title}
          className="bambu-card-img"
          loading="lazy"
          onError={handleImageError}
        />

        {/* Badges */}
        {(hasDiscount || product.is_deal) && (
          <div className="bambu-card-badges">
            {discountPercent ? (
              <span
                className={`bambu-badge-sale ${product.is_deal ? 'deal-glow-badge' : ''}`}
                dir="ltr"
              >
                -{discountPercent}%
              </span>
            ) : product.is_deal ? (
              <span className="bambu-badge-sale deal-glow-badge">
                {lang === 'ar' ? 'تخفيض' : 'Sale'}
              </span>
            ) : null}
          </div>
        )}

        {/* Wishlist Heart Button (Replaces Quick View Preview) */}
        <button
          type="button"
          className={`bambu-card-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist && onToggleWishlist(product);
          }}
          title={isWishlisted ? (lang === 'ar' ? 'إزالة من قائمة الأمنيات' : 'Remove from Wishlist') : (lang === 'ar' ? 'إضافة إلى قائمة الأمنيات' : 'Add to Wishlist')}
          aria-label="Wishlist"
        >
          <Heart
            size={18}
            fill={isWishlisted ? '#ff6b00' : 'none'}
            color={isWishlisted ? '#ff6b00' : 'currentColor'}
          />
        </button>
      </div>

      {/* Card Content */}
      <div className="bambu-card-content">
        {/* Category & SKU */}
        <div className="bambu-card-meta">
          <span className="bambu-card-category">
            {lang === 'ar' ? product.category_name_ar : product.category_name_en}
          </span>
          <span className="bambu-card-sku">{product.sku}</span>
        </div>

        {/* Title */}
        <h3 className="bambu-card-title" title={title}>
          {title}
        </h3>

        {/* Compatible Printers */}
        {product.compatible_printers_list && product.compatible_printers_list.length > 0 && (
          <div className="bambu-card-compat-tags">
            {product.compatible_printers_list.slice(0, 3).map((pr, idx) => (
              <span key={idx} className="bambu-compat-tag">
                {pr}
              </span>
            ))}
          </div>
        )}

        {/* Rating & Stock */}
        <div className="bambu-card-rating-stock">
          <div className="bambu-rating">
            <Star size={13} className="bambu-star-filled" />
            <span className="bambu-score">{product.rating}</span>
            <span className="bambu-review-count">({product.reviews_count})</span>
          </div>

          <span className={`bambu-stock-tag ${product.stock_quantity > 0 ? 'in' : 'out'}`}>
            <span className="bambu-stock-bullet"></span>
            {product.stock_quantity > 0 ? t.inStock : t.outOfStock}
          </span>
        </div>

        {/* Price & Add to Cart */}
        <div className="bambu-card-bottom-row">
          <div className="bambu-card-pricing" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {hasDiscount && (
              <div className="bambu-card-orig-price-wrap">
                <span className="bambu-card-orig-price">
                  {numOrigPrice.toLocaleString()} {lang === 'ar' ? 'د.ع' : 'IQD'}
                </span>
                {discountPercent && (
                  <span className="bambu-micro-discount-badge" dir="ltr">
                    -{discountPercent}%
                  </span>
                )}
              </div>
            )}
            <div className="bambu-card-price-wrap">
              <span className="bambu-card-price">
                {numPrice.toLocaleString()}
              </span>
              <span className="bambu-card-currency">
                {lang === 'ar' ? 'د.ع' : 'IQD'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="bambu-card-add-btn"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={product.stock_quantity <= 0}
            title={t.addToCart}
          >
            <ShoppingCart size={15} />
            <span>{t.addToCart}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
