'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { FileUpload } from '@/components/FileUpload';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { FilterBar, FilterState } from '@/components/FilterBar';
import { ResultsTable } from '@/components/ResultsTable';
import { UniversePanel } from '@/components/UniversePanel';
import { ExportButton } from '@/components/ExportButton';
import { useExtraction } from '@/hooks/useExtraction';

export default function Home() {
  const extraction = useExtraction();
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    severities: [],
    search: '',
    universe: '',
  });

  const isUploadState = extraction.state === 'idle';
  const isProcessingState = extraction.state === 'uploading' || extraction.state === 'extracting';
  const isSuccessState = extraction.state === 'success';
  const isErrorState = extraction.state === 'error';

  const handleNewAnalysis = () => {
    extraction.reset();
    setFilters({
      categories: [],
      severities: [],
      search: '',
      universe: '',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header />

      <main className="flex-1 p-8">
        {isUploadState && (
          <div className="max-w-4xl mx-auto">
            <FileUpload
              onFileSelect={extraction.handleFileUpload}
              loading={false}
            />
          </div>
        )}

        {isProcessingState && (
          <div className="max-w-2xl mx-auto">
            <ProcessingStatus progress={extraction.progress} />
          </div>
        )}

        {isErrorState && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-red-400 mb-2">Error Processing Document</h2>
              <p className="text-red-200 mb-6">{extraction.error}</p>
              <button
                onClick={handleNewAnalysis}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {isSuccessState && extraction.results && (
          <div className="space-y-6">
            {/* Stats Bar */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <p className="text-slate-400 text-xs uppercase font-semibold mb-1">
                    Total Attacks
                  </p>
                  <p className="text-4xl font-bold text-blue-400">
                    {extraction.results.total_attacks}
                  </p>
                </div>

                {/* Severity breakdown */}
                {(() => {
                  const severityCounts = {
                    Major: 0,
                    Moderate: 0,
                    Minor: 0,
                    Niche: 0,
                  };
                  extraction.results.attacks.forEach((a) => {
                    severityCounts[a.severity]++;
                  });

                  return (
                    <>
                      <div>
                        <p className="text-slate-400 text-xs uppercase font-semibold mb-1">
                          Major
                        </p>
                        <p className="text-3xl font-bold text-red-400">{severityCounts.Major}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs uppercase font-semibold mb-1">
                          Moderate
                        </p>
                        <p className="text-3xl font-bold text-amber-400">
                          {severityCounts.Moderate}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs uppercase font-semibold mb-1">
                          Minor
                        </p>
                        <p className="text-3xl font-bold text-blue-400">
                          {severityCounts.Minor}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs uppercase font-semibold mb-1">
                          Niche
                        </p>
                        <p className="text-3xl font-bold text-slate-400">{severityCounts.Niche}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="border-t border-slate-700 mt-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-semibold mb-1">
                      Subject
                    </p>
                    <p className="text-slate-200">{extraction.results.subject}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-semibold mb-1">
                      Document
                    </p>
                    <p className="text-slate-200">{extraction.results.filename}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-semibold mb-1">
                      Job ID
                    </p>
                    <p className="text-slate-400 font-mono text-xs">
                      {extraction.results.job_id.substring(0, 12)}...
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left sidebar - Filters */}
              <div className="lg:col-span-1">
                <FilterBar
                  attacks={extraction.results.attacks}
                  filters={filters}
                  onFilterChange={setFilters}
                />
              </div>

              {/* Center - Results table */}
              <div className="lg:col-span-3">
                <ResultsTable
                  attacks={extraction.results.attacks}
                  filters={filters}
                />
              </div>
            </div>

            {/* Right sidebar - Universes */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1"></div>
              <div className="lg:col-span-3">
                <UniversePanel
                  attacks={extraction.results.attacks}
                  selectedUniverse={filters.universe}
                  onUniverseSelect={(universe) =>
                    setFilters({ ...filters, universe })
                  }
                />
              </div>
            </div>

            {/* Export and Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1"></div>
              <div className="lg:col-span-3 flex gap-4 justify-between items-center bg-slate-800 rounded-lg border border-slate-700 p-6">
                <ExportButton
                  jobId={extraction.results.job_id}
                  filename={extraction.results.filename}
                />

                <button
                  onClick={handleNewAnalysis}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg transition-colors"
                >
                  New Analysis
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
