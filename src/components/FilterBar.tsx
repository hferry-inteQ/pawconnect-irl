import { useState } from 'react';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import type { CityRow, CategoryRow } from '../lib/database.types';

export type DateQuickFilter = 'all' | 'today' | 'this-week' | 'this-weekend' | 'this-month';

interface Props {
  cities: CityRow[];
  categories: CategoryRow[];
  selectedCity: string;
  selectedCategory: string;
  showFreeOnly: boolean;
  dateFilter: DateQuickFilter;
  onCityChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onFreeOnlyChange: (v: boolean) => void;
  onDateFilterChange: (v: DateQuickFilter) => void;
  resultCount: number;
}

const DATE_CHIPS: { label: string; value: DateQuickFilter }[] = [
  { label: 'All',          value: 'all' },
  { label: 'Today',        value: 'today' },
  { label: 'Next 7 Days',  value: 'this-week' },
  { label: 'Weekend',      value: 'this-weekend' },
  { label: 'Next 30 Days', value: 'this-month' },
];

export default function FilterBar({
  cities, categories, selectedCity, selectedCategory,
  showFreeOnly, dateFilter,
  onCityChange, onCategoryChange, onFreeOnlyChange, onDateFilterChange,
  resultCount,
}: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hasActiveFilters = selectedCity || selectedCategory || showFreeOnly || dateFilter !== 'all';
  const activeCount = [selectedCity, selectedCategory, showFreeOnly, dateFilter !== 'all'].filter(Boolean).length;

  function clearAll() {
    onCityChange(''); onCategoryChange(''); onFreeOnlyChange(false); onDateFilterChange('all');
  }

  return (
    <div className="bg-white border-b border-warm-100 sticky top-[104px] sm:top-[112px] z-30 shadow-warm-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-2.5">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1 -mx-1 px-1">
            {DATE_CHIPS.map(chip => (
              <button
                key={chip.value}
                onClick={() => onDateFilterChange(chip.value)}
                className={`flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-150 focus:outline-none ${
                  dateFilter === chip.value
                    ? 'bg-stone-900 border-stone-900 text-white'
                    : 'bg-white border-warm-200 text-stone-500 hover:border-warm-400 hover:text-stone-800'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-warm-200 flex-shrink-0" />

          <button
            onClick={() => setFiltersOpen(o => !o)}
            className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
              activeCount > 0
                ? 'bg-stone-900 border-stone-900 text-white'
                : 'bg-white border-warm-200 text-stone-500 hover:border-warm-400 hover:text-stone-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {activeCount > 0 && (
              <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                {activeCount}
              </span>
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
          </button>

          <span className="flex-shrink-0 text-xs text-warm-500 font-medium hidden sm:block">
            {resultCount} result{resultCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="border-t border-warm-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-2 -mx-1 px-1">
            <button
              onClick={() => onCityChange('')}
              className={`flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-150 focus:outline-none ${
                !selectedCity
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-warm-200 text-stone-500 hover:border-warm-400 hover:text-stone-800'
              }`}
            >
              All Cities
            </button>
            {cities.map(city => (
              <button
                key={city.id}
                onClick={() => onCityChange(selectedCity === city.id ? '' : city.id)}
                className={`flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-150 focus:outline-none ${
                  selectedCity === city.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-warm-200 text-stone-500 hover:border-warm-400 hover:text-stone-800'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="border-t border-warm-100 bg-warm-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={selectedCity}
                onChange={onCityChange}
                options={[{ value: '', label: 'All Cities' }, ...cities.map(c => ({ value: c.id, label: c.name }))]}
              />
              <Select
                value={selectedCategory}
                onChange={onCategoryChange}
                options={[{ value: '', label: 'All Types' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
              />
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-stone-700 font-medium">
                <span
                  role="switch"
                  aria-checked={showFreeOnly}
                  onClick={() => onFreeOnlyChange(!showFreeOnly)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer ${showFreeOnly ? 'bg-emerald-500' : 'bg-warm-300'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${showFreeOnly ? 'translate-x-4' : 'translate-x-0'}`} />
                </span>
                Free only
              </label>
              {hasActiveFilters && (
                <button onClick={clearAll} className="flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors ml-auto">
                  <X className="w-3.5 h-3.5" />
                  Clear all
                </button>
              )}
            </div>
            <p className="text-xs text-warm-500 mt-2 sm:hidden">{resultCount} result{resultCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-sm border border-warm-200 rounded-lg px-3 py-1.5 bg-white text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-stone-900 cursor-pointer hover:border-warm-400 transition-colors"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
