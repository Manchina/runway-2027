import React, { useState } from 'react';
import { useRunway } from '../context/RunwayContext';
import type { DsaProblemEntry } from '../types';
import {
  AlertCircle,
  CheckCircle,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  FileText,
} from 'lucide-react';

export const FrictionQueue: React.FC = () => {
  const { dsaProblems, markProblemCleared, failProblemReview } = useRunway();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedNotesId, setSelectedNotesId] = useState<string | null>(null);

  const pendingProblems = dsaProblems.filter((p) => p.reviewStatus === 'pending');

  const now = new Date();
  const dueProblems: DsaProblemEntry[] = [];
  const upcomingProblems: DsaProblemEntry[] = [];

  pendingProblems.forEach((p) => {
    if (!p.scheduledReviewDate) {
      dueProblems.push(p);
    } else {
      const reviewDate = new Date(p.scheduledReviewDate);
      if (reviewDate <= now) {
        dueProblems.push(p);
      } else {
        upcomingProblems.push(p);
      }
    }
  });

  // Sort due problems by scheduledReviewDate ascending (most overdue first)
  dueProblems.sort((a, b) => {
    const da = a.scheduledReviewDate ? new Date(a.scheduledReviewDate).getTime() : 0;
    const db = b.scheduledReviewDate ? new Date(b.scheduledReviewDate).getTime() : 0;
    return da - db;
  });

  const formatDueTime = (dateStr: string | null) => {
    if (!dateStr) return 'Due now';
    const target = new Date(dateStr);
    const diffMs = target.getTime() - now.getTime();
    if (diffMs <= 0) {
      const hoursOverdue = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
      return hoursOverdue > 0 ? `${hoursOverdue}h overdue` : 'Due now';
    }
    const hoursRemaining = Math.ceil(diffMs / (1000 * 60 * 60));
    return `In ${hoursRemaining}h`;
  };

  if (pendingProblems.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">
                48-Hour Friction Queue: All Clear
              </h2>
              <p className="text-xs text-slate-400">
                Zero deliberate struggle debt. Any problem solved with hints (Tier 2) or video solutions (Tier 3) will automatically queue here for mandatory 48-hour recall.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400/80 bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clean Runway</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl shadow-black/20">
      {/* Header Banner */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/20 border-b border-slate-800 flex items-center justify-between cursor-pointer select-none hover:bg-slate-850 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg border ${
              dueProblems.length > 0
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                48-HOUR FRICTION QUEUE
              </h2>
              {dueProblems.length > 0 ? (
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  {dueProblems.length} DUE FOR BLANK-CANVAS SOLVE
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[11px] font-mono rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {upcomingProblems.length} Scheduled
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Enforcing the Anti-Passive Rule: Re-solve Tier 2 &amp; Tier 3 problems from memory without hints.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-slate-400 hidden sm:block">
            {dueProblems.length} due &bull; {upcomingProblems.length} queued
          </div>
          <button
            type="button"
            className="p-1 rounded text-slate-400 hover:text-slate-200"
            aria-label="Toggle queue expansion"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Queue Body */}
      {isExpanded && (
        <div className="p-4 divide-y divide-slate-800/80">
          {/* Due Problems Section */}
          {dueProblems.length > 0 && (
            <div className="space-y-2 pb-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5 mb-2">
                <Clock className="w-3 h-3 text-rose-400" />
                <span>Action Required &mdash; Resolve Without Opening Hints</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dueProblems.map((problem) => (
                  <div
                    key={problem.id}
                    className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/50 hover:border-rose-700/60 transition-all flex flex-col justify-between gap-2.5 group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                            #{problem.leetcodeNumber}
                          </span>
                          <span className="text-xs font-medium text-slate-200 line-clamp-1">
                            {problem.title}
                          </span>
                        </div>
                        <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {formatDueTime(problem.scheduledReviewDate)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {problem.pattern}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                            problem.struggleTier === 2
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {problem.struggleTier === 2 ? 'Tier 2 (Hints)' : 'Tier 3 (Replay)'}
                        </span>
                        {problem.notes && (
                          <button
                            onClick={() =>
                              setSelectedNotesId(
                                selectedNotesId === problem.id ? null : problem.id
                              )
                            }
                            className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                            title="View problem notes"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Notes</span>
                          </button>
                        )}
                      </div>

                      {selectedNotesId === problem.id && problem.notes && (
                        <div className="mt-2 p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap">
                          {problem.notes}
                        </div>
                      )}
                    </div>

                    {/* Actions: LeetCode link + Mark Cleared + Fail Review */}
                    <div className="flex items-center justify-between pt-2 border-t border-rose-950/60 mt-1">
                      <a
                        href={problem.leetcodeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
                      >
                        <span>Open Problem</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => failProblemReview(problem.id)}
                          title="Failed to solve cleanly. Reschedule for +24 hours to retry."
                          className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Fail (+24h)</span>
                        </button>
                        <button
                          onClick={() => markProblemCleared(problem.id)}
                          title="Solved cleanly on blank canvas! Mark this review cleared."
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Mark Cleared</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Problems Section */}
          {upcomingProblems.length > 0 && (
            <div className={`space-y-2 ${dueProblems.length > 0 ? 'pt-4' : ''}`}>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Upcoming Spaced Repetition ({upcomingProblems.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {upcomingProblems.map((problem) => (
                  <div
                    key={problem.id}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-mono text-xs font-semibold text-slate-300">
                          #{problem.leetcodeNumber}
                        </span>
                        <span className="text-xs text-slate-400 truncate">{problem.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {problem.pattern}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {formatDueTime(problem.scheduledReviewDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <a
                        href={problem.leetcodeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded text-slate-500 hover:text-slate-300"
                        title="Open on LeetCode"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => markProblemCleared(problem.id)}
                        className="p-1 rounded text-slate-500 hover:text-emerald-400"
                        title="Clear review early"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
