import React from 'react';
import './ThemeSwitch.css';

/**
 * Animated Day/Night Theme Switch Toggle
 * From Uiverse.io by anandita-3217
 * Features: Sky blue sun with clouds in light mode, deep purple crescent moon with twinkling stars in dark mode.
 */
export default function ThemeSwitch({
  theme = 'light',
  setTheme,
  size = '16px',
  className = '',
  title
}) {
  const isDark = theme === 'dark';

  const handleToggle = () => {
    if (setTheme) {
      setTheme(isDark ? 'light' : 'dark');
    }
  };

  const tooltip = title || (isDark ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي');

  return (
    <label
      className={`theme-uiverse-switch switch ${className}`}
      style={{ '--switch-size': size }}
      title={tooltip}
      aria-label={tooltip}
    >
      <input
        type="checkbox"
        checked={isDark}
        onChange={handleToggle}
      />
      <span className="slider" />
      <span className="clouds_stars" />
    </label>
  );
}
