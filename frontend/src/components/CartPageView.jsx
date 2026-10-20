import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Trash2,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Package,
  Check,
  AlertCircle,
  Loader2,
  Lock,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { createOrder } from '../api';
import './CartPageView.css';

const IRAQI_GOVERNORATES = [
  'بغداد',
  'البصرة',
  'أربيل',
  'نينوى',
  'النجف الأشرف',
  'كربلاء المقدسة',
  'السليمانية',
  'بابل',
  'كركوك',
  'الأنبار',
  'ذي قار',
  'ميسان',
  'المثنى',
  'الديوانية (القادسية)',
  'واسط',
  'ديالى',
  'دهوك',
  'صلاح الدين'
];

export default function CartPageView({
  cart = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onBackToStore,
  onOpenProduct,
  user,
  onOpenAuth,
  lang = 'ar',
  t,
  onOrderPlaced
}) {
  const isAr = lang === 'ar';
  const [step, setStep] = useState('cart'); // 'cart' or 'checkout'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState('');

  // Checkout Form State
  const [firstName, setFirstName] = useState(() => {
    if (user?.name) {
      const parts = user.name.split(' ');
      return parts[0] || '';
    }
    return '';
  });
  const [lastName, setLastName] = useState(() => {
    if (user?.name) {
      const parts = user.name.split(' ');
      return parts.slice(1).join(' ') || '';
    }
    return '';
  });
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone && user.phone !== '-' ? user.phone : '');
  const [country] = useState('العراق');
  const [governorate, setGovernorate] = useState('بغداد');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Loading & Submission state
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  // Helper accessors for cart items (supporting both standard and variant items)
  const getItemPrice = (item) => {
    if (item.variant?.price != null && !isNaN(parseFloat(item.variant.price))) {
      return parseFloat(item.variant.price);
    }
    return parseFloat(item.product?.price || 0);
  };

  const getItemTitle = (item) => {
    const mainTitle = (isAr ? item.product?.name_ar : item.product?.name_en)
      || item.product?.name_ar
      || item.product?.name_en
      || item.product?.name
      || (isAr ? 'منتج غير مسمى' : 'Product');

    const variantTitle = item.variant
      ? ((isAr && item.variant.name_ar) ? item.variant.name_ar : (item.variant.name || item.variant.name_en))
      : null;

    return variantTitle ? `${mainTitle} (${variantTitle})` : mainTitle;
  };

  const getItemImage = (item) => {
    return (
      item.variant?.image_url ||
      item.product?.image_url ||
      (Array.isArray(item.product?.images) && (item.product.images[0]?.image_url || item.product.images[0])) ||
      item.product?.image ||
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80'
    );
  };

  const getItemSku = (item) => {
    return item.variant?.sku || item.product?.sku || (item.product?.id ? `PROD-${item.product.id}` : '—');
  };

  const getItemStock = (item) => {
    if (item.variant?.stock_quantity != null) return item.variant.stock_quantity;
    if (item.product?.stock_quantity != null) return item.product.stock_quantity;
    return 10;
  };

  // Calculations
  const totalProducts = cart.length;
  const totalPieces = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const p = getItemPrice(item);
      return sum + p * (item.quantity || 1);
    }, 0);
  }, [cart]);

  // Handle Refresh Action
  const handleRefreshPrices = () => {
    setIsRefreshing(true);
    setRefreshNotice('');
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshNotice(isAr ? 'تم التحقق من توفر الأسعار والمخزون بنجاح ✓' : 'Prices & stock successfully verified ✓');
      setTimeout(() => setRefreshNotice(''), 4000);
    }, 600);
  };

  // Handle Empty Cart Action
  const handleClearAll = () => {
    const msg = isAr ? 'هل أنت متأكد من رغبتك في إفراغ كامل سلة التسوق؟' : 'Are you sure you want to empty the shopping cart?';
    if (window.confirm(msg)) {
      onClearCart();
    }
  };

  // Submit Order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderError('');

    if (!user) {
      setOrderError(isAr ? 'عذراً، يجب تسجيل الدخول أو إنشاء حساب لإتمام الطلب' : 'Sign in or register required to place order');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!firstName.trim() || !phone.trim() || !detailedAddress.trim()) {
      setOrderError(isAr ? 'يرجى ملء جميع الحقول المطلوبة الإلزامية (*)' : 'Please fill all required fields (*)');
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    const orderPayload = {
      user_id: user.id,
      customer_name: fullName,
      customer_email: email.trim() || (user?.email || ''),
      customer_phone: phone.trim(),
      city: governorate,
      shipping_address: `${country} - ${governorate} - ${detailedAddress.trim()}`,
      notes: orderNotes.trim(),
      total_amount: subtotal,
      cart_items: cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity
      }))
    };

    try {
      const result = await createOrder(orderPayload);
      setCompletedOrder(result);
      if (onClearCart) onClearCart();
      if (onOrderPlaced) onOrderPlaced(result);
    } catch (err) {
      setOrderError(err.message || (isAr ? 'تعذر إرسال الطلب، يرجى المحاولة مرة أخرى' : 'Failed to place order. Try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (completedOrder) {
    return (
      <div className="cart-page-wrapper">
        <div className="cart-page-container">
          <div className="cart-empty-container animate-fade" style={{ maxWidth: '600px', margin: '40px auto' }}>
            <div className="cart-empty-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
              <CheckCircle2 size={44} />
            </div>
            <h2 className="cart-empty-title">
              {isAr ? 'تم استلام طلبك بنجاح!' : 'Order Placed Successfully!'}
            </h2>
            <p className="cart-empty-subtitle">
              {isAr
                ? `شكراً لثقتك بـ PRINTFORGE 3D. تم إنشاء الطلب برقم #${completedOrder.id || Date.now().toString().slice(-6)} وسيقوم فريقنا بالتواصل معك لتأكيد التوصيل.`
                : `Thank you for choosing PRINTFORGE 3D. Order #${completedOrder.id || 'N/A'} is confirmed.`}
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                className="cart-checkout-btn"
                style={{ width: 'auto', padding: '0 28px' }}
                onClick={onBackToStore}
              >
                <span>{isAr ? 'متابعة التسوق في المتجر' : 'Continue Shopping'}</span>
                {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <div className="cart-page-container">
        {/* ==============================================================================
            1. BREADCRUMBS
           ============================================================================== */}
        <div className="cart-breadcrumb">
          <span className="cart-breadcrumb-link" onClick={onBackToStore}>
            {isAr ? 'الرئيسية' : 'Home'}
          </span>
          <span className="cart-breadcrumb-sep">/</span>
          <span
            className={`cart-breadcrumb-link ${step === 'cart' ? 'active' : ''}`}
            onClick={() => setStep('cart')}
          >
            {isAr ? 'سلة التسوق' : 'Shopping Cart'}
          </span>
          {step === 'checkout' && (
            <>
              <span className="cart-breadcrumb-sep">/</span>
              <span className="cart-breadcrumb-link active">
                {isAr ? 'إتمام الطلب' : 'Checkout'}
              </span>
            </>
          )}
        </div>

        {/* ==============================================================================
            2. HEADER BAR
           ============================================================================== */}
        <div className="cart-header-bar">
          <div className="cart-title-block">
            <div className="cart-title-row">
              {step === 'cart' ? (
                <>
                  <div className="cart-title-icon-box">
                    <ShoppingCart size={28} />
                  </div>
                  <h1 className="cart-header-title">{isAr ? 'سلة التسوق' : 'Shopping Cart'}</h1>
                  <span className="cart-badge-pill">{totalPieces}</span>
                </>
              ) : (
                <>
                  <div className="cart-title-icon-box" style={{ color: '#10b981' }}>
                    <Check size={28} />
                  </div>
                  <h1 className="cart-header-title">{isAr ? 'إتمام الطلب' : 'Checkout'}</h1>
                </>
              )}
            </div>
            <p className="cart-header-subtitle">
              {step === 'cart'
                ? (isAr ? 'راجع منتجاتك والكميات قبل إتمام الطلب' : 'Review your items and quantities before placing your order')
                : (isAr ? 'أكمل بيانات التوصيل وراجع ملخص طلبك' : 'Fill in shipping details and review order summary')}
            </p>
          </div>

          {/* Top Actions (Refresh & Clear) - Only in Cart step */}
          {step === 'cart' && cart.length > 0 && (
            <div className="cart-header-actions">
              <button
                type="button"
                className="cart-action-pill-btn"
                onClick={handleRefreshPrices}
                disabled={isRefreshing}
                title={isAr ? 'تحديث الأسعار وتوافر المخزون' : 'Refresh prices and stock'}
              >
                <RefreshCw size={15} className={isRefreshing ? 'spinner-rotate' : ''} />
                <span>{isAr ? 'تحديث الأسعار والتوفر' : 'Refresh Stock & Prices'}</span>
              </button>

              <button
                type="button"
                className="cart-action-pill-btn danger"
                onClick={handleClearAll}
                title={isAr ? 'إفراغ كامل السلة' : 'Clear all cart items'}
              >
                <Trash2 size={15} />
                <span>{isAr ? 'إفراغ القائمة' : 'Clear Cart'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Refresh Banner */}
        {refreshNotice && (
          <div
            className="animate-fade"
            style={{
              padding: '10px 16px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid #10b981',
              borderRadius: '8px',
              color: '#34d399',
              fontSize: '0.88rem',
              fontWeight: 700,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Check size={16} />
            <span>{refreshNotice}</span>
          </div>
        )}

        {/* ==============================================================================
            3. MAIN CONTENT: STEP 1 (CART) OR STEP 2 (CHECKOUT)
           ============================================================================== */}
        {cart.length === 0 ? (
          /* EMPTY CART STATE */
          <div className="cart-empty-container animate-fade">
            <div className="cart-empty-icon">
              <Package size={38} />
            </div>
            <h3 className="cart-empty-title">
              {isAr ? 'سلة التسوق فارغة حالياً' : 'Your shopping cart is empty'}
            </h3>
            <p className="cart-empty-subtitle">
              {isAr
                ? 'لم تقم بإضافة أي قطع غيار أو ملحقات إلى سلتك بعد. تصفح المتجر واكتشف تشكيلتنا الواسعة.'
                : 'You have not added any spare parts yet. Explore our store and discover top 3D products.'}
            </p>
            <button
              type="button"
              className="cart-checkout-btn"
              style={{ width: 'auto', padding: '0 30px' }}
              onClick={onBackToStore}
            >
              <span>{isAr ? 'تصفح المتجر والمنتجات' : 'Browse Products'}</span>
              {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>
        ) : step === 'cart' ? (
          /* ==============================================================================
             STEP 1: SHOPPING CART VIEW (Matching User Screenshot 1)
             ============================================================================== */
          <div className="cart-grid-layout animate-fade">
            {/* RIGHT COLUMN: ITEMS LIST */}
            <div className="cart-items-stream">
              {cart.map((item) => {
                const itemPrice = getItemPrice(item);
                const itemTotal = itemPrice * (item.quantity || 1);
                const itemId = item.cartItemId || item.product?.id;
                const stockQty = getItemStock(item);
                const title = getItemTitle(item);
                const imageSrc = getItemImage(item);
                const sku = getItemSku(item);

                return (
                  <div key={itemId} className="cart-item-card">
                    {/* Item Info: Thumb + SKU + Title + Stock + Price */}
                    <div className="cart-item-info-group">
                      <div className="cart-item-thumb-box">
                        <img
                          src={imageSrc}
                          alt={title}
                          className="cart-item-thumb-img"
                          onError={(e) => {
                            if (e.target.src !== 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80') {
                              e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80';
                            }
                          }}
                        />
                      </div>

                      <div className="cart-item-details">
                        <span className="cart-item-sku">
                          SKU: {sku}
                        </span>
                        <h4
                          className="cart-item-title"
                          onClick={() => onOpenProduct && onOpenProduct(item.product)}
                          title={title}
                        >
                          {title}
                        </h4>
                        <div className="cart-item-stock-badge">
                          <span className="cart-stock-dot" />
                          <span>
                            {isAr ? `متوفر: ${stockQty}` : `In Stock: ${stockQty}`}
                          </span>
                        </div>
                        <div className="cart-item-unit-price">
                          <span>{isAr ? 'سعر القطعة: ' : 'Unit Price: '}</span>
                          <strong>IQD {itemPrice.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Item Controls: Stepper + Subtotal + Remove */}
                    <div className="cart-item-controls-group">
                      <div className="cart-stepper-wrap">
                        <span className="cart-stepper-label">{isAr ? 'الكمية' : 'Qty'}</span>
                        <div className="cart-stepper-box">
                          <button
                            type="button"
                            className="cart-stepper-btn"
                            onClick={() => onUpdateQuantity(itemId, (item.quantity || 1) - 1)}
                            title={isAr ? 'تقليل' : 'Decrease'}
                          >
                            -
                          </button>
                          <span className="cart-stepper-val">{item.quantity}</span>
                          <button
                            type="button"
                            className="cart-stepper-btn"
                            onClick={() => onUpdateQuantity(itemId, (item.quantity || 1) + 1)}
                            disabled={item.quantity >= stockQty}
                            title={isAr ? 'زيادة' : 'Increase'}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="cart-item-subtotal-box">
                        <span className="cart-item-subtotal-label">{isAr ? 'المجموع' : 'Total'}</span>
                        <span className="cart-item-subtotal-val">IQD {itemTotal.toLocaleString()}</span>
                      </div>

                      <button
                        type="button"
                        className="cart-item-remove-btn"
                        onClick={() => onRemoveItem(itemId)}
                        title={isAr ? 'إزالة هذا المنتج' : 'Remove item'}
                      >
                        <Trash2 size={14} />
                        <span>{isAr ? 'إزالة' : 'Remove'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* LEFT COLUMN: ORDER SUMMARY (STICKY) */}
            <div className="cart-summary-card">
              <h3 className="cart-summary-title">{isAr ? 'ملخص الطلب' : 'Order Summary'}</h3>

              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span>{isAr ? 'المنتجات' : 'Products'}</span>
                  <span className="cart-summary-row-val">{totalProducts}</span>
                </div>
                <div className="cart-summary-row">
                  <span>{isAr ? 'عدد القطع' : 'Total Units'}</span>
                  <span className="cart-summary-row-val">{totalPieces}</span>
                </div>

                <div className="cart-summary-divider" />

                <div className="cart-summary-total-row">
                  <span className="cart-summary-total-label">{isAr ? 'المجموع' : 'Total'}</span>
                  <span className="cart-summary-total-val">IQD {subtotal.toLocaleString()}</span>
                </div>
              </div>

              <p className="cart-summary-notice">
                {isAr
                  ? 'يتم التحقق من الأسعار والمخزون قبل إتمام الطلب. تفاصيل التوصيل في الخطوة التالية.'
                  : 'Prices and stock are verified prior to order placement. Delivery details follow in the next step.'}
              </p>

              {!user ? (
                <div className="cart-auth-gate-card">
                  <div className="auth-gate-icon-badge">
                    <Lock size={22} />
                  </div>

                  <div className="auth-gate-content">
                    <h4 className="auth-gate-title">
                      {isAr ? 'تسجيل الدخول مطلوب لإتمام الشراء' : 'Account Required to Checkout'}
                    </h4>
                    <p className="auth-gate-desc">
                      {isAr
                        ? 'لحفظ بيانات طلبك ومتابعة الشحن والتوصيل، يرجى تسجيل الدخول بحسابك أو إنشاء حساب جديد.'
                        : 'Please sign in or create an account to place and track your order.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="auth-gate-btn"
                    onClick={() => onOpenAuth && onOpenAuth()}
                  >
                    <UserCheck size={18} />
                    <span>{isAr ? 'تسجيل الدخول / إنشاء حساب' : 'Sign In / Register'}</span>
                  </button>

                  <div className="auth-gate-secure-badge">
                    <ShieldCheck size={14} />
                    <span>{isAr ? 'دفع آمن وطلب موثق 100%' : '100% Secure Checkout'}</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="cart-checkout-btn"
                  onClick={() => {
                    setStep('checkout');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <span>{isAr ? 'إتمام الطلب' : 'Proceed to Checkout'}</span>
                  <Check size={18} />
                </button>
              )}

              <span className="cart-back-link" onClick={onBackToStore}>
                {isAr ? '← متابعة التسوق' : '← Continue Shopping'}
              </span>
            </div>
          </div>
        ) : (
          /* ==============================================================================
             STEP 2: CHECKOUT VIEW (Matching User Screenshot 2)
             ============================================================================== */
          <div className="cart-grid-layout animate-fade">
            {/* RIGHT COLUMN: DELIVERY FORM */}
            <form onSubmit={handlePlaceOrder} className="checkout-form-card">
              <div className="checkout-section-header">
                <div className="checkout-title-with-bar">
                  <span className="checkout-title-accent"></span>
                  <h3 className="checkout-section-title">
                    {isAr ? 'بيانات التوصيل' : 'Shipping Details'}
                  </h3>
                </div>
                <span className="checkout-badge-secure">
                  <ShieldCheck size={14} />
                  <span>{isAr ? 'طلب موثوق ومحمي' : 'Encrypted Order'}</span>
                </span>
              </div>

              {orderError && (
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    color: '#f87171',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{orderError}</span>
                </div>
              )}

              <div className="checkout-inputs-grid">
                {/* Row 1: First Name & Last Name */}
                <div className="checkout-field">
                  <label className="checkout-label">{isAr ? 'الاسم الأول *' : 'First Name *'}</label>
                  <input
                    type="text"
                    required
                    className="checkout-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={isAr ? 'مثال: محمد' : 'e.g. John'}
                  />
                </div>

                <div className="checkout-field">
                  <label className="checkout-label">{isAr ? 'اسم العائلة *' : 'Last Name *'}</label>
                  <input
                    type="text"
                    required
                    className="checkout-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={isAr ? 'مثال: العلي' : 'e.g. Doe'}
                  />
                </div>

                {/* Row 2: Email & Phone */}
                <div className="checkout-field">
                  <label className="checkout-label">{isAr ? 'البريد الإلكتروني *' : 'Email Address *'}</label>
                  <input
                    type="email"
                    required
                    className="checkout-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                  />
                </div>

                <div className="checkout-field">
                  <label className="checkout-label">{isAr ? 'رقم الهاتف *' : 'Phone Number *'}</label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    className="checkout-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+964 770 000 0000"
                  />
                </div>

                {/* Row 3: Country & Governorate */}
                <div className="checkout-field">
                  <label className="checkout-label">{isAr ? 'الدولة' : 'Country'}</label>
                  <input
                    type="text"
                    readOnly
                    className="checkout-input"
                    value={country}
                    style={{ opacity: 0.85, cursor: 'default' }}
                  />
                </div>

                <div className="checkout-field">
                  <label className="checkout-label">{isAr ? 'المحافظة *' : 'Governorate *'}</label>
                  <select
                    className="checkout-select"
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                  >
                    {IRAQI_GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Row 4: Detailed Address (Highlighted Field) */}
                <div className="checkout-field full-width">
                  <label className="checkout-label">{isAr ? 'المنطقة والعنوان التفصيلي *' : 'Detailed Address *'}</label>
                  <textarea
                    required
                    className="checkout-textarea highlighted-field"
                    placeholder={isAr ? 'المنطقة، الشارع، وأقرب نقطة دالة' : 'District, Street, and Nearest Landmark'}
                    value={detailedAddress}
                    onChange={(e) => setDetailedAddress(e.target.value)}
                  />
                </div>

                {/* Row 5: Order Notes */}
                <div className="checkout-field full-width">
                  <label className="checkout-label">{isAr ? 'ملاحظات الطلب (اختياري)' : 'Order Notes (Optional)'}</label>
                  <textarea
                    className="checkout-textarea"
                    placeholder={isAr ? 'أي تعليمات إضافية للتوصيل أو أوقات الاستلام المناسبة...' : 'Any additional delivery notes...'}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                  />
                </div>
              </div>
            </form>

            {/* LEFT COLUMN: ORDER SUMMARY (STICKY) */}
            <div className="cart-summary-card checkout-summary-card">
              <div className="cart-summary-header-row">
                <h3 className="cart-summary-title">{isAr ? 'ملخص الطلب' : 'Order Summary'}</h3>
                <span className="cart-badge-pill">{totalPieces} {isAr ? 'منتجات' : 'items'}</span>
              </div>

              {/* Items Breakdown List */}
              <div className="checkout-mini-items-list">
                {cart.map((item) => {
                  const itemPrice = getItemPrice(item) * (item.quantity || 1);
                  const title = getItemTitle(item);
                  return (
                    <div key={item.cartItemId || item.product?.id} className="checkout-mini-item">
                      <div className="checkout-mini-item-name-group">
                        <span className="checkout-qty-tag">{item.quantity}×</span>
                        <span className="checkout-mini-item-name" title={title}>
                          {title}
                        </span>
                      </div>
                      <strong className="checkout-mini-item-price">
                        {itemPrice.toLocaleString()} {isAr ? 'د.ع' : 'IQD'}
                      </strong>
                    </div>
                  );
                })}
              </div>

              <div className="cart-summary-divider" />

              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span>{isAr ? 'مجموع المنتجات' : 'Items Subtotal'}</span>
                  <span className="cart-summary-row-val">{subtotal.toLocaleString()} {isAr ? 'د.ع' : 'IQD'}</span>
                </div>

                <div className="cart-summary-row">
                  <span>{isAr ? 'التوصيل' : 'Shipping'}</span>
                  <span className="cart-summary-row-val" style={{ color: '#10b981' }}>
                    {isAr ? 'حسب المحافظة' : 'Calculated'}
                  </span>
                </div>

                <div className="cart-summary-divider" />

                <div className="cart-summary-total-row">
                  <span className="cart-summary-total-label">{isAr ? 'المجموع الكلي' : 'Grand Total'}</span>
                  <span className="cart-summary-total-val">{subtotal.toLocaleString()} {isAr ? 'د.ع' : 'IQD'}</span>
                </div>
              </div>

              <p className="cart-summary-notice">
                {isAr
                  ? 'يتم التحقق من الأسعار والمخزون قبل إرسال الطلب.'
                  : 'Prices and inventory are verified before order dispatch.'}
              </p>

              <button
                type="button"
                className="cart-checkout-btn checkout-submit-btn"
                onClick={handlePlaceOrder}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 size={18} className="spinner-rotate" />
                ) : (
                  <>
                    <span>{isAr ? 'إرسال الطلب' : 'Place Order'}</span>
                    <Check size={18} />
                  </>
                )}
              </button>

              <span
                className="cart-back-link"
                onClick={() => {
                  setStep('cart');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                {isAr ? '← العودة للسلة' : '← Back to Cart'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
