'use client';

import { useState, useMemo } from 'react';
import { Attack, Severity } from '@/lib/types';
import { AttackDetail } from './AttackDetail';

interface ResultsTableProps {
  attacks: Attack[];
  filters: {
    categories: string[];
    severities: Severity[];
    search: string;
    universe: string;
  };
}

type SortField = 'number' | 'category' | 'attack' | 'severity' | 'best_universe';
type SortOrder = 'asc' | 'desc';

const SEVERITY_ORDER = { Major: 0, Moderate: 1, Minor: 2, Niche: 3 };

function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'Major':
      return 'bg-red-900 text-red-200';
    case 'Moderate':
      return 'bg-amber-900 text-amber-200';
    case 'Minor':
      return 'bg-blue-900 text-blue-200';
    case 'Niche':
      return 'bg-slate-700 text-slate-200';
  }
}

export function ResultsTable({ attacks, filters }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>('number');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const ROWS_PER_PAGE = 20;

  const filteredAttacks = useMemo(() => {
    return attacks.filter((attack) => {
      if (filters.categories.length > 0 && !filters.categories.includes(attack.category)) {
        return false;
      }
      if (filters.severities.length > 0 && !filters.severities.includes(attack.severity)) {
        return false;
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !attack.attack.toLowerCase().includes(searchLower) &&
          !attack.category.toLowerCase().includes(searchLower) &&
          !attack.key_detail.toLowerCase().includes(searchLower) &&
          !(attack.notes && attack.notes.toLowerCase().includes(searchLower))
        ) {
          return false;
        }
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
    });
  }, [attacks, filters]);

  const sortedAttacks = useMemo(() => {
    const sorted = [...filteredAttacks].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'severity') {
        aValue = SEVERITY_ORDER[a.severity];
        bValue = SEVERITY_ORDER[b.severity];
      } else if (sortField === 'best_universe') {
        aValue = a.best_universe || '';
        bValue = b.best_universe || '';
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredAttacks, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedAttacks.length / ROWS_PER_PAGE);
  const paginatedAttacks = sortedAttacks.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-slate-600">⇅</span>;
    return <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>;
  };

  if (sortedAttacks.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-lg">No attacks found matching your filters</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto border border-slate-700 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 sticky top-0 border-b border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-200">
                <button
                  onClick={() => handleSort('number')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  # <SortIndicator field="number" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-200">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Category <SortIndicator field="category" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-200">
                <button
                  onClick={() => handleSort('attack')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Attack <SortIndicator field="attack" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-200">
                <button
                  onClick={() => handleSort('severity')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Severity <SortIndicator field="severity" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-200">
                <button
                  onClick={() => handleSort('best_universe')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Universes <SortIndicator field="best_universe" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedAttacks.map((attack, idx) => (
              <tbody key={attack.number}>
                <tr
                  className={`border-b border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer ${
                    idx % 2 === 0 ? 'bg-slate-900 bg-opacity-40' : 'bg-slate-900 bg-opacity-20'
                  }`}
                  onClick={() =>
                    setExpandedId(expandedId === attack.number ? null : attack.number)
                  }
                >
                  <td className="px-4 py-3 text-slate-300 font-semibold">{attack.number}</td>
                  <td className="px-4 py-3 text-slate-300">{attack.category}</td>
                  <td className="px-4 py-3 text-slate-200 font-medium">{attack.attack}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(attack.severity)}`}
                    >
                      {attack.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <div className="flex gap-1 flex-wrap">
                      {attack.best_universe && (
                        <span className="inline-block bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs">
                          {attack.best_universe}
                        </span>
                      )}
                      {attack.secondary_universe && (
                        <span className="inline-block bg-slate-700 text-slate-200 px-2 py-1 rounded text-xs">
                          {attack.secondary_universe}
                        </span>
                      )}
                      {attack.tertiary_universe && (
                        <span className="inline-block bg-slate-700 text-slate-200 px-2 py-1 rounded text-xs">
                          {attack.tertiary_universe}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedId === attack.number && (
                  <tr className="bg-slate-800 border-b border-slate-700">
                    <td colSpan={5} className="p-6">
                      <AttackDetail attack={attack} />
                    </td>
                  </tr>
                )}
              </tbody>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Showing {(currentPage - 1) * ROWS_PER_PAGE + 1} to{' '}
          {Math.min(currentPage * ROWS_PER_PAGE, sortedAttacks.length)} of {sortedAttacks.length}{' '}
          attacks
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-200 rounded text-sm transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-2 py-1 rounded text-sm transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-200 rounded text-sm transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
