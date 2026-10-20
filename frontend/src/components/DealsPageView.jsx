import React, { useState, useMemo, useEffect } from 'react';
import {
  Flame,
  Tag,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Percent,
  Clock,
  Filter,
  CheckCircle,
  ShoppingBag,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Building2,
  RefreshCw
} from 'lucide-react';
import ProductCard from './ProductCard';

export default function DealsPageView({
  products = [],
  categories = [],
  brands = [],
  onAddToCart,
  onOpenProduct,
  onQuickView,
  wishlistIds = [],
  onToggleWishlist,
  onBackToStore,
  lang = 'ar',
  t = {}
}) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState('discount_desc'); // discount_desc, price_asc, price_desc, newest

  // Live countdown timer for urgency (ends in ~14 hours from midnight)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter products that have deals active
  const dealProducts = useMemo(() => {
    return products.filter((p) => {
      const isMarkedDeal = Boolean(p.is_deal);
      const hasDiscountPrice = p.original_price && parseFloat(p.original_price) > parseFloat(p.price);
      const hasDiscountPct = p.deal_discount_percentage && p.deal_discount_percentage > 0;
      return isMarkedDeal || hasDiscountPrice || hasDiscountPct;
    });
  }, [products]);

  // Filter by Category and Brand
  const filteredDeals = useMemo(() => {
    return dealProducts.filter((p) => {
      if (selectedCategory && p.category && String(p.category.slug || p.category) !== selectedCategory) {
        return false;
      }
      if (selectedBrand) {
        const brandMatch = (p.compatible_brands || []).some(
          (b) => String(b.id || b.slug) === selectedBrand || String(b) === selectedBrand
        );
        if (!brandMatch) return false;
      }
      return true;
    });
  }, [dealProducts, selectedCategory, selectedBrand]);

  // Sort deals
  const sortedDeals = useMemo(() => {
    const items = [...filteredDeals];
    if (sortBy === 'discount_desc') {
      return items.sort((a, b) => {
        const discA = a.deal_discount_percentage || (a.original_price ? ((a.original_price - a.price) / a.original_price) * 100 : 0);
        const discB = b.deal_discount_percentage || (b.original_price ? ((b.original_price - b.price) / b.original_price) * 100 : 0);
        return discB - discA;
      });
    }
    if (sortBy === 'price_asc') {
      return items.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    }
    if (sortBy === 'price_desc') {
      return items.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }
    return items.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [filteredDeals, sortBy]);

  // Max discount available
  const maxDiscount = useMemo(() => {
    if (dealProducts.length === 0) return 30;
    return Math.max(
      ...dealProducts.map((p) => {
        if (p.deal_discount_percentage) return p.deal_discount_percentage;
        if (p.original_price && p.original_price > p.price) {
          return Math.round(((p.original_price - p.price) / p.original_price) * 100);
        }
        return 0;
      }),
      25
    );
  }, [dealProducts]);

  const BackIcon = lang === 'ar' ? ArrowRight : ArrowLeft;

  return (
    <div className="deals-page-container animate-fade">
      {/* 1. Deals Hero Section */}
      <section className="deals-hero-banner">
        <div className="container">
          <div className="deals-hero-content">
            {/* Top Navigation Back Link */}
            <div className="deals-hero-top-row">
              <button
                type="button"
                className="deals-back-btn"
                onClick={onBackToStore}
              >
                <BackIcon size={18} />
                <span>{lang === 'ar' ? 'الرجوع إلى المتجر الرئيسي' : 'Back to Main Store'}</span>
              </button>

              <div className="deals-live-badge">
                <span className="live-pulse-dot" />
                <span>{lang === 'ar' ? 'عروض حصرية نشطة' : 'Active Flash Deals'}</span>
              </div>
            </div>

            <div className="deals-hero-grid">
              <div className="deals-hero-text">
                <div className="deals-tag-pill">
                  <Flame size={18} className="flame-icon-fire" />
                  <span>{lang === 'ar' ? 'تخفيضات كبرى على قطع غيار طابعات 3D' : 'Mega 3D Printer Spare Parts Sale'}</span>
                </div>
                <h1 className="deals-hero-title">
                  {lang === 'ar' ? (
                    <>
                      وفر حتى <span className="highlight-orange">%{maxDiscount}</span> على أفضل قطع الغيار الأصلية
                    </>
                  ) : (
                    <>
                      Save up to <span className="highlight-orange">%{maxDiscount}</span> on Verified 3D Parts
                    </>
                  )}
                </h1>
                <p className="deals-hero-desc">
                  {lang === 'ar'
                    ? 'اغتنم فرصة التخفيضات الخاصة على النوزلات، ألواح الطباعة PEI، بكرات التغذية، ومحركات السير لأشهر الطابعات العالمية (Bambu Lab, Creality, Anycubic والمزيد).'
                    : 'Exclusive limited-time discounts on genuine toolheads, PEI build plates, extruders, motors, and accessories for top 3D printers.'}
                </p>

                {/* Live Urgency Countdown Bar */}
                <div className="deals-countdown-box">
                  <div className="countdown-label">
                    <Clock size={16} />
                    <span>{lang === 'ar' ? 'ينتهي هذا العرض الخاص خلال:' : 'Flash sale ends in:'}</span>
                  </div>
                  <div className="countdown-digits">
                    <div className="digit-unit">
                      <span className="digit-val">{String(timeLeft.hours).padStart(2, '0')}</span>
                      <span className="digit-name">{lang === 'ar' ? 'ساعة' : 'Hrs'}</span>
                    </div>
                    <span className="colon-sep">:</span>
                    <div className="digit-unit">
                      <span className="digit-val">{String(timeLeft.minutes).padStart(2, '0')}</span>
                      <span className="digit-name">{lang === 'ar' ? 'دقيقة' : 'Min'}</span>
                    </div>
                    <span className="colon-sep">:</span>
                    <div className="digit-unit">
                      <span className="digit-val">{String(timeLeft.seconds).padStart(2, '0')}</span>
                      <span className="digit-name">{lang === 'ar' ? 'ثانية' : 'Sec'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deals Highlights Cards */}
              <div className="deals-hero-perks">
                <div className="deal-perk-card">
                  <div className="perk-icon-wrap orange">
                    <Percent size={24} />
                  </div>
                  <div className="perk-info">
                    <h4>{lang === 'ar' ? 'أسعار مخفضة فورية' : 'Instant Discounts'}</h4>
                    <p>{lang === 'ar' ? 'خصم يطبق تلقائياً دون الحاجة لكوبون' : 'Applied automatically at checkout'}</p>
                  </div>
                </div>

                <div className="deal-perk-card">
                  <div className="perk-icon-wrap green">
                    <CheckCircle size={24} />
                  </div>
                  <div className="perk-info">
                    <h4>{lang === 'ar' ? 'ضمان التوافق 100%' : '100% Compatible'}</h4>
                    <p>{lang === 'ar' ? 'قطع أصلية مجربة ومطابقة للمواصفات' : 'Tested & OEM verified parts'}</p>
                  </div>
                </div>

                <div className="deal-perk-card">
                  <div className="perk-icon-wrap blue">
                    <ShoppingBag size={24} />
                  </div>
                  <div className="perk-info">
                    <h4>{lang === 'ar' ? 'شحن فوري ومتاح' : 'Ready Stock Shipping'}</h4>
                    <p>{lang === 'ar' ? 'جميع القطع المعروضة متوفرة في المستودع' : 'Ships direct from inventory'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Deals Filter & Sorting Toolbar */}
      <section className="deals-toolbar-section">
        <div className="container">
          <div className="deals-toolbar-card">
            <div className="deals-count-info">
              <span className="deals-badge-count">{sortedDeals.length}</span>
              <span className="deals-count-text">
                {lang === 'ar'
                  ? `منتج متوفر ضمن العروض والتخفيضات`
                  : `Active discounted products`}
              </span>
            </div>

            <div className="deals-filter-controls">
              {/* Category Filter */}
              <div className="deals-select-wrap">
                <Layers size={15} className="deals-select-icon" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="deals-select"
                >
                  <option value="">{lang === 'ar' ? 'جميع تصنيفات القطع' : 'All Categories'}</option>
                  {categories.map((c) => (
                    <option key={c.id || c.slug} value={c.slug}>
                      {lang === 'ar' ? c.name_ar : c.name_en}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="deals-chevron" />
              </div>

              {/* Brand Filter */}
              <div className="deals-select-wrap">
                <Building2 size={15} className="deals-select-icon" />
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="deals-select"
                >
                  <option value="">{lang === 'ar' ? 'جميع الشركات' : 'All Brands'}</option>
                  {brands.map((b) => (
                    <option key={b.id || b.slug} value={String(b.id)}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="deals-chevron" />
              </div>

              {/* Sort By */}
              <div className="deals-select-wrap sort-wrap">
                <SlidersHorizontal size={15} className="deals-select-icon" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="deals-select"
                >
                  <option value="discount_desc">{lang === 'ar' ? 'أعلى نسبة خصم %' : 'Highest Discount %'}</option>
                  <option value="price_asc">{lang === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                  <option value="price_desc">{lang === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                  <option value="newest">{lang === 'ar' ? 'الأحدث إضافة' : 'Newest First'}</option>
                </select>
                <ChevronDown size={14} className="deals-chevron" />
              </div>

              {(selectedCategory || selectedBrand) && (
                <button
                  type="button"
                  className="deals-reset-filters-btn"
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedBrand('');
                  }}
                  title={lang === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset filters'}
                >
                  <RefreshCw size={14} />
                  <span>{lang === 'ar' ? 'مسح الفلاتر' : 'Clear'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Deals Product Grid */}
      <section className="deals-products-section">
        <div className="container">
          {sortedDeals.length > 0 ? (
            <div className="products-grid deals-grid-view">
              {sortedDeals.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onOpenProduct={onOpenProduct}
                  onQuickView={onQuickView}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  lang={lang}
                  t={t}
                />
              ))}
            </div>
          ) : (
            <div className="deals-empty-state">
              <div className="empty-icon-wrap">
                <Tag size={44} />
              </div>
              <h3>
                {lang === 'ar' ? 'لا توجد عروض تطابق هذا الفلتر حالياً' : 'No deals match this filter'}
              </h3>
              <p>
                {lang === 'ar'
                  ? 'جرب اختيار تصنيف آخر أو مسح الفلاتر للاطلاع على باقي عروض المتجر المميزة.'
                  : 'Try selecting another category or clear filters to view other available discounts.'}
              </p>
              <div className="empty-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedBrand('');
                  }}
                >
                  {lang === 'ar' ? 'عرض جميع العروض المتاحة' : 'View All Active Deals'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onBackToStore}
                >
                  {lang === 'ar' ? 'الرجوع للمتجر' : 'Back to Store'}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
