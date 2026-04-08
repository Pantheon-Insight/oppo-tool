'use client';

import { Attack } from '@/lib/types';

interface AttackDetailProps {
  attack: Attack;
}

export function AttackDetail({ attack }: AttackDetailProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Attack Title</h4>
        <p className="text-white text-base">{attack.attack}</p>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Key Detail</h4>
        <p className="text-slate-300 text-sm">{attack.key_detail}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Category</h4>
          <p className="text-slate-200">{attack.category}</p>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Severity</h4>
          <p className="text-slate-200">{attack.severity}</p>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Universe Matches</h4>
        <div className="space-y-2">
          {attack.best_universe && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-200 bg-blue-900 px-2 py-1 rounded">
                Best Match
              </span>
              <span className="text-slate-200">{attack.best_universe}</span>
            </div>
          )}
          {attack.secondary_universe && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300 bg-slate-700 px-2 py-1 rounded">
                Secondary
              </span>
              <span className="text-slate-200">{attack.secondary_universe}</span>
            </div>
          )}
          {attack.tertiary_universe && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300 bg-slate-700 px-2 py-1 rounded">
                Tertiary
              </span>
              <span className="text-slate-200">{attack.tertiary_universe}</span>
            </div>
          )}
          {!attack.best_universe && !attack.secondary_universe && !attack.tertiary_universe && (
            <p className="text-slate-400 text-sm italic">No universes matched</p>
          )}
        </div>
      </div>

      {attack.notes && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Notes</h4>
          <p className="text-slate-300 text-sm bg-slate-800 bg-opacity-50 p-3 rounded border border-slate-700">
            {attack.notes}
          </p>
        </div>
      )}
    </div>
  );
}
