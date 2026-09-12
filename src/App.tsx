import React, { useState, useMemo } from 'react';
import { RunwayProvider, useRunway } from './context/RunwayContext';
import { Header } from './components/Header';
import { FrictionQueue } from './components/FrictionQueue';
import { PatternMatrix } from './components/DsaSection/PatternMatrix';
import { DsaProblemList } from './components/DsaSection/DsaProblemList';
import { HldRoadmap } from './components/HldSection/HldRoadmap';
import { DsaLoggerModal } from './components/DsaSection/DsaLoggerModal';
import { ExportImportModal } from './components/ExportImportModal';
import { CloudConfigModal } from './components/CloudConfigModal';
import type { PatternName } from './types';
import {
  Code2,
  Cpu,
  BrainCircuit,
  Terminal,
  Activity,
  Layers,
  Zap,
} from 'lucide-react';

type TabView = 'overview' | 'dsa' | 'hld' | 'queue';

const DashboardContent: React.FC = () => {
  const { dsaProblems, hldWeeks, refreshFromCloud } = useRunway();

  const [activeTab, setActiveTab] = useState<TabView>('overview');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [selectedProblemIdForModal, setSelectedProblemIdForModal] = useState<string | undefined>();
  const [selectedPatternFilter, setSelectedPatternFilter] = useState<PatternName | 'All'>('All');

  const handleOpenLogModal = (problemId?: string) => {
    setSelectedProblemIdForModal(problemId);
    setIsLogModalOpen(true);
  };

  // Compute Executive Readiness Metrics
  const metrics = useMemo(() => {
    const totalDsa = dsaProblems.length;
    const tier1Count = dsaProblems.filter((p) => p.struggleTier === 1).length;
    const tier2Count = dsaProblems.filter((p) => p.struggleTier === 2).length;
    const tier3Count = dsaProblems.filter((p) => p.struggleTier === 3).length;

    const coldSolveRate = totalDsa > 0 ? Math.round((tier1Count / totalDsa) * 100) : 0;
    const dsaProgressPct = Math.round((totalDsa / 75) * 100);

    const hldMastered = hldWeeks.filter((w) => w.status === 'mastered').length;
    const hldDiagrammed = hldWeeks.filter(
      (w) => w.status === 'diagrammed' || w.status === 'mastered'
    ).length;
    const hldProgressPct = Math.round((hldMastered / 16) * 100);

    const nowIso = new Date().toISOString();
    const pendingReviews = dsaProblems.filter((p) => p.reviewStatus === 'pending');
    const overdueCount = pendingReviews.filter(
      (p) => p.scheduledReviewDate && p.scheduledReviewDate <= nowIso
    ).length;

    // Readiness Score: Weighted composite (40% DSA progress, 30% Cold Solve accuracy, 30% HLD mastery)
    const rawScore =
      dsaProgressPct * 0.4 + coldSolveRate * 0.3 + (hldDiagrammed / 16) * 100 * 0.3;
    const readinessScore = Math.min(100, Math.max(0, Math.round(rawScore - overdueCount * 2)));

    return {
      totalDsa,
      tier1Count,
      tier2Count,
      tier3Count,
      coldSolveRate,
      dsaProgressPct,
      hldMastered,
      hldDiagrammed,
      hldProgressPct,
      pendingCount: pendingReviews.length,
      overdueCount,
      readinessScore,
    };
  }, [dsaProblems, hldWeeks]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation & Status */}
      <Header
        onOpenLogModal={() => handleOpenLogModal()}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Executive Stats Bar */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Quant Readiness Index */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Readiness Index</span>
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {metrics.readinessScore}%
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                Target: Jan 2027
              </span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                style={{ width: `${metrics.readinessScore}%` }}
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400"
              />
            </div>
          </div>

          {/* DSA Velocity */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>NeetCode Solved</span>
              <Code2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {metrics.totalDsa}
              </span>
              <span className="text-xs font-mono text-slate-500">/75 Curated</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">{metrics.tier1Count} Cold</span>
              <span>&bull;</span>
              <span className="text-amber-400">{metrics.tier2Count} Hints</span>
              <span>&bull;</span>
              <span className="text-rose-400">{metrics.tier3Count} Replay</span>
            </div>
          </div>

          {/* HLD Architectural Depth */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>System Design</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {metrics.hldMastered}
              </span>
              <span className="text-xs font-mono text-slate-500">/16 Mastered</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              <span className="text-indigo-400 font-semibold">{metrics.hldDiagrammed}</span> Diagrams
              drawn on Excalidraw
            </div>
          </div>

          {/* 48-Hour Friction Queue Debt */}
          <div
            onClick={() => setActiveTab('queue')}
            className={`p-3.5 rounded-xl border shadow-sm flex flex-col justify-between cursor-pointer transition-all hover:border-slate-700 ${
              metrics.overdueCount > 0
                ? 'bg-rose-950/20 border-rose-900/60 text-rose-200'
                : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className={metrics.overdueCount > 0 ? 'text-rose-300' : 'text-slate-400'}>
                Friction Debt
              </span>
              <Zap
                className={`w-4 h-4 ${
                  metrics.overdueCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'
                }`}
              />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {metrics.pendingCount}
              </span>
              <span className="text-xs font-mono text-slate-400">In Queue</span>
            </div>
            <div className="text-[11px] font-mono mt-1">
              {metrics.overdueCount > 0 ? (
                <span className="text-rose-400 font-bold animate-pulse">
                  {metrics.overdueCount} Overdue for Re-solve!
                </span>
              ) : (
                <span className="text-emerald-400">All reviews cleared!</span>
              )}
            </div>
          </div>
        </section>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 overflow-x-auto scrollbar-none font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Cockpit Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dsa')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'dsa'
                ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Track 1: NeetCode 150</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950 text-slate-400">
              {metrics.totalDsa}/75
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hld')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'hld'
                ? 'bg-slate-800 text-indigo-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Track 2: Alex Xu Systems</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950 text-slate-400">
              {metrics.hldMastered}/16
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-slate-800 text-rose-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>48-Hour Friction Queue</span>
            {metrics.overdueCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-bold animate-pulse">
                {metrics.overdueCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Cockpit Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* 48-Hour Friction Queue */}
            <FrictionQueue />

            {/* Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-6">
                <PatternMatrix
                  selectedPatternFilter={selectedPatternFilter}
                  onSelectPattern={setSelectedPatternFilter}
                />
                <DsaProblemList
                  selectedPatternFilter={selectedPatternFilter}
                  onLogProblemWithId={handleOpenLogModal}
                />
              </div>

              <div className="lg:col-span-5 space-y-6">
                <HldRoadmap />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Track 1 - DSA Full Focus */}
        {activeTab === 'dsa' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <PatternMatrix
              selectedPatternFilter={selectedPatternFilter}
              onSelectPattern={setSelectedPatternFilter}
            />
            <DsaProblemList
              selectedPatternFilter={selectedPatternFilter}
              onLogProblemWithId={handleOpenLogModal}
            />
          </div>
        )}

        {/* Tab 3: Track 2 - Alex Xu Systems Full Focus */}
        {activeTab === 'hld' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <HldRoadmap />
          </div>
        )}

        {/* Tab 4: 48-Hour Friction Queue Dedicated Focus */}
        {activeTab === 'queue' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <FrictionQueue />
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                <span>The 3-Tier Cognitive Invariant</span>
              </h3>
              <p className="leading-relaxed">
                Passive recall is the number one cause of algorithmic interview failure. When you solve a problem with hints (Tier 2) or watch a NeetCode solution (Tier 3), your brain establishes recognition, not generation. The 48-hour window forces your synaptic pathways to retrieve the pattern without crutches.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-850 bg-slate-950 py-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-500" />
            <span>
              Runway 2027 &bull; 100% AWS Serverless Native &bull; Always-Free Tier Architecture
            </span>
          </div>
          <div className="text-slate-400">
            Statistical Analysis &amp; Data Reconfiguration (Not a transponster).
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DsaLoggerModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        preselectedProblemId={selectedProblemIdForModal}
      />

      <ExportImportModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      <CloudConfigModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        onConnectionChanged={refreshFromCloud}
      />
    </div>
  );
};

export function App() {
  return (
    <RunwayProvider>
      <DashboardContent />
    </RunwayProvider>
  );
}

export default App;
