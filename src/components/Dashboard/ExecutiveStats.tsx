import React from 'react';
import { Activity, Code2, Layers, Zap, ArrowUpRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { TOTAL_DSA_PROBLEMS } from '../../data/initialDsaCurriculum';

export interface ExecutiveMetrics {
  totalDsa: number;
  tier1Count: number;
  tier2Count: number;
  tier3Count: number;
  coldSolveRate: number;
  dsaProgressPct: number;
  hldMastered: number;
  hldDiagrammed: number;
  hldProgressPct: number;
  pendingCount: number;
  overdueCount: number;
  readinessScore: number;
  streakCount: number;
}

interface ExecutiveStatsProps {
  metrics: ExecutiveMetrics;
  onSelectTab: (tab: 'overview' | 'dsa' | 'hld' | 'queue') => void;
}

export const ExecutiveStats: React.FC<ExecutiveStatsProps> = ({ metrics, onSelectTab }) => {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'from-emerald-400 to-teal-300 text-emerald-400';
    if (score >= 45) return 'from-indigo-400 to-cyan-300 text-indigo-400';
    if (score >= 20) return 'from-amber-400 to-yellow-300 text-amber-400';
    return 'from-rose-400 to-orange-300 text-rose-400';
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Quant Readiness Index */}
      <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 p-4 shadow-lg hover:border-slate-700 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold uppercase tracking-wider">Readiness Score</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            Weighted Index
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight bg-gradient-to-r ${getScoreColor(metrics.readinessScore)} bg-clip-text text-transparent`}>
              {metrics.readinessScore}%
            </span>
            <span className="text-xs font-mono text-slate-500">/ 100</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Jan 2027 Pivot
            </span>
            <span className="text-[10px] font-mono text-slate-500 block">
              {metrics.coldSolveRate}% Cold Recall
            </span>
          </div>
        </div>

        {/* Multi-tier composite progress line */}
        <div className="w-full h-1.5 bg-slate-950 rounded-full mt-3 overflow-hidden border border-slate-800 flex">
          <div
            style={{ width: `${metrics.readinessScore}%` }}
            className="h-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400 transition-all duration-500 rounded-full"
          />
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-850 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>DSA: {metrics.dsaProgressPct}%</span>
          <span>&bull;</span>
          <span>HLD: {metrics.hldProgressPct}%</span>
          <span>&bull;</span>
          <span className={metrics.overdueCount > 0 ? 'text-rose-400' : 'text-emerald-400'}>
            Debt: -{metrics.overdueCount * 2}%
          </span>
        </div>
      </div>

      {/* 2. NeetCode 150 Solved */}
      <div
        onClick={() => onSelectTab('dsa')}
        className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 p-4 shadow-lg hover:border-emerald-500/40 transition-all duration-300 cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold uppercase tracking-wider">NeetCode Track</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {metrics.totalDsa}
            </span>
            <span className="text-xs font-mono text-slate-500">/ {TOTAL_DSA_PROBLEMS} Curated</span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {metrics.dsaProgressPct}% Done
          </span>
        </div>

        {/* Tier Distribution Mini Bar */}
        <div className="w-full h-1.5 bg-slate-950 rounded-full mt-3 overflow-hidden border border-slate-800 flex">
          {metrics.totalDsa > 0 ? (
            <>
              <div
                style={{ width: `${(metrics.tier1Count / TOTAL_DSA_PROBLEMS) * 100}%` }}
                className="h-full bg-emerald-500"
                title={`Tier 1 Cold: ${metrics.tier1Count}`}
              />
              <div
                style={{ width: `${(metrics.tier2Count / TOTAL_DSA_PROBLEMS) * 100}%` }}
                className="h-full bg-amber-500"
                title={`Tier 2 Hints: ${metrics.tier2Count}`}
              />
              <div
                style={{ width: `${(metrics.tier3Count / TOTAL_DSA_PROBLEMS) * 100}%` }}
                className="h-full bg-rose-500"
                title={`Tier 3 Replay: ${metrics.tier3Count}`}
              />
            </>
          ) : (
            <div className="w-full h-full bg-slate-800" />
          )}
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-850 flex items-center justify-between text-[11px] font-mono">
          <span className="text-emerald-400 font-semibold">{metrics.tier1Count} Cold</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-amber-400">{metrics.tier2Count} Hints</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-rose-400">{metrics.tier3Count} Replay</span>
        </div>
      </div>

      {/* 3. System Design Mastery */}
      <div
        onClick={() => onSelectTab('hld')}
        className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 p-4 shadow-lg hover:border-indigo-500/40 transition-all duration-300 cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold uppercase tracking-wider">System Design</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {metrics.hldMastered}
            </span>
            <span className="text-xs font-mono text-slate-500">/ 16 Mastered</span>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-400">
            {metrics.hldProgressPct}% Mastered
          </span>
        </div>

        {/* HLD Progress Bar */}
        <div className="w-full h-1.5 bg-slate-950 rounded-full mt-3 overflow-hidden border border-slate-800 flex">
          <div
            style={{ width: `${(metrics.hldMastered / 16) * 100}%` }}
            className="h-full bg-emerald-500"
          />
          <div
            style={{
              width: `${Math.max(0, ((metrics.hldDiagrammed - metrics.hldMastered) / 16) * 100)}%`,
            }}
            className="h-full bg-indigo-500"
          />
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-850 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="text-indigo-300 font-semibold">{metrics.hldDiagrammed} Diagrams</span>
          <span>&bull;</span>
          <span>16 Weeks</span>
          <span>&bull;</span>
          <span className="text-slate-300">Alex Xu V1+V2</span>
        </div>
      </div>

      {/* 4. 48-Hour Friction Queue Debt */}
      <div
        onClick={() => onSelectTab('queue')}
        className={`relative group overflow-hidden rounded-2xl border p-4 shadow-lg transition-all duration-300 cursor-pointer ${
          metrics.overdueCount > 0
            ? 'bg-gradient-to-b from-rose-950/40 to-slate-950/90 border-rose-900/60 hover:border-rose-500/60'
            : 'bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-slate-800/80 hover:border-amber-500/40'
        }`}
      >
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
          metrics.overdueCount > 0 ? 'bg-rose-500/10' : 'bg-amber-500/5'
        }`} />
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <Zap className={`w-4 h-4 ${metrics.overdueCount > 0 ? 'text-rose-400' : 'text-amber-400'}`} />
            <span className={`font-semibold uppercase tracking-wider ${metrics.overdueCount > 0 ? 'text-rose-300' : 'text-slate-400'}`}>
              Friction Debt
            </span>
          </div>
          {metrics.overdueCount > 0 ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-bold animate-pulse">
              URGENT
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
              Spaced Recall
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {metrics.pendingCount}
            </span>
            <span className="text-xs font-mono text-slate-500">In Queue</span>
          </div>
          {metrics.overdueCount > 0 ? (
            <span className="text-xs font-mono font-bold text-rose-400 animate-pulse flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              {metrics.overdueCount} Overdue
            </span>
          ) : (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Clear
            </span>
          )}
        </div>

        {/* Friction queue bar */}
        <div className="w-full h-1.5 bg-slate-950 rounded-full mt-3 overflow-hidden border border-slate-800 flex">
          <div
            style={{
              width: `${Math.min(100, metrics.pendingCount * 15)}%`,
            }}
            className={`h-full ${
              metrics.overdueCount > 0
                ? 'bg-rose-500 animate-pulse'
                : metrics.pendingCount > 0
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
          />
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-850 flex items-center justify-between text-[11px] font-mono">
          <span className={metrics.overdueCount > 0 ? 'text-rose-300 font-bold' : 'text-slate-400'}>
            {metrics.overdueCount > 0 ? '48h Window Expired' : 'No Overdue Backlog'}
          </span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-slate-400">Blank Canvas</span>
        </div>
      </div>
    </section>
  );
};
