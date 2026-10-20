import React from 'react';
import {
  Flame,
  Cpu,
  Layers,
  Activity,
  Zap,
  Wind,
  Radio,
  HardDrive,
  Grid,
  Wrench,
  Box,
  Building2,
  Printer
} from 'lucide-react';

const iconMap = {
  Flame,
  Cpu,
  Layers,
  Activity,
  Zap,
  Wind,
  Radio,
  HardDrive,
  Tool: Wrench,
  Wrench,
  Box,
  Building2,
  Printer
};

export default function CatalogFilterSection({
  categories = [],
  brands = [],
  printers = [],
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  selectedPrinter,
  setSelectedPrinter,
  filterDimension = 'categories',
  setFilterDimension,
  lang = 'ar',
  t = {}
}) {
  return (
    <section className="catalog-filter-section-wrapper" aria-label="Filters">
      <div className="filter-navigation-layout">
        {/* IMAGE 3: Vertical Dimension Switcher Panel */}
        <div className="filter-dimension-panel">
          {/* 1. Spare Parts Categories */}
          <button
            type="button"
            className={`dim-tab-btn ${filterDimension === 'categories' ? 'active' : ''}`}
            onClick={() => setFilterDimension('categories')}
          >
            <div className="dim-tab-right">
              <Layers size={18} className="dim-icon" />
              <span className="dim-title">
                {lang === 'ar' ? 'تصنيفات قطع الغيار' : 'Parts Categories'}
              </span>
            </div>
            <span className="dim-badge">{categories.length || 8}</span>
          </button>

          {/* 2. Manufacturers / Brands */}
          <button
            type="button"
            className={`dim-tab-btn ${filterDimension === 'brands' ? 'active' : ''}`}
            onClick={() => setFilterDimension('brands')}
          >
            <div className="dim-tab-right">
              <Building2 size={18} className="dim-icon" />
              <span className="dim-title">
                {lang === 'ar' ? 'الشركات المصنعة' : 'Manufacturers'}
              </span>
            </div>
            <span className="dim-badge">{brands.length || 10}</span>
          </button>

          {/* 3. Printer Models */}
          <button
            type="button"
            className={`dim-tab-btn ${filterDimension === 'printers' ? 'active' : ''}`}
            onClick={() => setFilterDimension('printers')}
          >
            <div className="dim-tab-right">
              <Printer size={18} className="dim-icon" />
              <span className="dim-title">
                {lang === 'ar' ? 'موديلات الطابعات' : 'Printer Models'}
              </span>
            </div>
            <span className="dim-badge">{printers.length || 22}</span>
          </button>
        </div>

        {/* IMAGE 1: Horizontal Scrollable Chips Row */}
        <div className="chips-container-area">
          <div className="category-chips-bar custom-styled-scrollbar">
            {/* View / Filter indicator on the left edge (or right in LTR) */}
            <div className="chips-left-tool-icon" title={lang === 'ar' ? 'تصفح التصنيفات' : 'Browse'}>
              {filterDimension === 'categories' ? (
                <Layers size={16} />
              ) : filterDimension === 'brands' ? (
                <Building2 size={16} />
              ) : (
                <Printer size={16} />
              )}
            </div>

            {/* TAB 1: CATEGORIES CHIPS */}
            {filterDimension === 'categories' && (
              <>
                {/* All Parts Pill (Always First) */}
                <button
                  type="button"
                  className={`cat-chip ${!selectedCategory ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('')}
                >
                  <Grid size={16} />
                  <span>{lang === 'ar' ? 'جميع القطع' : 'All Parts'}</span>
                </button>

                {categories.map((cat) => {
                  const IconComponent = iconMap[cat.icon_name] || Grid;
                  const isActive = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.id || cat.slug}
                      type="button"
                      className={`cat-chip ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(isActive ? '' : cat.slug)}
                    >
                      <IconComponent size={16} className="cat-chip-icon" />
                      <span>{lang === 'ar' ? cat.name_ar : cat.name_en}</span>
                      {cat.products_count !== undefined && (
                        <span className="cat-count">{cat.products_count}</span>
                      )}
                    </button>
                  );
                })}
              </>
            )}

            {/* TAB 2: BRANDS CHIPS */}
            {filterDimension === 'brands' && (
              <>
                <button
                  type="button"
                  className={`cat-chip ${!selectedBrand ? 'active' : ''}`}
                  onClick={() => setSelectedBrand('')}
                >
                  <Building2 size={16} />
                  <span>{lang === 'ar' ? 'جميع الشركات' : 'All Brands'}</span>
                </button>

                {brands.map((brand) => {
                  const isActive = String(selectedBrand) === String(brand.id) || selectedBrand === brand.slug;
                  return (
                    <button
                      key={brand.id || brand.slug}
                      type="button"
                      className={`cat-chip ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedBrand(isActive ? '' : String(brand.id))}
                    >
                      <Building2 size={16} className="cat-chip-icon" />
                      <span>{brand.name}</span>
                      {brand.products_count !== undefined && (
                        <span className="cat-count">{brand.products_count}</span>
                      )}
                    </button>
                  );
                })}
              </>
            )}

            {/* TAB 3: PRINTER MODELS CHIPS */}
            {filterDimension === 'printers' && (
              <>
                <button
                  type="button"
                  className={`cat-chip ${!selectedPrinter ? 'active' : ''}`}
                  onClick={() => setSelectedPrinter('')}
                >
                  <Printer size={16} />
                  <span>{lang === 'ar' ? 'جميع الموديلات' : 'All Models'}</span>
                </button>

                {printers.map((printer) => {
                  const isActive = selectedPrinter === printer.slug;
                  return (
                    <button
                      key={printer.id || printer.slug}
                      type="button"
                      className={`cat-chip ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedPrinter(isActive ? '' : printer.slug)}
                    >
                      <Printer size={16} className="cat-chip-icon" />
                      <span>{printer.name}</span>
                      {printer.products_count !== undefined && (
                        <span className="cat-count">{printer.products_count}</span>
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
