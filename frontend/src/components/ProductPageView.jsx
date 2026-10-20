import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  ShoppingCart,
  Star,
  ShieldCheck,
  Sparkles,
  Tag,
  ChevronRight,
  ChevronLeft,
  Check,
  FileText,
  Heart
} from 'lucide-react';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';

export default function ProductPageView({
  product,
  allProducts = [],
  onBackToStore,
  onAddToCart,
  onOpenCheckout,
  onSelectProduct,
  wishlist = [],
  onToggleWishlist,
  lang = 'ar',
  t
}) {
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Combine product gallery images with any variant-specific images so all are accessible in the gallery
  const productImages = useMemo(() => {
    const list = [];
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      list.push(...product.images);
    } else if (product?.image_url) {
      list.push(product.image_url);
    }

    // Include variant images so clicking any variant can display its image directly
    if (product?.variants && Array.isArray(product.variants)) {
      product.variants.forEach((v) => {
        if (v.image_url && typeof v.image_url === 'string' && v.image_url.trim() && !list.includes(v.image_url.trim())) {
          list.push(v.image_url.trim());
        }
      });
    }

    return list.length > 0 ? list : [FALLBACK_IMG];
  }, [product?.images, product?.image_url, product?.variants]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Scroll to top and reset image when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setQuantity(1);
    setAddedSuccess(false);
    setActiveImageIndex(0);
  }, [product?.id]);

  const hasVariants = Boolean(product?.has_variants && product?.variants && product.variants.length > 0);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Function to switch gallery active image to the selected variant's image
  const syncImageWithVariant = (variant) => {
    if (variant?.image_url && typeof variant.image_url === 'string' && variant.image_url.trim()) {
      const targetImg = variant.image_url.trim();
      const foundIdx = productImages.findIndex((img) => img === targetImg);
      if (foundIdx !== -1) {
        setActiveImageIndex(foundIdx);
      }
    }
  };

  const handleSelectVariant = (v) => {
    setSelectedVariant(v);
    syncImageWithVariant(v);
  };

  useEffect(() => {
    if (product?.has_variants && product?.variants && product.variants.length > 0) {
      const firstAvailable = product.variants.find((v) => v.in_stock !== false) || product.variants[0];
      setSelectedVariant(firstAvailable);
      syncImageWithVariant(firstAvailable);
    } else {
      setSelectedVariant(null);
    }
  }, [product?.id, product?.has_variants, product?.variants, productImages]);

  const currentImage = productImages[activeImageIndex] || selectedVariant?.image_url || productImages[0] || FALLBACK_IMG;

  const handlePrevImage = (e) => {
    e?.stopPropagation?.();
    if (productImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleNextImage = (e) => {
    e?.stopPropagation?.();
    if (productImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % productImages.length);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (productImages.length <= 1) return;
      if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev + 1) % productImages.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [productImages.length]);

  if (!product) return null;

  const isAr = lang === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const title = isAr ? product.name_ar : product.name_en;
  const categoryName = isAr ? product.category_name_ar : product.category_name_en;
  const description = isAr
    ? (product.description_ar || product.description_en || '')
    : (product.description_en || product.description_ar || '');

  const handleImageError = (e) => {
    if (e.target.src !== FALLBACK_IMG) {
      e.target.src = FALLBACK_IMG;
    }
  };

  const discountPercent =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;

  const savingsAmount =
    product.original_price && product.original_price > product.price
      ? (parseFloat(product.original_price) - parseFloat(product.price)).toFixed(2)
      : null;

  const activePrice = selectedVariant?.price != null ? selectedVariant.price : product.price;

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity, selectedVariant);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity, selectedVariant);
    }
    if (onOpenCheckout) {
      onOpenCheckout();
    }
  };

  // Related products in same category (excluding current)
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="product-page-wrapper">
      <div className="container">
        {/* Top Breadcrumbs & Back Navigation */}
        <div className="product-page-breadcrumbs">
          <button className="back-to-store-btn" onClick={onBackToStore}>
            <BackArrow size={18} />
            <span>{isAr ? 'العودة إلى المتجر' : 'Back to Store'}</span>
          </button>

          <div className="breadcrumbs-trail">
            <span className="crumb-link" onClick={onBackToStore}>
              {isAr ? 'الرئيسية' : 'Home'}
            </span>
            <span className="crumb-separator">/</span>
            <span className="crumb-link" onClick={onBackToStore}>
              {categoryName}
            </span>
            <span className="crumb-separator">/</span>
            <span className="crumb-current">{title}</span>
          </div>
        </div>

        {/* Core Product Hero Section */}
        <div className="product-main-grid glass-panel">
          {/* Column 1: Image Showcase Stage */}
          <div className="product-gallery-stage">
            <div className="product-image-container">
              <img
                src={currentImage}
                alt={title}
                className="product-hero-image"
                onError={handleImageError}
              />

              {/* Navigation Arrows for Multiple Images */}
              {productImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className="gallery-arrow-btn gallery-arrow-left"
                    onClick={handlePrevImage}
                    aria-label={isAr ? 'الصورة السابقة' : 'Previous Image'}
                    title={isAr ? 'الصورة السابقة (سهم يسار)' : 'Previous Image'}
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    className="gallery-arrow-btn gallery-arrow-right"
                    onClick={handleNextImage}
                    aria-label={isAr ? 'الصورة التالية' : 'Next Image'}
                    title={isAr ? 'الصورة التالية (سهم يمين)' : 'Next Image'}
                  >
                    <ChevronRight size={22} />
                  </button>
                  <div className="gallery-counter-badge" dir="ltr">
                    {activeImageIndex + 1} / {productImages.length}
                  </div>
                </>
              )}

              {/* Floating Badges */}
              <div className="product-hero-badges">
                {discountPercent && (
                  <span className="badge badge-amber glow-amber">
                    <Tag size={13} />
                    {isAr ? `خصم ${discountPercent}%` : `-${discountPercent}% OFF`}
                  </span>
                )}
                {product.is_universal ? (
                  <span className="badge badge-orange">
                    <Sparkles size={13} />
                    {isAr ? 'توافق عالمي' : 'Universal Part'}
                  </span>
                ) : (
                  <span className="badge badge-green">
                    <ShieldCheck size={13} />
                    {isAr ? 'أصلي ومضمون 100%' : '100% Genuine OEM'}
                  </span>
                )}
              </div>
            </div>

            {/* Multiple Images Thumbnails Strip */}
            {productImages.length > 1 && (
              <div className="product-thumbnails-strip">
                {productImages.map((img, idx) => {
                  const isActive = idx === activeImageIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`thumb-btn ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveImageIndex(idx)}
                      title={`${title} ${idx + 1}`}
                    >
                      <img src={img} alt="" onError={handleImageError} />
                    </button>
                  );
                })}
              </div>
            )}

            <div className="sku-tag-box">
              <span className="sku-label">{isAr ? 'كود القطعة (SKU):' : 'SKU:'}</span>
              <strong className="sku-code">{product.sku}</strong>
            </div>
          </div>

          {/* Column 2: Product Specifications & Order Box */}
          <div className="product-details-content">
            {/* Category & Status */}
            <div className="product-meta-header">
              <span className="product-page-category">{categoryName}</span>
              <span className={`stock-indicator ${product.stock_quantity > 0 ? 'in-stock' : 'out-stock'}`}>
                <span className="stock-dot"></span>
                {product.stock_quantity > 0
                  ? isAr
                    ? `متوفر في المستودع (${product.stock_quantity} قطعة)`
                    : `In Stock (${product.stock_quantity} available)`
                  : isAr
                  ? 'غير متوفر حالياً'
                  : 'Out of Stock'}
              </span>
            </div>

            {/* Title */}
            <h1 className="product-page-title">{title}</h1>

            {/* Rating Stars & SKU Tag */}
            <div className="product-page-rating-row">
              <div className="product-page-rating">
                <div className="stars-cluster">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} className="star-filled" />
                  ))}
                </div>
                <span className="rating-value">{product.rating}</span>
                <span className="reviews-count">
                  ({product.reviews_count || 18} {isAr ? 'تقييم معتمد' : 'reviews'})
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="product-page-price-card">
              <div className="price-primary-row" dir={isAr ? 'rtl' : 'ltr'}>
                <div className="price-main-block">
                  <span className="page-current-price text-orange">
                    {Number(activePrice).toLocaleString()}
                  </span>
                  <span className="price-currency-sign" style={{ marginInlineStart: '6px' }}>
                    {isAr ? 'د.ع' : 'IQD'}
                  </span>
                </div>
                {product.original_price && (
                  <span className="page-orig-price">
                    {Number(product.original_price).toLocaleString()} {isAr ? 'د.ع' : 'IQD'}
                  </span>
                )}
                {savingsAmount && (
                  <span className="savings-tag">
                    {isAr ? `توفير ${Number(savingsAmount).toLocaleString()} د.ع` : `Save ${Number(savingsAmount).toLocaleString()} IQD`}
                  </span>
                )}
              </div>
              <p className="price-tax-hint">
                {isAr ? 'شامل الضريبة • إمكانية الشحن السريع لجميع المحافظات' : 'Taxes included • Fast dispatch available'}
              </p>
            </div>

            {/* Select Size / Options Section (Positioned directly under Price for intuitive selection) */}
            {hasVariants && (
              <div className="product-variants-container">
                <div className="variants-header-row">
                  <div className="variants-header-title">
                    <span className="variants-title-label">
                      {isAr ? 'اختر القياس / المقاس:' : 'Select Option / Size:'}
                    </span>
                    {selectedVariant && (
                      <span className="variants-selected-name">
                        {isAr && selectedVariant.name_ar ? selectedVariant.name_ar : selectedVariant.name}
                      </span>
                    )}
                  </div>
                  {selectedVariant && (
                    <span className={`variant-availability-tag ${selectedVariant.in_stock === false ? 'out' : 'in'}`}>
                      <span className="availability-dot"></span>
                      {selectedVariant.in_stock === false 
                        ? (isAr ? 'نفذت الكمية' : 'Out of Stock') 
                        : (isAr ? 'متوفر للطلب' : 'In Stock')}
                    </span>
                  )}
                </div>

                {/* Responsive Grid of Variant Option Cards */}
                <div className="variants-options-grid">
                  {product.variants.map((v, idx) => {
                    const isSelected =
                      selectedVariant &&
                      (selectedVariant.id === v.id || selectedVariant.name === v.name);
                    const isSoldOut = v.in_stock === false;
                    const vName = isAr && v.name_ar ? v.name_ar : v.name;
                    const vPrice = parseFloat(
                      v.price != null ? v.price : product.price
                    ).toFixed(2);
                    const vImg = v.image_url || currentImage;

                    return (
                      <button
                        key={v.id || idx}
                        type="button"
                        className={`variant-option-card ${isSelected ? 'selected' : ''} ${isSoldOut ? 'sold-out' : ''}`}
                        onClick={() => {
                          if (!isSoldOut) {
                            handleSelectVariant(v);
                          }
                        }}
                        disabled={isSoldOut}
                        title={isSoldOut ? (isAr ? 'نفذت الكمية' : 'Sold Out') : vName}
                      >
                        <div className="variant-card-thumb">
                          <img src={vImg} alt={vName} onError={handleImageError} />
                        </div>
                        <div className="variant-card-info">
                          <span className="variant-card-title">{vName}</span>
                          <div className="variant-card-price-row">
                            <span className="variant-card-price">{Number(vPrice).toLocaleString()} {isAr ? 'د.ع' : 'IQD'}</span>
                            {isSoldOut && (
                              <span className="variant-card-soldout">
                                {isAr ? 'نفذت الكمية' : 'Sold Out'}
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="variant-check-badge">
                            <Check size={13} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="product-cta-section">
              <div className="qty-picker-box">
                <span className="qty-picker-label">{isAr ? 'الكمية:' : 'Qty:'}</span>
                <div className="qty-counter">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="qty-display">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.min(product.stock_quantity || 99, quantity + 1))}
                    disabled={quantity >= (product.stock_quantity || 99)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="page-buttons-cluster">
                <button
                  className={`btn-primary page-add-cart-btn ${addedSuccess ? 'btn-success' : ''}`}
                  onClick={handleAdd}
                  disabled={product.stock_quantity <= 0}
                >
                  {addedSuccess ? (
                    <>
                      <Check size={20} />
                      <span>{isAr ? 'تمت الإضافة بنجاح!' : 'Added to Cart!'}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      <span>{isAr ? 'إضافة إلى السلة' : 'Add to Cart'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className={`btn-secondary page-wishlist-btn ${wishlist.some((item) => item.id === product?.id) ? 'in-wishlist' : ''}`}
                  onClick={() => onToggleWishlist && onToggleWishlist(product)}
                  title={wishlist.some((item) => item.id === product?.id) ? (isAr ? 'إزالة من قائمة الأمنيات' : 'Remove from Wishlist') : (isAr ? 'إضافة إلى قائمة الأمنيات' : 'Add to Wishlist')}
                  aria-label={isAr ? 'قائمة الأمنيات' : 'Wishlist'}
                >
                  <Heart
                    size={22}
                    className="wishlist-btn-heart-icon"
                    fill={wishlist.some((item) => item.id === product?.id) ? '#ff6b00' : 'none'}
                    color={wishlist.some((item) => item.id === product?.id) ? '#ff6b00' : 'currentColor'}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Full Description Section (Down on the page) */}
        {description && (
          <div className="product-page-bottom-desc-card glass-panel animate-fade">
            <div className="bottom-desc-header">
              <div className="bottom-desc-badge">
                <FileText size={20} className="text-orange" />
                <h3 className="bottom-desc-title">
                  {isAr ? 'وصف المنتج' : 'Product Description'}
                </h3>
              </div>
            </div>
            <div className="bottom-desc-content">
              {description.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx} className="desc-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="related-products-section">
            <div className="related-section-header">
              <h2 className="related-section-title">
                {isAr ? 'قطع غيار وملحقات ذات صلة' : 'Related Spare Parts'}
              </h2>
              <span className="related-section-subtitle">
                {isAr
                  ? 'قطع أخرى متوافقة من نفس الفئة قد تحتاجها في الصيانة'
                  : 'Recommended parts from the same category'}
              </span>
            </div>

            <div className="related-products-grid">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  className="related-item-card glass-panel"
                  onClick={() => onSelectProduct && onSelectProduct(rel)}
                >
                  <div className="related-img-box">
                    <img
                      src={rel.image_url || FALLBACK_IMG}
                      alt={isAr ? rel.name_ar : rel.name_en}
                      onError={handleImageError}
                    />
                  </div>
                  <div className="related-details">
                    <span className="related-cat">
                      {isAr ? rel.category_name_ar : rel.category_name_en}
                    </span>
                    <h4 className="related-title">
                      {isAr ? rel.name_ar : rel.name_en}
                    </h4>
                    <div className="related-footer">
                      <strong className="related-price text-orange">
                        {Number(rel.price).toLocaleString()} {isAr ? 'د.ع' : 'IQD'}
                      </strong>
                      <button
                        className="related-view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct && onSelectProduct(rel);
                        }}
                      >
                        {isAr ? 'عرض القطعة' : 'View'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
