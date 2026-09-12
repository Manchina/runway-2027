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
import { ExecutiveStats } from './components/Dashboard/ExecutiveStats';
import { AnalyticsCharts } from './components/Dashboard/AnalyticsCharts';
import type { PatternName } from './types';
import {
  Code2,
  Cpu,
  BrainCircuit,
  Terminal,
  Zap,
  LayoutDashboard,
} from 'lucide-react';

type TabView = 'overview' | 'dsa' | 'hld' | 'queue';

const DashboardContent: React.FC = () => {
  const { dsaProblems, hldWeeks, streakCount, refreshFromCloud } = useRunway();

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

    // Quant Readiness Score: 40% DSA progress, 30% Cold Solve accuracy, 30% HLD mastery, minus overdue penalty
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
      streakCount,
    };
  }, [dsaProblems, hldWeeks, streakCount]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Command Navigation */}
      <Header
        onOpenLogModal={() => handleOpenLogModal()}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Executive Stats KPIs */}
        <ExecutiveStats metrics={metrics} onSelectTab={setActiveTab} />

        {/* Tab Navigation Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none font-mono text-xs shadow-md">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            <span>Executive Cockpit</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dsa')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'dsa'
                ? 'bg-slate-800 text-emerald-400 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Track 1: NeetCode 150</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
              {metrics.totalDsa}/75
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hld')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'hld'
                ? 'bg-slate-800 text-indigo-400 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Track 2: Alex Xu Systems</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
              {metrics.hldMastered}/16
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-slate-800 text-rose-400 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-rose-400" />
            <span>48h Friction Queue</span>
            {metrics.overdueCount > 0 ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold animate-pulse border border-rose-500/40">
                {metrics.overdueCount} Due
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
                {metrics.pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Executive Cockpit Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 48-Hour Priority Friction Spotlight */}
            <FrictionQueue />

            {/* Cognitive Struggle & Difficulty Analytics */}
            <AnalyticsCharts dsaProblems={dsaProblems} hldWeeks={hldWeeks} />

            {/* Split Dual-Track Grid */}
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
          <div className="space-y-6 animate-in fade-in duration-200">
            <AnalyticsCharts dsaProblems={dsaProblems} hldWeeks={hldWeeks} />
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
          <div className="space-y-6 animate-in fade-in duration-200">
            <HldRoadmap />
          </div>
        )}

        {/* Tab 4: 48-Hour Friction Queue Dedicated Focus */}
        {activeTab === 'queue' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <FrictionQueue />
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-3 shadow-lg">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                <span>The 3-Tier Cognitive Invariant Protocol</span>
              </h3>
              <p className="leading-relaxed text-slate-400">
                Passive recall is the number one cause of algorithmic interview failure. When you solve a problem with hints (Tier 2) or watch a NeetCode solution (Tier 3), your brain establishes recognition, not generation. The 48-hour window forces your synaptic pathways to retrieve the pattern on a blank canvas without crutches.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-900/30">
                  <span className="text-emerald-400 font-bold block mb-1">Tier 1: Cold Solve</span>
                  <p className="text-slate-400">Solved without hints. Stored directly in long-term memory.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-amber-900/30">
                  <span className="text-amber-400 font-bold block mb-1">Tier 2: Hint Assisted</span>
                  <p className="text-slate-400">Auto-scheduled for blank canvas re-solve in 48 hours.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-rose-900/30">
                  <span className="text-rose-400 font-bold block mb-1">Tier 3: Video Replay</span>
                  <p className="text-slate-400">High passive risk. Mandatory 48h recall check.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-850/80 bg-slate-950/90 py-6 text-xs text-slate-500 font-mono">
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
