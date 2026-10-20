import React from 'react';

export default function BrandLogo({ size = 'md', showSubtitle = false, subtitle = '' }) {
  const logoHeight = size === 'lg' ? 50 : size === 'sm' ? 30 : 40;

  return (
    <div className={`brand-logo-container size-${size}`}>
      <div className="brand-logo-badge">
        <img
          src="/images/logo_3dparts_transparent.png"
          alt="3D PARTS - SPARE PARTS FOR 3D PRINTERS"
          className="brand-logo-img logo-light"
          style={{
            height: `var(--brand-logo-h, ${logoHeight}px)`,
            width: 'auto',
            objectFit: 'contain'
          }}
        />
        <img
          src="/images/logo_3dparts_dark.png"
          alt="3D PARTS - SPARE PARTS FOR 3D PRINTERS"
          className="brand-logo-img logo-dark"
          style={{
            height: `var(--brand-logo-h, ${logoHeight}px)`,
            width: 'auto',
            objectFit: 'contain'
          }}
        />
      </div>
      {showSubtitle && subtitle && (
        <span className="brand-sub-badge-ar">{subtitle}</span>
      )}
    </div>
  );
}

