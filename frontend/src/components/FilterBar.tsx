'use client';

import { Severity, Attack } from '@/lib/types';

interface FilterBarProps {
  attacks: Attack[];
  onFilterChange: (filters: FilterState) => void;
  filters: FilterState;
}

export interface FilterState {
  categories: string[];
  severities: Severity[];
  search: string;
  universe: string;
}

const SEVERITY_OPTIONS: Severity[] = ['Major', 'Moderate', 'Minor', 'Niche'];

export function FilterBar({ attacks, onFilterChange, filters }: FilterBarProps) {
  const categories = Array.from(new Set(attacks.map((a) => a.category))).sort();
  const universes = Array.from(
    new Set(
      attacks
        .flatMap((a) => [a.best_universe, a.secondary_universe, a.tertiary_universe])
        .filter((u) => u),
    ),
  ).sort();

  const filteredCount = attacks.filter((attack) => {
    if (filters.categories.length > 0 && !filters.categories.includes(attack.category)) {
      return false;
    }
    if (filters.severities.length > 0 && !filters.severities.includes(attack.severity)) {
      return false;
    }
    if (filters.search && !attackMatchesSearch(attack, filters.search)) {
      return false;
    }
    if (
      filters.universe &&
      ![attack.best_universe, attack.secondary_universe, attack.tertiary_universe].includes(
        filters.universe,
      )
    ) {
      return false;
    }
    return true;
  }).length;

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter((c) => c !== category);
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handleSeverityChange = (severity: Severity, checked: boolean) => {
    const newSeverities = checked
      ? [...filters.severities, severity]
      : filters.severities.filter((s) => s !== severity);
    onFilterChange({ ...filters, severities: newSeverities });
  };

  const handleClear = () => {
    onFilterChange({
      categories: [],
      severities: [],
      search: '',
      universe: '',
    });
  };

  const isFiltered =
    filters.categories.length > 0 ||
    filters.severities.length > 0 ||
    filters.search.length > 0 ||
    filters.universe.length > 0;

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Filters</h3>
        {isFiltered && (
          <button
            onClick={handleClear}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-2">Search</label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          placeholder="Attack, category, notes..."
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-2">Category</label>
        <select
          multiple
          value={filters.categories}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, (o) => o.value);
            onFilterChange({ ...filters, categories: selected });
          }}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          size={Math.min(5, categories.length + 1)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1">Ctrl/Cmd+Click to select multiple</p>
      </div>

      {/* Severity */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-2">Severity</label>
        <div className="space-y-2">
          {SEVERITY_OPTIONS.map((severity) => (
            <label key={severity} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.severities.includes(severity)}
                onChange={(e) => handleSeverityChange(severity, e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-300">{severity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Universe */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-2">Universe</label>
        <select
          value={filters.universe}
          onChange={(e) => onFilterChange({ ...filters, universe: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All universes</option>
          {universes.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      {/* Result count */}
      <div className="pt-2 border-t border-slate-700">
        <p className="text-sm text-slate-400">
          <span className="font-semibold text-white">{filteredCount}</span> of{' '}
          <span className="font-semibold text-white">{attacks.length}</span> results
        </p>
      </div>
    </div>
  );
}

function attackMatchesSearch(attack: Attack, search: string): boolean {
  const searchLower = search.toLowerCase();
  return (
    attack.attack.toLowerCase().includes(searchLower) ||
    attack.category.toLowerCase().includes(searchLower) ||
    attack.key_detail.toLowerCase().includes(searchLower) ||
    (attack.notes && attack.notes.toLowerCase().includes(searchLower))
  );
}
