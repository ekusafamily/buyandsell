import React from 'react';
import { 
  Sparkles, 
  Tv, 
  Palette, 
  Bed, 
  Utensils, 
  BookOpen, 
  Laptop, 
  Shirt, 
  Bike, 
  Wrench,
  type LucideIcon
} from 'lucide-react';
import { CATEGORIES } from '../lib/mockData';

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Tv,
  Palette,
  Bed,
  Utensils,
  BookOpen,
  Laptop,
  Shirt,
  Bike,
  Wrench,
};

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  categoryCounts: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center space-x-1.5">
          <span>Categories</span>
          <span className="text-xs font-normal text-slate-500">({CATEGORIES.length - 1} sections)</span>
        </h2>
      </div>

      {/* Horizontal Scrollable Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const IconComponent = ICON_MAP[cat.icon] || Sparkles;
          const isSelected = selectedCategory === cat.id;
          const count = cat.id === 'all' 
            ? Object.values(categoryCounts).reduce((a, b) => a + b, 0)
            : (categoryCounts[cat.id] || 0);

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-700/20 scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-emerald-600 text-amber-300' : 'bg-slate-100 text-emerald-700'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
              </div>
              <span>{cat.name}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-emerald-800 text-emerald-200' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
