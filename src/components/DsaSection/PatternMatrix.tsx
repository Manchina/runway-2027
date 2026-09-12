import React from 'react';
import { useRunway } from '../../context/RunwayContext';
import { PATTERN_LIST, SYLLABUS_DSA_PROBLEMS } from '../../data/initialDsaCurriculum';
import type { PatternName } from '../../types';
import { CheckCircle2 } from 'lucide-react';

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

    return {
      pattern: pat,
      syllabusTotal,
      solvedCount,
      tier1Count,
      tier2Count,
      tier3Count,
      percentage,
    };
  });

  const overallSolved = dsaProblems.length;
  const overallTotal = SYLLABUS_DSA_PROBLEMS.length;
  const overallPct = Math.round((overallSolved / overallTotal) * 100);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
      {/* Matrix Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <span>PATTERN COMPLETION MATRIX</span>
            <span className="text-xs font-mono font-normal text-slate-400">
              ({overallSolved}/{overallTotal} curated &bull; {overallPct}%)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Progress across 12 algorithmic patterns. Click a pattern to filter problems.
          </p>
        </div>

        {selectedPatternFilter !== 'All' && (
          <button
            onClick={() => onSelectPattern('All')}
            className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
          >
            Show All Patterns
          </button>
        )}
      </div>

      {/* Pattern Grid / Progress List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {patternStats.map((stat) => {
          const isSelected = selectedPatternFilter === stat.pattern;
          return (
            <div
              key={stat.pattern}
              onClick={() => onSelectPattern(isSelected ? 'All' : stat.pattern)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-slate-800/90 border-indigo-500 ring-1 ring-indigo-500/50'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-200 truncate pr-2">
                  {stat.pattern}
                </span>
                <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                  <span className="text-white font-bold">{stat.solvedCount}</span>
                  <span className="text-slate-500">/{stat.syllabusTotal}</span>
                  <span
                    className={`font-semibold ml-1 ${
                      stat.percentage === 100
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
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                {stat.syllabusTotal > 0 && (
                  <>
                    <div
                      style={{
                        width: `${(stat.tier1Count / stat.syllabusTotal) * 100}%`,
                      }}
                      className="h-full bg-emerald-500"
                      title={`Tier 1: ${stat.tier1Count}`}
                    />
                    <div
                      style={{
                        width: `${(stat.tier2Count / stat.syllabusTotal) * 100}%`,
                      }}
                      className="h-full bg-amber-500"
                      title={`Tier 2: ${stat.tier2Count}`}
                    />
                    <div
                      style={{
                        width: `${(stat.tier3Count / stat.syllabusTotal) * 100}%`,
                      }}
                      className="h-full bg-rose-500"
                      title={`Tier 3: ${stat.tier3Count}`}
                    />
                  </>
                )}
              </div>

              {/* Tier counts legend pill */}
              <div className="flex items-center justify-between text-[10px] font-mono mt-1.5 text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5 text-emerald-400/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    {stat.tier1Count}
                  </span>
                  <span className="flex items-center gap-0.5 text-amber-400/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                    {stat.tier2Count}
                  </span>
                  <span className="flex items-center gap-0.5 text-rose-400/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                    {stat.tier3Count}
                  </span>
                </div>

                {stat.percentage === 100 && (
                  <span className="text-emerald-400 flex items-center gap-0.5">
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
        <span className="text-slate-500">Struggle Legend:</span>
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
