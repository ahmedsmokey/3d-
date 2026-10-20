import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSlider({
  banners = [],
  products = [],
  lang = 'ar',
  onAddToCart,
  onQuickView
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef(null);

  // Construct Slides List from dynamic banners or fallback showcase images
  const slides = useMemo(() => {
    if (banners && banners.length > 0) {
      return banners.map((b, idx) => ({
        id: b.id || `banner-slide-${idx + 1}`,
        type: 'brand_banner',
        image: b.image_url || b.image,
        titleEn: b.title || `Showcase Banner ${idx + 1}`,
        titleAr: b.title || `لافتة العرض ${idx + 1}`
      }));
    }
    return [
      // 1. 3D Printer & Stream of Spare Parts Banner
      {
        id: 'banner-slide-1',
        type: 'brand_banner',
        image: '/images/banner_slide_1.png',
        titleEn: '3D Printer & Components Ecosystem',
        titleAr: 'طابعات ثلاثية الأبعاد ومكونات متكاملة'
      },
      // 2. Extruders, Motors & Hotends Components
      {
        id: 'banner-slide-2',
        type: 'brand_banner',
        image: '/images/banner_slide_2.png',
        titleEn: 'High Performance Extruders & Hotends',
        titleAr: 'رؤوس تسخين ومحركات احترافية'
      },
      // 3. Precision Nozzles & Mechanical Gears
      {
        id: 'banner-slide-3',
        type: 'brand_banner',
        image: '/images/banner_slide_3.png',
        titleEn: 'Precision Nozzles & Gears Components',
        titleAr: 'فوهات دقيقة وتروس ميكانيكية'
      },
      // 4. Dynamic Stream 3D Printer Hardware
      {
        id: 'banner-slide-4',
        type: 'brand_banner',
        image: '/images/banner_slide_4.png',
        titleEn: 'Advanced 3D Hardware & Accessories',
        titleAr: 'طابعات متطورة وقطع غيار أصلية'
      }
    ];
  }, [banners]);


  const slideDuration = 5000; // 5 seconds per slide
  const stepInterval = 50;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  const goToSlide = (idx) => {
    setCurrentIndex(idx);
    setProgress(0);
  };

  // Autoplay loop
  useEffect(() => {
    if (isPaused) {
      clearInterval(progressTimerRef.current);
      return;
    }

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + (stepInterval / slideDuration) * 100;
      });
    }, stepInterval);

    return () => clearInterval(progressTimerRef.current);
  }, [currentIndex, isPaused, slides.length]);

  // Reset index if slides change
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
      setProgress(0);
    }
  }, [slides.length, currentIndex]);

  const currentSlide = slides[currentIndex] || slides[0];
  if (!currentSlide) return null;

  return (
    <section
      className="bambu-hero-section full-width-hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Full-Width Bambu Lab Showcase Banner"
    >
      {/* Full-width Banner Card (No side container restriction) */}
      <div className="bambu-hero-card is-brand-banner">
        <img
          src={currentSlide.image}
          alt={lang === 'ar' ? currentSlide.titleAr : currentSlide.titleEn}
          className="bambu-hero-banner-image animate-fade"
          key={currentSlide.id}
          loading="eager"
          decoding="async"
        />

        {/* Left / Right Chevron Controls */}
        <button
          className="bambu-nav-chevron bambu-chevron-prev"
          onClick={prevSlide}
          aria-label="Previous Slide"
        >
          {lang === 'ar' ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
        </button>

        <button
          className="bambu-nav-chevron bambu-chevron-next"
          onClick={nextSlide}
          aria-label="Next Slide"
        >
          {lang === 'ar' ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
        </button>

        {/* Bottom Pagination Dots (Signature Bambu Style: • • ▬▬ •) */}
        <div className="bambu-dots-pagination">
          {slides.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={slide.id}
                className={`bambu-dot-btn ${isActive ? 'active' : ''}`}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              >
                {isActive && (
                  <span
                    className="bambu-dot-progress"
                    style={{ width: `${progress}%` }}
                  ></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
