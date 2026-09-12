import React from 'react';
import { useRunway } from '../../context/RunwayContext';
import { PATTERN_LIST, SYLLABUS_DSA_PROBLEMS } from '../../data/initialDsaCurriculum';
import type { PatternName } from '../../types';
import { CheckCircle2, LayoutGrid, Sparkles } from 'lucide-react';

interface PatternMatrixProps {
  selectedPatternFilter: PatternName | 'All';
  onSelectPattern: (pattern: PatternName | 'All') => void;
}

export const PatternMatrix: React.FC<PatternMatrixProps> = ({
  selectedPatternFilter,
  onSelectPattern,
}) => {
  const { dsaProblems } = useRunway();

  // Pre-calculate stats per pattern
  const patternStats = PATTERN_LIST.map((pat) => {
    const syllabusTotal = SYLLABUS_DSA_PROBLEMS.filter((p) => p.pattern === pat).length;
    const logged = dsaProblems.filter((p) => p.pattern === pat);
    const tier1Count = logged.filter((p) => p.struggleTier === 1).length;
    const tier2Count = logged.filter((p) => p.struggleTier === 2).length;
    const tier3Count = logged.filter((p) => p.struggleTier === 3).length;
    const solvedCount = logged.length;
    const percentage = syllabusTotal > 0 ? Math.min(100, Math.round((solvedCount / syllabusTotal) * 100)) : 0;
    const isCompleted = percentage === 100 && solvedCount >= syllabusTotal;

    return {
      pattern: pat,
      syllabusTotal,
      solvedCount,
      tier1Count,
      tier2Count,
      tier3Count,
      percentage,
      isCompleted,
    };
  });

  const overallSolved = dsaProblems.length;
  const overallTotal = SYLLABUS_DSA_PROBLEMS.length;
  const overallPct = Math.round((overallSolved / overallTotal) * 100);
  const clearedPatterns = patternStats.filter((p) => p.isCompleted).length;

  return (
    <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
      {/* Matrix Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                Algorithmic Pattern Matrix
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                {clearedPatterns}/12 Patterns Cleared
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Select any pattern to filter problem list &bull; Segmented by cognitive recall tier
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-white font-bold">{overallSolved}</span>
          <span className="text-slate-500">/ {overallTotal} ({overallPct}%)</span>
          {selectedPatternFilter !== 'All' && (
            <button
              onClick={() => onSelectPattern('All')}
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all cursor-pointer ml-1"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Pattern Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {patternStats.map((stat) => {
          const isSelected = selectedPatternFilter === stat.pattern;
          return (
            <div
              key={stat.pattern}
              onClick={() => onSelectPattern(isSelected ? 'All' : stat.pattern)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none group relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-800/90 border-indigo-500 ring-1 ring-indigo-500/50 shadow-md shadow-indigo-950/40'
                  : stat.isCompleted
                  ? 'bg-slate-950/60 border-emerald-900/40 hover:border-emerald-700/60'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className={`font-semibold truncate pr-2 ${isSelected ? 'text-indigo-200' : 'text-slate-200'}`}>
                  {stat.pattern}
                </span>
                <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                  <span className="text-white font-bold">{stat.solvedCount}</span>
                  <span className="text-slate-500">/{stat.syllabusTotal}</span>
                  <span
                    className={`font-semibold ml-1 ${
                      stat.isCompleted
                        ? 'text-emerald-400'
                        : stat.percentage > 0
                        ? 'text-indigo-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {stat.percentage}%
                  </span>
                </div>
              </div>

              {/* Segmented Progress Bar: Tier 1 (Emerald), Tier 2 (Amber), Tier 3 (Rose) */}
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800/80">
                {stat.syllabusTotal > 0 && (
                  <>
                    <div
                      style={{
                        width: `${(stat.tier1Count / stat.syllabusTotal) * 100}%`,
                      }}
                      className="h-full bg-emerald-500 transition-all duration-300"
                      title={`Tier 1 Cold: ${stat.tier1Count}`}
                    />
                    <div
                      style={{
                        width: `${(stat.tier2Count / stat.syllabusTotal) * 100}%`,
                      }}
                      className="h-full bg-amber-500 transition-all duration-300"
                      title={`Tier 2 Hints: ${stat.tier2Count}`}
                    />
                    <div
                      style={{
                        width: `${(stat.tier3Count / stat.syllabusTotal) * 100}%`,
                      }}
                      className="h-full bg-rose-500 transition-all duration-300"
                      title={`Tier 3 Replay: ${stat.tier3Count}`}
                    />
                  </>
                )}
              </div>

              {/* Tier counts legend pill */}
              <div className="flex items-center justify-between text-[10px] font-mono mt-2 text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {stat.tier1Count}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {stat.tier2Count}
                  </span>
                  <span className="flex items-center gap-1 text-rose-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {stat.tier3Count}
                  </span>
                </div>

                {stat.isCompleted && (
                  <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Cleared
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend Indicator */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
        <span className="text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Struggle Legend:
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Tier 1 (Cold Solve)
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Tier 2 (Hint Assisted)
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Tier 3 (Video Replay)
          </span>
        </div>
      </div>
    </div>
  );
};
