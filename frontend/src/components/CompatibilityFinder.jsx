import React from 'react';
import { Cpu, CheckCircle2, RotateCcw, Filter, Wrench } from 'lucide-react';

export default function CompatibilityFinder({
  brands,
  printers,
  categories,
  selectedBrand,
  setSelectedBrand,
  selectedPrinter,
  setSelectedPrinter,
  selectedCategory,
  setSelectedCategory,
  onResetFilters,
  t,
  lang
}) {
  const filteredPrinters = selectedBrand
    ? printers.filter((p) => String(p.brand) === String(selectedBrand))
    : printers;

  const hasActiveFilter = selectedBrand || selectedPrinter || selectedCategory;

  return (
    <section className="compat-finder-section glass-panel">
      <div className="compat-header">
        <div className="compat-title-row">
          <div className="compat-icon-box glow-orange">
            <Wrench size={22} className="text-orange" />
          </div>
          <div>
            <h2 className="compat-title">{t.compatibilityTitle}</h2>
            <p className="compat-subtitle">{t.compatibilityDesc}</p>
          </div>
        </div>

        {hasActiveFilter && (
          <button className="reset-btn" onClick={onResetFilters}>
            <RotateCcw size={15} />
            <span>{t.resetFilters}</span>
          </button>
        )}
      </div>

      <div className="compat-controls-grid">
        {/* Step 1: Select Brand */}
        <div className="compat-field">
          <label className="compat-label">{t.selectBrand}</label>
          <select
            className="compat-select"
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setSelectedPrinter(''); // Reset printer when brand changes
            }}
          >
            <option value="">{lang === 'ar' ? '-- جميع الشركات --' : '-- All Brands --'}</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Select Printer Model */}
        <div className="compat-field">
          <label className="compat-label">{t.selectPrinter}</label>
          <select
            className="compat-select"
            value={selectedPrinter}
            onChange={(e) => setSelectedPrinter(e.target.value)}
            disabled={!selectedBrand && filteredPrinters.length === 0}
          >
            <option value="">{t.allPrinters}</option>
            {filteredPrinters.map((p) => (
              <option key={p.id} value={p.id}>
                {p.brand_name ? `${p.brand_name} - ${p.name}` : p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 3: Select Category */}
        <div className="compat-field">
          <label className="compat-label">{t.selectCategory}</label>
          <select
            className="compat-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">{t.allCategories}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {lang === 'ar' ? c.name_ar : c.name_en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilter && (
        <div className="compat-status-banner">
          <CheckCircle2 size={18} className="text-orange" />
          <span>
            {lang === 'ar'
              ? 'يتم الآن تصفية القطع المطابقة لخياراتك لضمان عدم حدوث أي خطأ في التركيب'
              : 'Filtering parts verified to match your selection for guaranteed compatibility'}
          </span>
        </div>
      )}
    </section>
  );
}
