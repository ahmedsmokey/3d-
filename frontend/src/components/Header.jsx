import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Globe,
  Sun,
  Moon,
  LayoutGrid,
  Heart,
  User,
  ChevronDown,
  X,
  Menu,
  Flame
} from 'lucide-react';
import UserMenuDropdown from './UserMenuDropdown';
import BrandLogo from './BrandLogo';
import ThemeSwitch from './ThemeSwitch';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80';

export default function Header({
  lang,
  setLang,
  t,
  theme,
  setTheme,
  cartCount,
  setIsCartOpen,
  searchTerm,
  setSearchTerm,
  systemStatus,
  setIsStatusModalOpen,
  currentView,
  setCurrentView,
  user,
  onOpenLogin,
  onLogout,
  products = [],
  categories = [],
  brands = [],
  printers = [],
  onQuickView,
  onSearchSubmit,
  onSelectSubnav,
  wishlistCount = 0,
  setIsWishlistOpen
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState(null);
  const searchContainerRef = useRef(null);

  const isAdmin = user?.role === 'admin' || user?.is_staff || user?.is_superuser;

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute live search suggestions (up to 5 matching items)
  const searchResults = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase().trim();
    const cleanQ = q.replace(/[\(\)\[\]]/g, ' ').replace(/\s+/g, ' ');
    const words = cleanQ.split(' ').filter(Boolean);

    return products
      .filter((p) => {
        const nameAr = (p.name_ar || '').toLowerCase();
        const nameEn = (p.name_en || '').toLowerCase();
        const sku = (p.sku || '').toLowerCase();
        const catAr = (p.category_name_ar || '').toLowerCase();
        const catEn = (p.category_name_en || '').toLowerCase();
        const haystack = `${nameAr} ${nameEn} ${sku} ${catAr} ${catEn}`;

        if (haystack.includes(q) || haystack.includes(cleanQ)) return true;
        if (words.length > 1) {
          return words.every((w) => haystack.includes(w));
        }
        return false;
      })
      .slice(0, 5);
  }, [products, searchTerm]);

  // Handle Enter key / search button click
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setIsDropdownOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit();
    } else if (currentView !== 'store') {
      setCurrentView('store');
    }
    setTimeout(() => {
      const target =
        document.querySelector('.catalog-filter-section-wrapper') ||
        document.querySelector('.catalog-toolbar') ||
        document.querySelector('.products-grid') ||
        document.querySelector('.main-container');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleSelectProduct = (prod) => {
    setIsDropdownOpen(false);
    if (onQuickView) {
      onQuickView(prod);
    }
  };

  const handleImageError = (e) => {
    if (e.target.src !== FALLBACK_IMG) {
      e.target.src = FALLBACK_IMG;
    }
  };

  return (
    <header className="header-wrapper va-styled-header">
      {/* 1. Main Navigation Bar (Styled to match Image 2) */}
      <div className="main-nav">
        <div className="container nav-content-futuristic">
          {/* Right (in RTL): Brand Logo 3D PARTS + Mobile Menu Toggle */}
          <div className="nav-brand-group">
            <button
              type="button"
              className="mobile-nav-toggle-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open mobile menu"
              title={lang === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
            >
              <Menu size={22} />
            </button>

            <div
              className="logo-clickable logo-brand-wrap"
              onClick={() => {
                setCurrentView('store');
                if (onSelectSubnav) onSelectSubnav('home');
              }}
              style={{ cursor: 'pointer' }}
              title="3D PARTS"
            >
              <BrandLogo size="md" />
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="search-bar-wrapper" ref={searchContainerRef}>
            <form className="neon-search-bar" onSubmit={handleSearchSubmit}>
              <button
                type="submit"
                className="neon-search-submit-btn"
                title={lang === 'ar' ? 'بحث' : 'Search'}
                aria-label="Search"
              >
                <Search size={18} className="neon-search-icon" />
              </button>
              <input
                type="text"
                className="neon-search-input"
                placeholder={
                  lang === 'ar'
                    ? 'ابحث عن منتج، قسم، أو ماركة...'
                    : 'Search by product, category, or brand...'
                }
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => {
                  if (searchTerm && searchTerm.trim()) setIsDropdownOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e);
                  }
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSearchTerm('');
                    setIsDropdownOpen(false);
                  }}
                  title={t.clearSearch || (lang === 'ar' ? 'مسح البحث' : 'Clear search')}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </form>

            {/* Instant Floating Suggestions Dropdown */}
            {isDropdownOpen && searchTerm && searchTerm.trim().length > 0 && (
              <div className="search-dropdown-menu animate-fade">
                {searchResults.length > 0 ? (
                  <>
                    <div className="search-dropdown-header">
                      <span>{lang === 'ar' ? 'المنتجات المطابقة:' : 'Matching Products:'}</span>
                      <span className="search-results-badge">{searchResults.length}</span>
                    </div>
                    <div className="search-dropdown-list">
                      {searchResults.map((prod) => {
                        const pTitle = lang === 'ar' ? (prod.name_ar || prod.name_en) : (prod.name_en || prod.name_ar);
                        const pCat = lang === 'ar' ? prod.category_name_ar : prod.category_name_en;
                        return (
                          <div
                            key={prod.id}
                            className="search-dropdown-item"
                            onClick={() => handleSelectProduct(prod)}
                          >
                            <img
                              src={prod.image_url || FALLBACK_IMG}
                              alt={pTitle}
                              className="search-item-thumb"
                              onError={handleImageError}
                            />
                            <div className="search-item-info">
                              <span className="search-item-title" title={pTitle}>
                                {pTitle}
                              </span>
                              <div className="search-item-meta">
                                {pCat && <span className="search-item-cat">{pCat}</span>}
                                {prod.sku && <span className="search-item-sku">{prod.sku}</span>}
                              </div>
                            </div>
                            <div className="search-item-price">
                              {Number(prod.price).toLocaleString()} {lang === 'ar' ? 'د.ع' : 'IQD'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      className="search-dropdown-footer-btn"
                      onClick={handleSearchSubmit}
                    >
                      <span>
                        {lang === 'ar'
                          ? 'عرض جميع نتائج البحث في المتجر'
                          : 'View all search results in store'}
                      </span>
                      <span className="enter-key-hint">↵ Enter</span>
                    </button>
                  </>
                ) : (
                  <div className="search-dropdown-empty">
                    <p>
                      {lang === 'ar'
                        ? `لم يتم العثور على قطع تطابق "${searchTerm}"`
                        : `No products found matching "${searchTerm}"`}
                    </p>
                    <button
                      type="button"
                      className="search-dropdown-footer-btn"
                      onClick={handleSearchSubmit}
                    >
                      <span>{lang === 'ar' ? 'البحث في المتجر على أي حال' : 'Search anyway'}</span>
                      <span className="enter-key-hint">↵ Enter</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Left: Action Controls */}
          <div className="nav-actions-futuristic">
            {/* Dashboard button (Admin only) */}
            {isAdmin && (
              <button
                className="nav-admin-pill-btn"
                onClick={() => {
                  if (currentView === 'admin') {
                    setCurrentView('store');
                  } else {
                    setCurrentView('admin');
                  }
                }}
                title={
                  currentView === 'admin'
                    ? lang === 'ar'
                      ? 'الرجوع للمتجر'
                      : 'Back to Store'
                    : lang === 'ar'
                    ? 'لوحة التحكم'
                    : 'Dashboard'
                }
              >
                <LayoutGrid size={16} />
                <span className="nav-admin-btn-text">
                  {currentView === 'admin'
                    ? lang === 'ar'
                      ? 'المتجر الرئيسي'
                      : 'View Store'
                    : lang === 'ar'
                    ? 'لوحة التحكم'
                    : 'Dashboard'}
                </span>
              </button>
            )}

            {/* Commerce & User Actions Group */}
            <div className="nav-action-group">
              {/* Wishlist / Heart Button */}
              <button
                className="nav-icon-btn wishlist-icon-btn"
                title={lang === 'ar' ? 'قائمة الأمنيات' : 'Wishlist'}
                onClick={() => setIsWishlistOpen && setIsWishlistOpen(true)}
              >
                <Heart
                  size={18}
                  fill={wishlistCount > 0 ? '#ff6b00' : 'none'}
                  color={wishlistCount > 0 ? '#ff6b00' : 'currentColor'}
                />
                {wishlistCount > 0 && (
                  <span className="orange-wishlist-badge">{wishlistCount}</span>
                )}
              </button>

              {/* Shopping Cart Button */}
              <button
                className="nav-icon-btn cart-icon-btn"
                onClick={() => {
                  if (setCurrentView) {
                    setCurrentView('cart');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    setIsCartOpen(true);
                  }
                }}
                title={t.cartTitle || 'Cart'}
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && <span className="orange-cart-badge">{cartCount}</span>}
              </button>

              {/* User / Account Button */}
              {user ? (
                <UserMenuDropdown
                  user={user}
                  onLogout={onLogout}
                  onOpenAdmin={() => setCurrentView('admin')}
                  onOpenAccount={() => setCurrentView('account')}
                  lang={lang}
                  compact={true}
                />
              ) : (
                <button
                  className="nav-icon-btn user-icon-btn"
                  onClick={onOpenLogin}
                  title={lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                >
                  <User size={18} />
                </button>
              )}
            </div>

            {/* Subtle Divider */}
            <span className="nav-actions-divider" />

            {/* Settings & Utilities Group */}
            <div className="nav-action-group">
              {/* Language Switcher Pill */}
              <button
                className="nav-lang-pill"
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                title={t.switchLang || 'Switch Language'}
              >
                <Globe size={15} />
                <span className="lang-text">{lang === 'ar' ? 'EN' : 'عربي'}</span>
              </button>

              {/* Day / Night Theme Switch */}
              <ThemeSwitch
                theme={theme}
                setTheme={setTheme}
                size="16px"
                title={theme === 'dark' ? t.lightMode : t.darkMode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation Bar */}
      <nav className="sub-nav-bar">
        <div className="container sub-nav-content">
          <div className="sub-nav-links">
            {/* 1. الرئيسية */}
            <button
              type="button"
              className={`sub-nav-link ${currentView === 'store' ? 'is-active' : ''}`}
              onClick={() => onSelectSubnav && onSelectSubnav('home')}
            >
              <span>{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
            </button>

            {/* 2. الشركات المصنعة ˅ */}
            <div className="sub-nav-dropdown-wrap">
              <button
                type="button"
                className="sub-nav-link dropdown-trigger-btn"
                onClick={() => {
                  if (window.innerWidth <= 768) {
                    setIsMobileMenuOpen(true);
                    setMobileAccordion('brands');
                  } else {
                    onSelectSubnav && onSelectSubnav('brands');
                  }
                }}
              >
                <span>{lang === 'ar' ? 'الشركات المصنعة' : 'Manufacturers'}</span>
                <ChevronDown size={14} className="chevron-icon" />
              </button>
              <div className="sub-nav-menu-dropdown custom-styled-scrollbar">
                <button
                  type="button"
                  className="sub-drop-item"
                  onClick={() => onSelectSubnav && onSelectSubnav('brands')}
                >
                  <strong>{lang === 'ar' ? 'جميع الشركات المصنعة' : 'All Manufacturers'}</strong>
                </button>
                {brands.map((b) => (
                  <button
                    key={b.id || b.slug}
                    type="button"
                    className="sub-drop-item"
                    onClick={() => onSelectSubnav && onSelectSubnav(`brand_${b.id}`)}
                  >
                    <span>{b.name}</span>
                    {b.products_count !== undefined && (
                      <span className="sub-drop-count">({b.products_count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. موديلات الطابعات ˅ */}
            <div className="sub-nav-dropdown-wrap">
              <button
                type="button"
                className="sub-nav-link dropdown-trigger-btn"
                onClick={() => {
                  if (window.innerWidth <= 768) {
                    setIsMobileMenuOpen(true);
                    setMobileAccordion('printers');
                  } else {
                    onSelectSubnav && onSelectSubnav('printers');
                  }
                }}
              >
                <span>{lang === 'ar' ? 'موديلات الطابعات' : 'Printer Models'}</span>
                <ChevronDown size={14} className="chevron-icon" />
              </button>
              <div className="sub-nav-menu-dropdown custom-styled-scrollbar">
                <button
                  type="button"
                  className="sub-drop-item"
                  onClick={() => onSelectSubnav && onSelectSubnav('printers')}
                >
                  <strong>{lang === 'ar' ? 'جميع موديلات الطابعات' : 'All Printer Models'}</strong>
                </button>
                {printers.map((p) => (
                  <button
                    key={p.id || p.slug}
                    type="button"
                    className="sub-drop-item"
                    onClick={() => onSelectSubnav && onSelectSubnav(`printer_${p.slug}`)}
                  >
                    <span>{p.name}</span>
                    {p.products_count !== undefined && (
                      <span className="sub-drop-count">({p.products_count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. تصنيفات قطع الغيار ˅ */}
            <div className="sub-nav-dropdown-wrap">
              <button
                type="button"
                className="sub-nav-link dropdown-trigger-btn"
                onClick={() => {
                  if (window.innerWidth <= 768) {
                    setIsMobileMenuOpen(true);
                    setMobileAccordion('categories');
                  } else {
                    onSelectSubnav && onSelectSubnav('categories');
                  }
                }}
              >
                <span>{lang === 'ar' ? 'تصنيفات قطع الغيار' : 'Parts Categories'}</span>
                <ChevronDown size={14} className="chevron-icon" />
              </button>
              <div className="sub-nav-menu-dropdown custom-styled-scrollbar">
                <button
                  type="button"
                  className="sub-drop-item"
                  onClick={() => onSelectSubnav && onSelectSubnav('categories')}
                >
                  <strong>{lang === 'ar' ? 'جميع تصنيفات القطع' : 'All Categories'}</strong>
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id || c.slug}
                    type="button"
                    className="sub-drop-item"
                    onClick={() => onSelectSubnav && onSelectSubnav(`category_${c.slug}`)}
                  >
                    <span>{lang === 'ar' ? c.name_ar : c.name_en}</span>
                    {c.products_count !== undefined && (
                      <span className="sub-drop-count">({c.products_count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. العروض (Highlighted in Orange with Lucide Flame Icon) */}
            <button
              type="button"
              className={`sub-nav-link text-deals-orange ${currentView === 'deals' ? 'is-active-deal' : ''}`}
              onClick={() => onSelectSubnav && onSelectSubnav('deals')}
            >
              <Flame size={15} className="sub-nav-flame-icon" />
              <span>{lang === 'ar' ? 'العروض' : 'Deals'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 3. Mobile Slide-in Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-portal">
          <div
            className="mobile-drawer-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="mobile-drawer-container">
            {/* Drawer Header */}
            <div className="mobile-drawer-header">
              <div
                className="drawer-logo-wrap"
                onClick={() => {
                  setCurrentView('store');
                  if (onSelectSubnav) onSelectSubnav('home');
                  setIsMobileMenuOpen(false);
                }}
              >
                <BrandLogo size="sm" />
              </div>
              <button
                type="button"
                className="mobile-drawer-close-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="mobile-drawer-body custom-styled-scrollbar">
              {/* User Account / Login Card */}
              <div className="mobile-drawer-user-card">
                {user ? (
                  <div className="drawer-user-info">
                    <div className="drawer-user-avatar">
                      <User size={20} />
                    </div>
                    <div className="drawer-user-meta">
                      <span className="drawer-user-name">
                        {user.name || user.username || (lang === 'ar' ? 'حسابي' : 'My Account')}
                      </span>
                      {user.email && <span className="drawer-user-email">{user.email}</span>}
                    </div>
                    <button
                      type="button"
                      className="drawer-logout-btn"
                      onClick={() => {
                        onLogout && onLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      title={lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                    >
                      {lang === 'ar' ? 'خروج' : 'Logout'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="drawer-signin-btn"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenLogin && onOpenLogin();
                    }}
                  >
                    <User size={18} />
                    <span>{lang === 'ar' ? 'تسجيل الدخول / حساب جديد' : 'Sign In / Register'}</span>
                  </button>
                )}
              </div>

              {/* Prominent Dashboard / Store Button (Admin only) */}
              {isAdmin && (
                <button
                  type="button"
                  className="drawer-action-pill highlight-dashboard"
                  onClick={() => {
                    setCurrentView(currentView === 'admin' ? 'store' : 'admin');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LayoutGrid size={18} />
                  <span>
                    {currentView === 'admin'
                      ? (lang === 'ar' ? 'الرجوع للمتجر الرئيسي' : 'Back to Store')
                      : (lang === 'ar' ? 'لوحة التحكم والإدارة' : 'Admin Dashboard')}
                  </span>
                </button>
              )}

              {/* Navigation Items */}
              <div className="mobile-drawer-nav-sections">
                {/* 1. الرئيسية */}
                <button
                  type="button"
                  className="drawer-nav-item"
                  onClick={() => {
                    setCurrentView('store');
                    if (onSelectSubnav) onSelectSubnav('home');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-nav-label">
                    {lang === 'ar' ? 'الصفحة الرئيسية' : 'Home'}
                  </span>
                </button>

                {/* 2. العروض والتخفيضات */}
                <button
                  type="button"
                  className="drawer-nav-item item-deals"
                  onClick={() => {
                    if (onSelectSubnav) onSelectSubnav('deals');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-nav-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Flame size={16} className="text-orange" />
                    <span>{lang === 'ar' ? 'العروض والتخفيضات' : 'Deals & Offers'}</span>
                  </span>
                  <span className="drawer-badge-sale">
                    {lang === 'ar' ? 'خصومات حصرية' : 'SALE'}
                  </span>
                </button>

                {/* 3. الشركات المصنعة Accordion */}
                <div className="drawer-accordion-group">
                  <button
                    type="button"
                    className={`drawer-accordion-toggle ${mobileAccordion === 'brands' ? 'is-open' : ''}`}
                    onClick={() => setMobileAccordion(mobileAccordion === 'brands' ? null : 'brands')}
                  >
                    <span className="drawer-nav-label">
                      {lang === 'ar' ? 'الشركات المصنعة' : 'Manufacturers'}
                    </span>
                    <span className="drawer-toggle-right">
                      <span className="drawer-item-count">{brands.length}</span>
                      <ChevronDown
                        size={16}
                        className={`drawer-chevron ${mobileAccordion === 'brands' ? 'rotate-180' : ''}`}
                      />
                    </span>
                  </button>
                  {mobileAccordion === 'brands' && (
                    <div className="drawer-accordion-content animate-fade">
                      <button
                        type="button"
                        className="drawer-subitem is-all"
                        onClick={() => {
                          if (onSelectSubnav) onSelectSubnav('brands');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {lang === 'ar' ? 'جميع الشركات المصنعة' : 'All Manufacturers'}
                      </button>
                      {brands.map((b) => (
                        <button
                          key={b.id || b.slug}
                          type="button"
                          className="drawer-subitem"
                          onClick={() => {
                            if (onSelectSubnav) onSelectSubnav(`brand_${b.id}`);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <span>{b.name}</span>
                          {b.products_count !== undefined && (
                            <span className="drawer-subcount">({b.products_count})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. موديلات الطابعات Accordion */}
                <div className="drawer-accordion-group">
                  <button
                    type="button"
                    className={`drawer-accordion-toggle ${mobileAccordion === 'printers' ? 'is-open' : ''}`}
                    onClick={() => setMobileAccordion(mobileAccordion === 'printers' ? null : 'printers')}
                  >
                    <span className="drawer-nav-label">
                      {lang === 'ar' ? 'موديلات الطابعات' : 'Printer Models'}
                    </span>
                    <span className="drawer-toggle-right">
                      <span className="drawer-item-count">{printers.length}</span>
                      <ChevronDown
                        size={16}
                        className={`drawer-chevron ${mobileAccordion === 'printers' ? 'rotate-180' : ''}`}
                      />
                    </span>
                  </button>
                  {mobileAccordion === 'printers' && (
                    <div className="drawer-accordion-content animate-fade">
                      <button
                        type="button"
                        className="drawer-subitem is-all"
                        onClick={() => {
                          if (onSelectSubnav) onSelectSubnav('printers');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {lang === 'ar' ? 'جميع موديلات الطابعات' : 'All Printer Models'}
                      </button>
                      {printers.map((p) => (
                        <button
                          key={p.id || p.slug}
                          type="button"
                          className="drawer-subitem"
                          onClick={() => {
                            if (onSelectSubnav) onSelectSubnav(`printer_${p.slug}`);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <span>{p.name}</span>
                          {p.products_count !== undefined && (
                            <span className="drawer-subcount">({p.products_count})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. تصنيفات قطع الغيار Accordion */}
                <div className="drawer-accordion-group">
                  <button
                    type="button"
                    className={`drawer-accordion-toggle ${mobileAccordion === 'categories' ? 'is-open' : ''}`}
                    onClick={() => setMobileAccordion(mobileAccordion === 'categories' ? null : 'categories')}
                  >
                    <span className="drawer-nav-label">
                      {lang === 'ar' ? 'تصنيفات قطع الغيار' : 'Parts Categories'}
                    </span>
                    <span className="drawer-toggle-right">
                      <span className="drawer-item-count">{categories.length}</span>
                      <ChevronDown
                        size={16}
                        className={`drawer-chevron ${mobileAccordion === 'categories' ? 'rotate-180' : ''}`}
                      />
                    </span>
                  </button>
                  {mobileAccordion === 'categories' && (
                    <div className="drawer-accordion-content animate-fade">
                      <button
                        type="button"
                        className="drawer-subitem is-all"
                        onClick={() => {
                          if (onSelectSubnav) onSelectSubnav('categories');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {lang === 'ar' ? 'جميع تصنيفات القطع' : 'All Categories'}
                      </button>
                      {categories.map((c) => (
                        <button
                          key={c.id || c.slug}
                          type="button"
                          className="drawer-subitem"
                          onClick={() => {
                            if (onSelectSubnav) onSelectSubnav(`category_${c.slug}`);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <span>{lang === 'ar' ? c.name_ar : c.name_en}</span>
                          {c.products_count !== undefined && (
                            <span className="drawer-subcount">({c.products_count})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer: Theme & Language */}
            <div className="mobile-drawer-footer">
              <button
                type="button"
                className="drawer-footer-btn"
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              >
                <Globe size={16} />
                <span>{lang === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
              </button>
              <div className="drawer-footer-btn drawer-footer-switch">
                <span>{theme === 'dark' ? (lang === 'ar' ? 'الوضع الليلي' : 'Dark Mode') : (lang === 'ar' ? 'الوضع النهاري' : 'Light Mode')}</span>
                <ThemeSwitch
                  theme={theme}
                  setTheme={setTheme}
                  size="14.5px"
                  title={theme === 'dark' ? t.lightMode : t.darkMode}
                />
              </div>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
