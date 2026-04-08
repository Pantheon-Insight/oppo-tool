'use client';

import { Attack } from '@/lib/types';

interface UniversePanelProps {
  attacks: Attack[];
  selectedUniverse: string;
  onUniverseSelect: (universe: string) => void;
}

export function UniversePanel({
  attacks,
  selectedUniverse,
  onUniverseSelect,
}: UniversePanelProps) {
  // Count attacks per universe
  const universeCounts = new Map<string, number>();

  attacks.forEach((attack) => {
    [attack.best_universe, attack.secondary_universe, attack.tertiary_universe].forEach(
      (universe) => {
        if (universe) {
          universeCounts.set(universe, (universeCounts.get(universe) || 0) + 1);
        }
      },
    );
  });

  // Sort by count descending
  const sortedUniverses = Array.from(universeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Targeting Universes</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedUniverses.length === 0 ? (
          <p className="text-slate-400 text-sm">No universe matches</p>
        ) : (
          sortedUniverses.map((universe) => {
            const count = universeCounts.get(universe) || 0;
            const isSelected = selectedUniverse === universe;
            return (
              <button
                key={universe}
                onClick={() => onUniverseSelect(isSelected ? '' : universe)}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{universe}</span>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      isSelected
                        ? 'bg-blue-700 text-blue-100'
                        : 'bg-slate-600 text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
