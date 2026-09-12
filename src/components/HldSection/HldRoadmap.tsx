import React, { useState } from 'react';
import { useRunway } from '../../context/RunwayContext';
import { HldWeekCard } from './HldWeekCard';
import type { HldStatus } from '../../types';
import { Layers, Filter } from 'lucide-react';

export const HldRoadmap: React.FC = () => {
  const { hldWeeks } = useRunway();
  const [activeMonthFilter, setActiveMonthFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<HldStatus | 'all'>('all');

  // Metrics
  const masteredCount = hldWeeks.filter((w) => w.status === 'mastered').length;
  const diagrammedCount = hldWeeks.filter(
    (w) => w.status === 'diagrammed' || w.status === 'mastered'
  ).length;
  const readingCount = hldWeeks.filter((w) => w.status === 'reading').length;

  const filteredWeeks = hldWeeks.filter((w) => {
    // Month filter
    if (activeMonthFilter !== 'all') {
      const startWeek = (activeMonthFilter - 1) * 4 + 1;
      const endWeek = activeMonthFilter * 4;
      if (w.weekNumber < startWeek || w.weekNumber > endWeek) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== 'all' && w.status !== statusFilter) {
      return false;
    }

    return true;
  });

  const months = [
    { num: 1, name: 'Month 1', label: 'Linear & Core Scale (W1-4)' },
    { num: 2, name: 'Month 2', label: 'Network & Ingestion (W5-8)' },
    { num: 3, name: 'Month 3', label: 'Notifications & Feeds (W9-12)' },
    { num: 4, name: 'Month 4', label: 'Media & Spatial Scale (W13-16)' },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
      {/* Header & Overall HLD Progress */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>ALEX XU HIGH-LEVEL SYSTEM DESIGN ROADMAP</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              16 Weeks &bull; Vol 1 (Ch 1-15) + Vol 2 Proximity Service &bull; Weekend Architectural Synthesis
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-emerald-400 font-semibold">{masteredCount}/16 Mastered</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-indigo-400">{diagrammedCount}/16 Diagrammed</span>
          </div>
        </div>

        {/* Multi-tier HLD Progress Bar */}
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mt-3 flex border border-slate-800">
          <div
            style={{ width: `${(masteredCount / 16) * 100}%` }}
            className="h-full bg-emerald-500 transition-all duration-300"
            title={`Mastered: ${masteredCount}`}
          />
          <div
            style={{
              width: `${
                ((diagrammedCount - masteredCount) / 16) * 100
              }%`,
            }}
            className="h-full bg-indigo-500 transition-all duration-300"
            title={`Diagrammed: ${diagrammedCount - masteredCount}`}
          />
          <div
            style={{ width: `${(readingCount / 16) * 100}%` }}
            className="h-full bg-blue-500 transition-all duration-300"
            title={`Reading: ${readingCount}`}
          />
        </div>
      </div>

      {/* Month Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
        <button
          onClick={() => setActiveMonthFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono shrink-0 transition-all cursor-pointer ${
            activeMonthFilter === 'all'
              ? 'bg-indigo-600 text-white font-bold shadow-sm'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          All 16 Weeks
        </button>
        {months.map((m) => (
          <button
            key={m.num}
            onClick={() => setActiveMonthFilter(m.num)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono shrink-0 transition-all cursor-pointer ${
              activeMonthFilter === m.num
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {m.name}: {m.label}
          </button>
        ))}
      </div>

      {/* Secondary Status Filter */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400 font-mono text-[11px]">Filter by Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2 py-1 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="mastered">Mastered</option>
            <option value="diagrammed">Diagrammed</option>
            <option value="reading">Reading</option>
            <option value="not_started">Not Started</option>
          </select>
        </div>

        <span className="text-[11px] font-mono text-slate-500">
          Showing {filteredWeeks.length} of 16 weeks
        </span>
      </div>

      {/* Accordion List of Weeks */}
      <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
        {filteredWeeks.map((week, idx) => (
          <HldWeekCard
            key={week.weekNumber}
            week={week}
            isInitiallyOpen={idx === 0 && activeMonthFilter !== 'all'}
          />
        ))}
      </div>
    </div>
  );
};
