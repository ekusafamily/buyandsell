import React from 'react';
import { ArrowUpDown, MapPin, RotateCcw } from 'lucide-react';
import { CAMPUS_LOCATIONS } from '../lib/mockData';
import type { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) => {
  const hasActiveFilters = 
    filters.location !== 'all' ||
    filters.condition !== 'all' ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.sortBy !== 'newest';

  return (
    <div className="px-4 py-3 bg-white border-y border-slate-200/80 my-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Results Count & Quick Location Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700">
            {totalResults} {totalResults === 1 ? 'item' : 'items'} available
          </span>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Campus Location Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-xl border border-slate-200 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={filters.location}
              onChange={(e) => onFilterChange({ location: e.target.value })}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Item Condition Filter */}
          <select
            value={filters.condition}
            onChange={(e) => onFilterChange({ condition: e.target.value })}
            className="bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer transition-colors"
          >
            <option value="all">Any Condition</option>
            <option value="Brand New">Brand New</option>
            <option value="Like New">Like New</option>
            <option value="Gently Used">Gently Used</option>
            <option value="Fair">Fair Condition</option>
          </select>
        </div>

        {/* Right side: Price Min/Max, Sort Dropdown & Reset */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Price Range inputs */}
          <div className="flex items-center space-x-1 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 font-medium">KES</span>
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => onFilterChange({ minPrice: e.target.value ? Number(e.target.value) : '' })}
              className="w-14 bg-transparent font-medium text-slate-800 focus:outline-hidden text-xs"
            />
            <span className="text-slate-300">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : '' })}
              className="w-14 bg-transparent font-medium text-slate-800 focus:outline-hidden text-xs"
            />
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-200 transition-colors cursor-pointer font-medium"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
