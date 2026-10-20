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
  Box
} from 'lucide-react';

const iconMap = {
  Flame: Flame,
  Cpu: Cpu,
  Layers: Layers,
  Activity: Activity,
  Zap: Zap,
  Wind: Wind,
  Radio: Radio,
  HardDrive: HardDrive,
  Tool: Wrench,
  Wrench: Wrench,
  Box: Box
};

export default function CategoryChips({
  categories,
  selectedCategory,
  setSelectedCategory,
  t,
  lang
}) {
  return (
    <div className="category-chips-bar">
      <button
        className={`cat-chip ${!selectedCategory ? 'active' : ''}`}
        onClick={() => setSelectedCategory('')}
      >
        <Grid size={16} />
        <span>{t.allCategories}</span>
      </button>

      {categories.map((cat) => {
        const IconComponent = iconMap[cat.icon_name] || Grid;
        const isActive = selectedCategory === cat.slug;
        return (
          <button
            key={cat.id}
            className={`cat-chip ${isActive ? 'active' : ''}`}
            onClick={() => setSelectedCategory(isActive ? '' : cat.slug)}
          >
            <IconComponent size={16} className={isActive ? 'text-white' : ''} />
            <span>{lang === 'ar' ? cat.name_ar : cat.name_en}</span>
            {cat.products_count !== undefined && (
              <span className="cat-count">{cat.products_count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
