import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Truck, Lock, UserCheck } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onOpenCheckout,
  user,
  onOpenAuth,
  t,
  lang
}) {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.variant?.price != null ? parseFloat(item.variant.price) : parseFloat(item.product.price);
    return sum + itemPrice * item.quantity;
  }, 0);

  const freeShippingThreshold = 50000;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="cart-overlay animate-fade" onClick={onClose}>
      <div className="cart-drawer glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header">
          <div className="cart-title-row">
            <ShoppingBag size={20} className="text-orange" />
            <h3 className="cart-title">{t.cartTitle}</h3>
            <span className="cart-items-count">({cart.length})</span>
          </div>
          <button className="cart-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="shipping-progress-box">
          <div className="shipping-progress-label">
            <Truck size={15} className="text-orange" />
            <span>
              {subtotal >= freeShippingThreshold
                ? (lang === 'ar' ? '🎉 حصلت على شحن سريع مجاني!' : '🎉 Qualified for Free Express Shipping!')
                : (lang === 'ar'
                    ? `أضف بقيمة ${Number(freeShippingThreshold - subtotal).toLocaleString()} د.ع إضافية للشحن المجاني`
                    : `Add ${Number(freeShippingThreshold - subtotal).toLocaleString()} IQD more for Free Shipping`)}
            </span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Items List */}
        <div className="cart-items-list">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <ShoppingBag size={48} className="empty-icon" />
              <h4>{t.cartEmpty}</h4>
              <p>{t.cartEmptySub}</p>
              <button className="btn btn-primary" onClick={onClose}>
                {t.continueShopping}
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const title = lang === 'ar' ? item.product.name_ar : item.product.name_en;
              const variantName = item.variant
                ? (lang === 'ar' && item.variant.name_ar ? item.variant.name_ar : item.variant.name)
                : null;
              const itemPrice = item.variant?.price != null ? parseFloat(item.variant.price) : parseFloat(item.product.price);
              const itemId = item.cartItemId || item.product.id;

              return (
                <div key={itemId} className="cart-item-card">
                  <img
                    src={item.variant?.image_url || item.product.image_url}
                    alt={title}
                    className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <h5 className="cart-item-title">
                      {title}
                      {variantName && (
                        <span className="cart-variant-badge"> | {variantName}</span>
                      )}
                    </h5>
                    <span className="cart-item-sku">SKU: {item.product.sku}</span>
                    <div className="cart-item-price">
                      {Number(itemPrice).toLocaleString()} {lang === 'ar' ? 'د.ع' : 'IQD'}
                    </div>

                    <div className="cart-item-controls">
                      <div className="qty-picker-small">
                        <button
                          className="qty-btn-sm"
                          onClick={() => onUpdateQty(itemId, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="qty-val-sm">{item.quantity}</span>
                        <button
                          className="qty-btn-sm"
                          onClick={() => onUpdateQty(itemId, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock_quantity}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="remove-btn"
                        onClick={() => onRemoveItem(itemId)}
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-row">
              <span>{t.subtotal}</span>
              <span className="summary-val">{Number(subtotal).toLocaleString()} {lang === 'ar' ? 'د.ع' : 'IQD'}</span>
            </div>
            <div className="cart-summary-row">
              <span>{t.shipping}</span>
              <span className="summary-val text-green">
                {subtotal >= freeShippingThreshold ? t.shippingFree : (lang === 'ar' ? '5,000 د.ع' : '5,000 IQD')}
              </span>
            </div>

            {!user && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                background: 'rgba(255, 107, 0, 0.08)',
                border: '1px solid rgba(255, 107, 0, 0.28)',
                borderRadius: '10px',
                fontSize: '0.82rem',
                color: 'var(--orange-primary)',
                fontWeight: 700,
                marginTop: '10px',
                marginBottom: '10px'
              }}>
                <Lock size={15} style={{ flexShrink: 0 }} />
                <span>{lang === 'ar' ? 'يجب تسجيل الدخول بحسابك لإتمام الشراء' : 'Account required to checkout'}</span>
              </div>
            )}

            <button
              className="btn btn-primary checkout-btn"
              onClick={() => {
                onClose();
                if (!user) {
                  if (onOpenAuth) onOpenAuth();
                } else {
                  onOpenCheckout();
                }
              }}
            >
              <span>{user ? t.checkout : (lang === 'ar' ? 'تسجيل الدخول لإتمام الطلب' : 'Sign In to Checkout')}</span>
              {user ? (
                lang === 'ar' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />
              ) : (
                <UserCheck size={18} />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
