import React, { useState, useEffect } from 'react';
import { useRunway } from '../context/RunwayContext';
import {
  Flame,
  Clock,
  PlusCircle,
  Database,
  AlertTriangle,
  Cloud,
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
    <header className="border-b border-slate-850 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3 transition-all font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Brand & Mission Tag */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 via-indigo-500 to-purple-600 p-[1.5px] flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400 text-sm tracking-wider">
                R'27
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg tracking-tight text-white flex items-center gap-2 font-mono">
                RUNWAY 2027
              </h1>
              {/* Cloud Sync Status Indicator */}
              <button
                type="button"
                onClick={onOpenCloudModal}
                title={`Click to configure AWS Lambda & DynamoDB settings. Status: ${cloudStatus}`}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all cursor-pointer ${
                  isCloudConnected
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                <span>{isCloudConnected ? 'AWS DynamoDB' : 'Local Storage'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Quantitative Systems &amp; Low-Latency Engineering Runway
            </p>
          </div>
        </div>

        {/* Controls & Metrics Bar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
          {/* T-Minus Clock */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono shadow-inner">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 text-[10px] uppercase">T-Minus:</span>
            <span className="text-white font-semibold">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
            </span>
          </div>

          {/* Daily Streak */}
          <div
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              isActiveToday
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10'
                : 'bg-slate-900/80 border-slate-800 text-slate-400'
            }`}
            title={
              isActiveToday
                ? "Streak intact! You've logged activity today."
                : 'Keep the streak alive: log at least 1 problem or HLD deliverable.'
            }
          >
            <Flame
              className={`w-3.5 h-3.5 ${
                isActiveToday ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-500'
              }`}
            />
            <div className="flex items-center gap-1">
              <span className="font-bold text-white text-xs">{streakCount}</span>
              <span className="text-[10px] text-slate-400 uppercase">Streak</span>
            </div>
          </div>

          {/* Overdue Queue Alert */}
          {overdueReviews.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-semibold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{overdueReviews.length} Overdue</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenLogModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/50 transition-all active:scale-95 cursor-pointer font-mono"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Problem</span>
            </button>

            <button
              onClick={onOpenCloudModal}
              title="AWS Cloud & Bot Shield Settings"
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isCloudConnected
                  ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/50'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              <Cloud className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenBackupModal}
              title="Backup / Restore JSON State"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
            >
              <Database className="w-4 h-4" />
            </button>

            {dsaProblems.length === 0 && (
              <button
                onClick={loadDemoData}
                title="Load sample grind history to explore all features"
                className="px-2.5 py-1.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/40 text-xs font-mono transition-all cursor-pointer"
              >
                Demo Data
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
