import React from 'react';
import { X, Heart, ShoppingCart, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80';

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlist = [],
  onRemoveFromWishlist,
  onAddToCart,
  onOpenProduct,
  onClearWishlist,
  onAddAllToCart,
  lang = 'ar',
  t = {}
}) {
  if (!isOpen) return null;

  const isAr = lang === 'ar';

  const handleImageError = (e) => {
    if (e.target.src !== FALLBACK_IMG) {
      e.target.src = FALLBACK_IMG;
    }
  };

  return (
    <div className="cart-overlay animate-fade" onClick={onClose}>
      <div
        className="cart-drawer wishlist-drawer glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cart-header wishlist-header">
          <div className="cart-title-row">
            <Heart size={20} className="text-orange" fill="#ff6b00" color="#ff6b00" />
            <h3 className="cart-title">
              {isAr ? 'قائمة الأمنيات' : 'My Wishlist'}
            </h3>
            <span className="wishlist-badge-count">({wishlist.length})</span>
          </div>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Items List */}
        <div className="cart-items-list wishlist-items-list">
          {wishlist.length === 0 ? (
            <div className="cart-empty-state wishlist-empty-state">
              <div className="empty-heart-icon-box">
                <Heart size={48} className="empty-heart-icon" />
              </div>
              <h4>{isAr ? 'قائمة أمنياتك فارغة' : 'Your Wishlist is Empty'}</h4>
              <p>
                {isAr
                  ? 'لم تقم بإضافة أي قطع إلى قائمة أمنياتك بعد. اضغط على رمز القلب عند تصفح القطع لحفظها هنا.'
                  : 'You have not added any items yet. Click the heart icon while browsing to save parts for later.'}
              </p>
              <button className="btn btn-primary" onClick={onClose}>
                {isAr ? 'تصفح المتجر الآن' : 'Explore Store Now'}
              </button>
            </div>
          ) : (
            wishlist.map((product) => {
              const title = isAr ? product.name_ar : product.name_en;
              const catName = isAr ? product.category_name_ar : product.category_name_en;
              const price = parseFloat(product.price || 0).toFixed(2);
              const isOutOfStock = product.stock_quantity <= 0;

              return (
                <div key={product.id} className="cart-item-card wishlist-item-card">
                  <img
                    src={product.image_url || FALLBACK_IMG}
                    alt={title}
                    className="cart-item-img clickable"
                    onClick={() => {
                      if (onOpenProduct) {
                        onClose();
                        onOpenProduct(product);
                      }
                    }}
                    onError={handleImageError}
                  />

                  <div className="cart-item-info">
                    {catName && <span className="cart-item-cat">{catName}</span>}
                    <h4
                      className="cart-item-title clickable"
                      onClick={() => {
                        if (onOpenProduct) {
                          onClose();
                          onOpenProduct(product);
                        }
                      }}
                      title={title}
                    >
                      {title}
                    </h4>

                    <div className="wishlist-item-meta-row">
                      <div className="cart-item-price">
                        {Number(product.price).toLocaleString()} {isAr ? 'د.ع' : 'IQD'}
                      </div>
                      <span className={`bambu-stock-bullet-tag ${!isOutOfStock ? 'in' : 'out'}`}>
                        {!isOutOfStock
                          ? (isAr ? 'متوفر' : 'In Stock')
                          : (isAr ? 'نفد' : 'Out of Stock')}
                      </span>
                    </div>

                    <div className="wishlist-item-actions">
                      <button
                        type="button"
                        className="wishlist-add-cart-btn"
                        onClick={() => {
                          if (onAddToCart) {
                            onAddToCart(product);
                          }
                        }}
                        disabled={isOutOfStock}
                        title={isAr ? 'إضافة للسلة' : 'Add to Cart'}
                      >
                        <ShoppingCart size={15} />
                        <span>{isAr ? 'إضافة للسلة' : 'Add to Cart'}</span>
                      </button>

                      <button
                        type="button"
                        className="wishlist-remove-btn"
                        onClick={() => onRemoveFromWishlist && onRemoveFromWishlist(product.id)}
                        title={isAr ? 'إزالة من الأمنيات' : 'Remove from Wishlist'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {wishlist.length > 0 && (
          <div className="cart-footer wishlist-footer">
            <button
              type="button"
              className="btn btn-primary wishlist-add-all-btn"
              onClick={() => {
                if (onAddAllToCart) onAddAllToCart();
              }}
            >
              <ShoppingCart size={18} />
              <span>{isAr ? 'إضافة جميع الأمنيات إلى السلة' : 'Add All Items to Cart'}</span>
            </button>

            {onClearWishlist && (
              <button
                type="button"
                className="wishlist-clear-all-link"
                onClick={onClearWishlist}
              >
                <span>{isAr ? 'مسح قائمة الأمنيات' : 'Clear Wishlist'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
