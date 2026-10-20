import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Package, ArrowRight, ArrowLeft, Loader2, Lock, UserCheck } from 'lucide-react';
import { createOrder } from '../api';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  onClearCart,
  user,
  onOpenAuth,
  t,
  lang
}) {
  const isAr = lang === 'ar';

  const [formData, setFormData] = useState({
    customer_name: user?.name || user?.username || '',
    customer_email: user?.email || '',
    customer_phone: user?.phone && user.phone !== '-' ? user.phone : '',
    city: '',
    shipping_address: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customer_name: prev.customer_name || user.name || user.username || '',
        customer_email: prev.customer_email || user.email || '',
        customer_phone: prev.customer_phone || (user.phone && user.phone !== '-' ? user.phone : '')
      }));
    }
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const subtotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setErrorMsg(isAr ? 'عذراً، يجب تسجيل الدخول أو إنشاء حساب لإتمام الطلب' : 'Sign in or register required to place order');
      if (onOpenAuth) {
        onClose();
        onOpenAuth();
      }
      return;
    }

    if (!formData.customer_name || !formData.customer_phone || !formData.shipping_address) {
      setErrorMsg(isAr ? 'يرجى إكمال الحقول الإلزامية المطلوبة (*)' : 'Please fill in all required fields (*)');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const orderPayload = {
      ...formData,
      user_id: user.id,
      total_amount: subtotal,
      cart_items: cart.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
        product_name_ar: i.product.name_ar,
        product_name_en: i.product.name_en,
        product_image: i.product.image_url,
        unit_price: i.product.price
      })),
      items: cart.map((i) => ({
        id: i.product.id,
        product_id: i.product.id,
        quantity: i.quantity,
        product_name_ar: i.product.name_ar,
        product_name_en: i.product.name_en,
        product_image: i.product.image_url,
        unit_price: i.product.price
      }))
    };

    try {
      const result = await createOrder(orderPayload);
      setCompletedOrder(result);
      onClearCart();
    } catch (err) {
      setErrorMsg(err.message || (isAr ? 'تعذر إتمام الطلب، يرجى المحاولة مرة أخرى' : 'Failed to place order. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop animate-fade" onClick={onClose}>
      <div className="modal-container checkout-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* 1. NOT LOGGED IN SCREEN */}
        {!user ? (
          <div className="order-success-view" style={{ padding: '24px 16px', textAlign: 'center' }}>
            <div className="success-icon-box glow-orange" style={{ background: 'rgba(255, 107, 0, 0.12)', color: 'var(--orange-primary)' }}>
              <Lock size={48} />
            </div>

            <h3 className="success-title">{isAr ? 'تسجيل الدخول مطلوب لإتمام الشراء' : 'Sign In Required to Checkout'}</h3>
            <p className="success-subtitle" style={{ maxWidth: '420px', margin: '0 auto 20px', color: 'var(--text-muted)' }}>
              {isAr
                ? 'لحفظ بيانات طلبك ومتابعة تفاصيل الشحن والتوصيل، يجب أن تسجل دخولك بحسابك أو تنشئ حساباً جديداً.'
                : 'To place your order and track shipping, please sign in to your account or create a new one.'}
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth();
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <UserCheck size={18} />
                <span>{isAr ? 'تسجيل الدخول / إنشاء حساب جديد' : 'Sign In / Create Account'}</span>
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        ) : completedOrder ? (
          /* 2. SUCCESS SCREEN */
          <div className="order-success-view">
            <div className="success-icon-box glow-orange">
              <CheckCircle size={54} className="text-orange" />
            </div>

            <h3 className="success-title">{t.orderSuccess}</h3>
            <p className="success-subtitle">{t.orderSuccessMsg}</p>

            <div className="success-order-box glass-panel">
              <div className="order-num-row">
                <span>{t.orderNumber}</span>
                <span className="order-num-code">{completedOrder.order_number}</span>
              </div>
              <div className="order-num-row">
                <span>{t.customerName}:</span>
                <span>{completedOrder.customer_name || formData.customer_name}</span>
              </div>
              <div className="order-num-row">
                <span>{t.subtotal}:</span>
                <span className="text-orange font-bold">{Number(subtotal).toLocaleString()} {isAr ? 'د.ع' : 'IQD'}</span>
              </div>
            </div>

            <button className="btn btn-primary" onClick={onClose}>
              {t.continueShopping}
            </button>
          </div>
        ) : (
          /* 3. ORDER FORM FOR LOGGED IN CUSTOMER */
          <div>
            <div className="checkout-header">
              <Package size={22} className="text-orange" />
              <h3>{t.checkoutTitle}</h3>
            </div>

            {errorMsg && <div className="error-alert">{errorMsg}</div>}

            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{t.customerName} *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder={isAr ? 'مثال: أحمد محمد' : 'e.g. John Doe'}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.phone} *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    placeholder="0770 000 0000"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.email} *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    placeholder="name@example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.city} *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder={isAr ? 'بغداد / أربيل / البصرة' : 'City or Governorate'}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t.address} *</label>
                <textarea
                  rows="2"
                  required
                  className="form-textarea"
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                  placeholder={isAr ? 'اسم الشارع، المبنى، رقم الشقة أو أقرب معلم' : 'Street address, building, apartment'}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">{t.orderNotes}</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={isAr ? 'أي تعليمات للمندوب أو فني التوصيل' : 'Delivery instructions'}
                />
              </div>

              {/* Summary snippet */}
              <div className="checkout-summary-bar">
                <div>
                  <span className="summary-lbl">{t.subtotal}:</span>{' '}
                  <span className="summary-amt text-orange">{Number(subtotal).toLocaleString()} {isAr ? 'د.ع' : 'IQD'}</span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary place-order-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 size={18} className="spinner" />
                  ) : isAr ? (
                    <ArrowLeft size={18} />
                  ) : (
                    <ArrowRight size={18} />
                  )}
                  <span>{loading ? (isAr ? 'جاري الإرسال...' : 'Sending...') : t.placeOrder}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
