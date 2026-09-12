import React, { useState, useEffect } from 'react';
import { useRunway } from '../context/RunwayContext';
import {
  Flame,
  Clock,
  Plus,
  Database,
  Zap,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onOpenLogModal: () => void;
  onOpenBackupModal: () => void;
  onOpenCloudModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLogModal,
  onOpenBackupModal,
  onOpenCloudModal,
}) => {
  const {
    dsaProblems,
    streakCount,
    lastCompletedDate,
    loadDemoData,
    isCloudConnected,
    cloudStatus,
  } = useRunway();

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2027-01-01T00:00:00Z').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingReviews = dsaProblems.filter((p) => p.reviewStatus === 'pending');
  const nowIso = new Date().toISOString();
  const overdueReviews = pendingReviews.filter(
    (p) => p.scheduledReviewDate && p.scheduledReviewDate <= nowIso
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const isActiveToday = lastCompletedDate === todayStr;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Brand & Mission */}
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/10">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <span className="font-mono font-black text-xs bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
                    R27
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base tracking-tight text-white font-mono flex items-center gap-1.5">
                  RUNWAY 2027
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                  v2.0 Command Deck
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Dual-Track Algorithmic Recall &amp; Distributed Systems Engineering
              </p>
            </div>
          </div>

          {/* Mobile Streak & Overdue Badge */}
          <div className="flex items-center gap-2 md:hidden font-mono text-xs">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${
              isActiveToday ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              <Flame className={`w-3.5 h-3.5 ${isActiveToday ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="font-bold">{streakCount}d</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Real-Time Status Deck */}
        <div className="flex flex-wrap items-center gap-2 justify-between md:justify-end">
          {/* T-Minus Countdown */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono shadow-sm"
            title="Countdown to January 1, 2027 quantitative engineering pivot milestone"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-500 text-[10px] uppercase font-semibold">T-MINUS</span>
            <span className="text-white font-bold tracking-tight">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </span>
          </div>

          {/* Daily Streak Counter */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              isActiveToday
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-sm shadow-amber-500/5'
                : 'bg-slate-900/90 border-slate-800 text-slate-400'
            }`}
            title={
              isActiveToday
                ? `Streak active! (${streakCount} days logged)`
                : 'Log at least 1 solve today to keep the streak alive!'
            }
          >
            <Flame
              className={`w-3.5 h-3.5 ${
                isActiveToday ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-500'
              }`}
            />
            <div className="flex items-center gap-1">
              <span className="font-bold text-white text-xs">{streakCount}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Day Streak</span>
            </div>
          </div>

          {/* Overdue Alert Badge */}
          {overdueReviews.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold animate-pulse">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>{overdueReviews.length} Overdue</span>
            </div>
          )}

          {/* Cloud Status Pill */}
          <button
            type="button"
            onClick={onOpenCloudModal}
            title={`Cloud connection status: ${cloudStatus}. Click to configure.`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
              isCloudConnected
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="text-[11px] font-semibold">{isCloudConnected ? 'DynamoDB' : 'Offline'}</span>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {dsaProblems.length === 0 && (
              <button
                onClick={loadDemoData}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/40 text-xs font-mono flex items-center gap-1 transition-all cursor-pointer"
                title="Load sample grind history"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Demo Data</span>
              </button>
            )}

            <button
              onClick={onOpenBackupModal}
              title="Backup & Restore JSON"
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Primary Action: Log Solve */}
            <button
              onClick={onOpenLogModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold font-mono shadow-md shadow-emerald-950/60 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Solve</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
