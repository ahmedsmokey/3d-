import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import ProductCard from './components/ProductCard';
import ProductPageView from './components/ProductPageView';
import DealsPageView from './components/DealsPageView';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import CheckoutModal from './components/CheckoutModal';
import SystemStatusModal from './components/SystemStatusModal';
import AdminDashboard from './components/AdminDashboard';
import CustomerAccountView from './components/CustomerAccountView';
import CartPageView from './components/CartPageView';
import AuthModal from './components/AuthModal';
import BrandLogo from './components/BrandLogo';
import ScrollToTop from './components/ScrollToTop';
import { translations } from './translations';
import {
  fetchProducts,
  fetchCategories,
  fetchBrands,
  fetchPrinters,
  fetchSystemStatus,
  fetchBanners,
  logoutUser
} from './api';
import {
  ShieldCheck,
  Zap,
  RotateCcw,
  SlidersHorizontal,
  Award,
  Sparkles,
  X
} from 'lucide-react';
import './App.css';

export default function App() {
  const [lang, setLang] = useState('ar');
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('printforge_theme_v2');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      return 'light';
    } catch {
      return 'light';
    }
  });
  const [currentView, setCurrentView] = useState('store'); // 'store' or 'admin'
  const t = translations[lang];

  // Auth User State (persisted in localStorage)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('printforge_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [banners, setBanners] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterDimension, setFilterDimension] = useState('categories');

  const handleSelectSubnav = (target) => {
    setCurrentView('store');
    if (target === 'home') {
      resetAllFilters();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'brands') {
      setSelectedBrand('');
      setTimeout(() => {
        const el = document.querySelector('.catalog-toolbar') || document.querySelector('.products-grid');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else if (target.startsWith('brand_')) {
      const bId = target.replace('brand_', '');
      setSelectedBrand(bId);
      setTimeout(() => {
        const el = document.querySelector('.catalog-toolbar') || document.querySelector('.products-grid');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else if (target === 'categories') {
      setSelectedCategory('');
      setTimeout(() => {
        const el = document.querySelector('.catalog-toolbar') || document.querySelector('.products-grid');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else if (target.startsWith('category_')) {
      const cSlug = target.replace('category_', '');
      setSelectedCategory(cSlug);
      setTimeout(() => {
        const el = document.querySelector('.catalog-toolbar') || document.querySelector('.products-grid');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else if (target === 'printers') {
      setSelectedPrinter('');
      setTimeout(() => {
        const el = document.querySelector('.catalog-toolbar') || document.querySelector('.products-grid');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else if (target.startsWith('printer_')) {
      const prSlug = target.replace('printer_', '');
      setSelectedPrinter(prSlug);
      setTimeout(() => {
        const el = document.querySelector('.catalog-toolbar') || document.querySelector('.products-grid');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else if (target === 'deals') {
      setCurrentView('deals');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // UI state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('printforge_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('printforge_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const handleOpenProduct = (prod) => {
    setSelectedProduct(prod);
    setCurrentView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync language direction
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Sync theme and persist in localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('printforge_theme_v2', theme);
      localStorage.setItem('printforge_theme', theme);
    } catch (e) {
      console.warn('LocalStorage theme error:', e);
    }
  }, [theme]);

  // Sync user to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('printforge_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('printforge_user');
    }
  }, [user]);

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('printforge_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [cart]);

  // Sync wishlist to local storage
  useEffect(() => {
    try {
      localStorage.setItem('printforge_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('LocalStorage wishlist error:', e);
    }
  }, [wishlist]);

  // Initial data load
  useEffect(() => {
    async function initData() {
      setLoading(true);
      const [cats, brs, prs, stat, bans] = await Promise.all([
        fetchCategories(),
        fetchBrands(),
        fetchPrinters(),
        fetchSystemStatus(),
        fetchBanners()
      ]);
      setCategories(cats);
      setBrands(brs);
      setPrinters(prs);
      setSystemStatus(stat);
      setBanners(bans || []);
      setLoading(false);
    }
    initData();
  }, []);

  // Fetch / filter products
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const filterParams = {
        category: selectedCategory,
        brand: selectedBrand ? brands.find((b) => String(b.id) === String(selectedBrand))?.slug : '',
        printer: selectedPrinter,
        search: searchTerm,
        sort: sortBy
      };
      const prods = await fetchProducts(filterParams);
      setProducts(prods);
      setLoading(false);
    }
    const timer = setTimeout(loadProducts, 200);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedBrand, selectedPrinter, searchTerm, sortBy, brands]);

  // Handle Logout
  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setCurrentView('store');
  };

  // Cart actions
  const handleAddToCart = (product, quantity = 1, selectedVariant = null) => {
    setCart((prev) => {
      const variantKey = selectedVariant ? (selectedVariant.id || selectedVariant.name) : null;
      const existing = prev.find(
        (item) =>
          item.product.id === product.id &&
          (item.variant ? (item.variant.id || item.variant.name) : null) === variantKey
      );
      if (existing) {
        return prev.map((item) =>
          item === existing
            ? { ...item, quantity: Math.min(product.stock_quantity, item.quantity + quantity) }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity,
          variant: selectedVariant,
          cartItemId: `${product.id}_${variantKey || 'std'}`
        }
      ];
    });
  };

  const handleUpdateQty = (cartItemIdOrProductId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(cartItemIdOrProductId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemIdOrProductId || item.product.id === cartItemIdOrProductId
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const handleRemoveItem = (cartItemIdOrProductId) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          item.cartItemId !== cartItemIdOrProductId && item.product.id !== cartItemIdOrProductId
      )
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Wishlist actions
  const handleToggleWishlist = (product) => {
    if (!product) return;
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleRemoveFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleClearWishlist = () => {
    setWishlist([]);
  };

  const handleAddAllWishlistToCart = () => {
    wishlist.forEach((item) => {
      if (item.stock_quantity > 0) {
        handleAddToCart(item);
      }
    });
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  const resetAllFilters = () => {
    setSelectedBrand('');
    setSelectedPrinter('');
    setSelectedCategory('');
    setSearchTerm('');
    setSortBy('newest');
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-layout">
      {/* Top Header */}
      <Header
        lang={lang}
        setLang={setLang}
        t={t}
        theme={theme}
        setTheme={setTheme}
        cartCount={cartTotalItems}
        setIsCartOpen={setIsCartOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        systemStatus={systemStatus}
        setIsStatusModalOpen={setIsStatusModalOpen}
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        products={products}
        categories={categories}
        brands={brands}
        printers={printers}
        onQuickView={handleOpenProduct}
        onSelectSubnav={handleSelectSubnav}
        wishlistCount={wishlist.length}
        setIsWishlistOpen={setIsWishlistOpen}
        onSearchSubmit={() => {
          setSelectedCategory('');
          setSelectedBrand('');
          setSelectedPrinter('');
          setCurrentView('store');
        }}
      />

      {/* VIEW 1: CUSTOM ADMIN DASHBOARD */}
      {currentView === 'admin' ? (
        <AdminDashboard
          lang={lang}
          t={t}
          banners={banners}
          onBackToStore={() => setCurrentView('store')}
          onCategoriesUpdated={(cats) => setCategories(cats)}
          onBrandsUpdated={(brs) => setBrands(brs)}
          onPrintersUpdated={(prs) => setPrinters(prs)}
          onProductsUpdated={(prods) => setProducts(prods)}
          onBannersUpdated={(newBanners) => setBanners(newBanners)}
        />
      ) : currentView === 'account' ? (
        /* VIEW 1.8: DEDICATED CUSTOMER ACCOUNT PROFILE VIEW */
        <CustomerAccountView
          user={user}
          onUserUpdate={(updated) => {
            setUser(updated);
            try {
              localStorage.setItem('printforge_user', JSON.stringify(updated));
            } catch (e) {
              console.warn(e);
            }
          }}
          onLogout={handleLogout}
          onOpenAdmin={() => setCurrentView('admin')}
          onBackToStore={() => {
            setCurrentView('store');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateToDeals={() => {
            setCurrentView('deals');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          wishlist={wishlist}
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onAddToCart={handleAddToCart}
          lang={lang}
        />
      ) : currentView === 'cart' ? (
        /* VIEW 1.4: DEDICATED SHOPPING CART & CHECKOUT PAGE */
        <CartPageView
          cart={cart}
          onUpdateQuantity={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onBackToStore={() => {
            setCurrentView('store');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenProduct={handleOpenProduct}
          user={user}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          lang={lang}
          t={t}
        />
      ) : currentView === 'deals' ? (
        /* VIEW 1.5: DEDICATED DEALS & OFFERS PAGE */
        <DealsPageView
          products={products}
          categories={categories}
          brands={brands}
          onAddToCart={handleAddToCart}
          onOpenProduct={handleOpenProduct}
          onQuickView={handleOpenProduct}
          wishlistIds={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onBackToStore={() => {
            setCurrentView('store');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          lang={lang}
          t={t}
        />
      ) : currentView === 'product' && selectedProduct ? (
        /* VIEW 2: DEDICATED FULL PRODUCT PAGE */
        <ProductPageView
          product={selectedProduct}
          allProducts={products}
          onBackToStore={() => setCurrentView('store')}
          onAddToCart={handleAddToCart}
          onOpenCheckout={() => {
            if (!user) {
              setIsAuthModalOpen(true);
            } else {
              setIsCartOpen(false);
              setIsCheckoutOpen(true);
            }
          }}
          onSelectProduct={handleOpenProduct}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          lang={lang}
          t={t}
        />
      ) : (
        /* VIEW 3: CUSTOMER STOREFRONT */
        <>
          {/* Full-width Hero Product Slider */}
          <HeroSlider
            banners={banners}
            products={products}
            lang={lang}
            onAddToCart={handleAddToCart}
            onQuickView={handleOpenProduct}
          />

          <main className="container main-container">

          {/* Catalog Control Bar */}
          <div className="catalog-toolbar">
            <div className="toolbar-left">
              <h3 className="toolbar-heading">
                {selectedCategory
                  ? categories.find((c) => c.slug === selectedCategory)?.[lang === 'ar' ? 'name_ar' : 'name_en']
                  : selectedBrand
                  ? brands.find((b) => String(b.id) === String(selectedBrand) || b.slug === selectedBrand)?.name
                  : selectedPrinter
                  ? printers.find((p) => p.slug === selectedPrinter)?.name
                  : t.allCategories}
              </h3>
              <span className="toolbar-count">
                ({products.length} {t.totalProductsFound})
              </span>
              {(selectedCategory || selectedBrand || selectedPrinter) && (
                <button
                  type="button"
                  className="active-filter-pill-reset"
                  onClick={resetAllFilters}
                  title={lang === 'ar' ? 'إلغاء التصفية وعرض الكل' : 'Clear filter'}
                >
                  <span>{lang === 'ar' ? 'عرض الكل' : 'Clear Filter'}</span>
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="toolbar-right">
              <div className="sort-box">
                <label className="sort-label">
                  <SlidersHorizontal size={14} />
                  <span>{t.sortBy}</span>
                </label>
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">{t.sortNewest}</option>
                  <option value="price_asc">{t.sortPriceAsc}</option>
                  <option value="price_desc">{t.sortPriceDesc}</option>
                  <option value="rating">{t.sortRating}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="skeleton-card glass-panel"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-catalog glass-panel">
              <RotateCcw size={40} className="empty-icon text-orange" />
              <h4>{lang === 'ar' ? 'لم يتم العثور على قطع تطابق بحثك' : 'No spare parts matched your filters'}</h4>
              <p>
                {lang === 'ar'
                  ? 'جرب اختيار موديل طابعة آخر أو إعادة ضبط فلاتر البحث'
                  : 'Try selecting a different printer model or reset your search filters'}
              </p>
              <button className="btn btn-primary" onClick={resetAllFilters}>
                {t.resetFilters}
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onOpenProduct={handleOpenProduct}
                  onQuickView={handleOpenProduct}
                  isWishlisted={wishlist.some((w) => w.id === product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  t={t}
                  lang={lang}
                />
              ))}
            </div>
          )}

          {/* Feature Highlights Grid */}
          <section className="features-grid-section">
            <div className="feature-item glass-panel">
              <div className="feature-icon glow-orange">
                <Award size={24} className="text-orange" />
              </div>
              <h4>{t.feature1Title}</h4>
              <p>{t.feature1Desc}</p>
            </div>

            <div className="feature-item glass-panel">
              <div className="feature-icon glow-orange">
                <ShieldCheck size={24} className="text-orange" />
              </div>
              <h4>{t.feature2Title}</h4>
              <p>{t.feature2Desc}</p>
            </div>

            <div className="feature-item glass-panel">
              <div className="feature-icon glow-orange">
                <Zap size={24} className="text-orange" />
              </div>
              <h4>{t.feature3Title}</h4>
              <p>{t.feature3Desc}</p>
            </div>
          </section>
        </main>
        </>
      )}

      {/* Footer */}
      <footer className="footer-wrapper">
        <div className="container footer-content">
          <div className="footer-col brand-col">
            <BrandLogo size="lg" />
            <p className="footer-desc" style={{ marginTop: '16px' }}>
              {lang === 'ar'
                ? 'المنصة المتكاملة لقطع غيار وإكسسوارات طابعات 3D. مصممة للمصنعين، واستوديوهات الطباعة، والهواة المحترفين.'
                : 'The dedicated hub for 3D printer spare parts, toolheads, and maintenance kits.'}
            </p>
          </div>

          {/* Shop Column */}
          <div className="footer-col nav-col">
            <h5 className="footer-heading">
              {lang === 'ar' ? 'تسوق' : 'Shop'}
            </h5>
            <ul className="footer-nav-list">
              <li>
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => handleSelectSubnav('home')}
                >
                  {lang === 'ar' ? 'كل المنتجات' : 'All Products'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => handleSelectSubnav('deals')}
                >
                  {lang === 'ar' ? 'العروض' : 'Deals'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => setIsCartOpen(true)}
                >
                  {lang === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
                </button>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="footer-col nav-col">
            <h5 className="footer-heading">
              {lang === 'ar' ? 'الدعم' : 'Support'}
            </h5>
            <ul className="footer-nav-list">
              <li>
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => setIsStatusModalOpen(true)}
                >
                  {lang === 'ar' ? 'تتبع طلبك' : 'Track Order'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  {lang === 'ar' ? 'حسابي' : 'My Account'}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="footer-col contact-col">
            <h5 className="footer-heading">
              {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </h5>
            <div className="footer-contact-info">
              <a
                href="tel:+9647500000000"
                className="footer-contact-link phone-link"
                dir="ltr"
              >
                +964 750 000 0000
              </a>
              <span className="footer-contact-text">
                {lang === 'ar' ? 'بغداد، العراق' : 'Baghdad, Iraq'}
              </span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container bottom-row">
            <span>© 2026 3D PARTS - Spare Parts for 3D Printers. All rights reserved.</span>
            <div className="footer-bottom-buttons">
              <button className="db-pill-btn" onClick={() => setIsStatusModalOpen(true)}>
                {systemStatus?.database?.engine || 'SQLite'} • {systemStatus?.database?.mode || 'Development'}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(loggedUser) => setUser(loggedUser)}
        lang={lang}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenCheckout={() => {
          setIsCartOpen(false);
          if (!user) {
            setIsAuthModalOpen(true);
          } else {
            setCurrentView('cart');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        t={t}
        lang={lang}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onAddToCart={handleAddToCart}
        onOpenProduct={handleOpenProduct}
        onClearWishlist={handleClearWishlist}
        onAddAllToCart={handleAddAllWishlistToCart}
        lang={lang}
        t={t}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onClearCart={handleClearCart}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        t={t}
        lang={lang}
      />

      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        t={t}
        lang={lang}
      />

      <SystemStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        systemStatus={systemStatus}
        t={t}
        lang={lang}
      />

      {/* Floating Back to Top Button */}
      <ScrollToTop lang={lang} />
    </div>
  );
}
