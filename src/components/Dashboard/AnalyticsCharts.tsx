import React from 'react';
import type { DsaProblemEntry, HldWeekEntry } from '../../types';
import { SYLLABUS_DSA_PROBLEMS, TOTAL_DSA_PROBLEMS } from '../../data/initialDsaCurriculum';
import { BrainCircuit, Target, CheckCircle2, TrendingUp, Sparkles, Layers } from 'lucide-react';

interface AnalyticsChartsProps {
  dsaProblems: DsaProblemEntry[];
  hldWeeks: HldWeekEntry[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ dsaProblems, hldWeeks }) => {
  const totalSolved = dsaProblems.length;
  const tier1 = dsaProblems.filter((p) => p.struggleTier === 1).length;
  const tier2 = dsaProblems.filter((p) => p.struggleTier === 2).length;
  const tier3 = dsaProblems.filter((p) => p.struggleTier === 3).length;

  const tier1Pct = totalSolved > 0 ? Math.round((tier1 / totalSolved) * 100) : 0;
  const tier2Pct = totalSolved > 0 ? Math.round((tier2 / totalSolved) * 100) : 0;
  const tier3Pct = totalSolved > 0 ? Math.round((tier3 / totalSolved) * 100) : 0;

  // Difficulty counts
  const easyTotal = SYLLABUS_DSA_PROBLEMS.filter((p) => p.difficulty === 'Easy').length;
  const medTotal = SYLLABUS_DSA_PROBLEMS.filter((p) => p.difficulty === 'Medium').length;
  const hardTotal = SYLLABUS_DSA_PROBLEMS.filter((p) => p.difficulty === 'Hard').length;

  const easySolved = dsaProblems.filter((p) => p.difficulty === 'Easy').length;
  const medSolved = dsaProblems.filter((p) => p.difficulty === 'Medium').length;
  const hardSolved = dsaProblems.filter((p) => p.difficulty === 'Hard').length;

  const easyPct = easyTotal > 0 ? Math.round((easySolved / easyTotal) * 100) : 0;
  const medPct = medTotal > 0 ? Math.round((medSolved / medTotal) * 100) : 0;
  const hardPct = hardTotal > 0 ? Math.round((hardSolved / hardTotal) * 100) : 0;

  // HLD 4 Phases Breakdown
  const phases = [
    {
      name: 'Phase 1: Linear & Core Scale',
      weeks: 'W1 - W4',
      items: hldWeeks.filter((w) => w.weekNumber >= 1 && w.weekNumber <= 4),
      badge: 'Ch 1-4',
    },
    {
      name: 'Phase 2: Network & Ingestion',
      weeks: 'W5 - W8',
      items: hldWeeks.filter((w) => w.weekNumber >= 5 && w.weekNumber <= 8),
      badge: 'Ch 5-8',
    },
    {
      name: 'Phase 3: Notifications & Feeds',
      weeks: 'W9 - W12',
      items: hldWeeks.filter((w) => w.weekNumber >= 9 && w.weekNumber <= 12),
      badge: 'Ch 9-12',
    },
    {
      name: 'Phase 4: Media & Spatial Scale',
      weeks: 'W13 - W16',
      items: hldWeeks.filter((w) => w.weekNumber >= 13 && w.weekNumber <= 16),
      badge: 'Ch 13-16 + V2',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* 1. Cognitive Struggle Distribution Deck */}
      <div className="lg:col-span-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                  Cognitive Struggle Breakdown
                </h3>
                <p className="text-[11px] text-slate-400">
                  Deliberate recall vs hint crutches across {totalSolved} logged solves
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {tier1Pct}% Cold
            </span>
          </div>

          {/* Stacked Visual Bar */}
          <div className="mt-4 w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex shadow-inner">
            {totalSolved > 0 ? (
              <>
                <div
                  style={{ width: `${tier1Pct}%` }}
                  className="h-full bg-emerald-500 transition-all duration-500"
                  title={`Tier 1 Cold: ${tier1} (${tier1Pct}%)`}
                />
                <div
                  style={{ width: `${tier2Pct}%` }}
                  className="h-full bg-amber-500 transition-all duration-500"
                  title={`Tier 2 Hints: ${tier2} (${tier2Pct}%)`}
                />
                <div
                  style={{ width: `${tier3Pct}%` }}
                  className="h-full bg-rose-500 transition-all duration-500"
                  title={`Tier 3 Replay: ${tier3} (${tier3Pct}%)`}
                />
              </>
            ) : (
              <div className="w-full h-full bg-slate-800" />
            )}
          </div>

          {/* Three Tier Cards */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {/* Tier 1 */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-emerald-900/30 text-center">
              <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Tier 1 Cold
              </div>
              <div className="text-lg font-black font-mono text-white mt-1">{tier1}</div>
              <div className="text-[10px] font-mono text-slate-400">{tier1Pct}% of solves</div>
            </div>

            {/* Tier 2 */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-amber-900/30 text-center">
              <div className="text-[10px] font-mono text-amber-400 font-bold uppercase flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Tier 2 Hints
              </div>
              <div className="text-lg font-black font-mono text-white mt-1">{tier2}</div>
              <div className="text-[10px] font-mono text-slate-400">{tier2Pct}% of solves</div>
            </div>

            {/* Tier 3 */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-rose-900/30 text-center">
              <div className="text-[10px] font-mono text-rose-400 font-bold uppercase flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Tier 3 Replay
              </div>
              <div className="text-lg font-black font-mono text-white mt-1">{tier3}</div>
              <div className="text-[10px] font-mono text-slate-400">{tier3Pct}% of solves</div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span className="text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Target: &gt;70% Tier 1 Cold Rate
          </span>
          <span className="text-slate-500">Auto 48h Spaced Recalls</span>
        </div>
      </div>

      {/* 2. Difficulty Breakdown Deck */}
      <div className="lg:col-span-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                  Difficulty Mastery Arc
                </h3>
                <p className="text-[11px] text-slate-400">
                  NeetCode 150 curated syllabus breakdown
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {easySolved + medSolved + hardSolved} / {TOTAL_DSA_PROBLEMS} Curated
            </span>
          </div>

          {/* Difficulty Bars */}
          <div className="mt-4 space-y-3 font-mono text-xs">
            {/* Easy */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Easy
                </span>
                <span className="text-slate-300">
                  {easySolved} / {easyTotal} <span className="text-slate-500">({easyPct}%)</span>
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${easyPct}%` }}
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Medium
                </span>
                <span className="text-slate-300">
                  {medSolved} / {medTotal} <span className="text-slate-500">({medPct}%)</span>
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${medPct}%` }}
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  Hard
                </span>
                <span className="text-slate-300">
                  {hardSolved} / {hardTotal} <span className="text-slate-500">({hardPct}%)</span>
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${hardPct}%` }}
                  className="h-full bg-rose-400 rounded-full transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span className="text-indigo-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Medium-Heavy Focus: {medTotal} Core Problems
          </span>
          <span className="text-slate-400">FAANG/Quant Caliber</span>
        </div>
      </div>

      {/* 3. 16-Week Phase Velocity Tracker */}
      <div className="lg:col-span-12 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                16-Week Milestone Progression
              </h3>
              <p className="text-[11px] text-slate-400">
                System Design Synthesis across Alex Xu Vol 1 &amp; Vol 2
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {hldWeeks.filter((w) => w.status === 'mastered').length} / 16 Mastered
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {phases.map((phase, idx) => {
            const masteredInPhase = phase.items.filter((w) => w.status === 'mastered').length;
            const diagrammedInPhase = phase.items.filter(
              (w) => w.status === 'diagrammed' || w.status === 'mastered'
            ).length;
            const pct = Math.round((masteredInPhase / 4) * 100);

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/40 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {phase.weeks}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-white">
                    {masteredInPhase}/4 Done
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 truncate">{phase.name}</h4>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 flex">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full bg-emerald-500 transition-all duration-300"
                  />
                  <div
                    style={{
                      width: `${Math.max(0, ((diagrammedInPhase - masteredInPhase) / 4) * 100)}%`,
                    }}
                    className="h-full bg-indigo-500 transition-all duration-300"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                  <span>{diagrammedInPhase} Diagrams</span>
                  <span>{phase.badge}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
