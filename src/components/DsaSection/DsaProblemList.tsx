import React, { useState } from 'react';
import { useRunway } from '../../context/RunwayContext';
import { SYLLABUS_DSA_PROBLEMS } from '../../data/initialDsaCurriculum';
import type { PatternName } from '../../types';
import {
  ExternalLink,
  Search,
  CheckCircle,
  AlertTriangle,
  Tv,
  Plus,
  Trash2,
  FileText,
  Clock,
  Filter,
} from 'lucide-react';

interface DsaProblemListProps {
  selectedPatternFilter: PatternName | 'All';
  onLogProblemWithId: (problemId: string) => void;
}

export const DsaProblemList: React.FC<DsaProblemListProps> = ({
  selectedPatternFilter,
  onLogProblemWithId,
}) => {
  const { dsaProblems, deleteDsaProblem } = useRunway();

  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'unsolved' | '1' | '2' | '3' | 'pending'>(
    'all'
  );
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);

  // Map syllabus problems merged with logged data
  const loggedMap = new Map(dsaProblems.map((p) => [p.leetcodeNumber, p]));

  // Combine syllabus problems and any custom logged problems
  const customProblems = dsaProblems.filter(
    (p) => !SYLLABUS_DSA_PROBLEMS.some((s) => s.leetcodeNumber === p.leetcodeNumber)
  );

  const allItems = [
    ...SYLLABUS_DSA_PROBLEMS.map((s) => {
      const logged = loggedMap.get(s.leetcodeNumber);
      return {
        id: s.id,
        title: s.title,
        leetcodeNumber: s.leetcodeNumber,
        pattern: s.pattern,
        leetcodeUrl: s.leetcodeUrl,
        difficulty: s.difficulty,
        weekNumber: s.weekNumber,
        isCustom: false,
        loggedEntry: logged || null,
      };
    }),
    ...customProblems.map((c) => ({
      id: c.id,
      title: c.title,
      leetcodeNumber: c.leetcodeNumber,
      pattern: c.pattern,
      leetcodeUrl: c.leetcodeUrl,
      difficulty: c.difficulty || 'Medium',
      weekNumber: c.weekNumber || 0,
      isCustom: true,
      loggedEntry: c,
    })),
  ];

  // Filtering
  const filteredItems = allItems.filter((item) => {
    // Pattern filter
    if (selectedPatternFilter !== 'All' && item.pattern !== selectedPatternFilter) {
      return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.title.toLowerCase().includes(q);
      const matchNum = item.leetcodeNumber.toString().includes(q);
      const matchPattern = item.pattern.toLowerCase().includes(q);
      const matchWeek = `week ${item.weekNumber}`.toLowerCase().includes(q);
      if (!matchName && !matchNum && !matchPattern && !matchWeek) return false;
    }

    // Tier / Status filter
    if (tierFilter === 'unsolved') {
      return !item.loggedEntry;
    }
    if (tierFilter === '1') {
      return item.loggedEntry?.struggleTier === 1;
    }
    if (tierFilter === '2') {
      return item.loggedEntry?.struggleTier === 2;
    }
    if (tierFilter === '3') {
      return item.loggedEntry?.struggleTier === 3;
    }
    if (tierFilter === 'pending') {
      return item.loggedEntry?.reviewStatus === 'pending';
    }

    return true;
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Controls Header */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white tracking-wide">
            NEETCODE LOG &amp; SYLLABUS
          </h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {filteredItems.length} items
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Tier Filter dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="all">All Statuses</option>
              <option value="unsolved">Unsolved Only</option>
              <option value="1">Tier 1: Cold Solve</option>
              <option value="2">Tier 2: Hints</option>
              <option value="3">Tier 3: Replay</option>
              <option value="pending">Review Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Problems List */}
      <div className="divide-y divide-slate-850 max-h-[540px] overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">
            No problems match the current filter criteria.
          </div>
        ) : (
          filteredItems.map((item) => {
            const logged = item.loggedEntry;
            const isSolved = Boolean(logged);
            const isNotesOpen = expandedNotesId === item.id;

            return (
              <div
                key={item.id}
                className={`p-3 transition-colors ${
                  isSolved
                    ? logged?.struggleTier === 1
                      ? 'bg-emerald-950/10 hover:bg-emerald-950/20'
                      : logged?.struggleTier === 2
                      ? 'bg-amber-950/10 hover:bg-amber-950/20'
                      : 'bg-rose-950/10 hover:bg-rose-950/20'
                    : 'bg-slate-950/40 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Problem Number + Title + Pattern */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`font-mono text-xs font-bold w-12 shrink-0 ${
                        isSolved ? 'text-white' : 'text-slate-500'
                      }`}
                    >
                      #{item.leetcodeNumber}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <a
                          href={item.leetcodeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-xs text-slate-200 hover:text-indigo-400 hover:underline flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{item.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 text-slate-500" />
                        </a>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                            item.difficulty === 'Easy'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : item.difficulty === 'Medium'
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-rose-400 bg-rose-500/10'
                          }`}
                        >
                          {item.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-mono">
                        {item.weekNumber > 0 && <span>Week {item.weekNumber}</span>}
                        <span>&bull;</span>
                        <span>{item.pattern}</span>
                        {logged && (
                          <>
                            <span>&bull;</span>
                            <span className="text-slate-400">
                              Logged {new Date(logged.dateLogged).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Tier Badge or Log Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    {logged ? (
                      <div className="flex items-center gap-2">
                        {/* Tier Status Badge */}
                        <div
                          onClick={() => onLogProblemWithId(item.id)}
                          title="Click to edit struggle tier or notes"
                          className={`px-2 py-1 rounded text-[11px] font-mono font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 ${
                            logged.struggleTier === 1
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : logged.struggleTier === 2
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {logged.struggleTier === 1 && (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              <span>Tier 1 (Cold)</span>
                            </>
                          )}
                          {logged.struggleTier === 2 && (
                            <>
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              <span>Tier 2 (Hints)</span>
                            </>
                          )}
                          {logged.struggleTier === 3 && (
                            <>
                              <Tv className="w-3 h-3 text-rose-400" />
                              <span>Tier 3 (Replay)</span>
                            </>
                          )}
                        </div>

                        {/* Review Status Pill */}
                        {logged.reviewStatus === 'pending' && (
                          <span
                            title="48-Hour Review Pending"
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-1"
                          >
                            <Clock className="w-2.5 h-2.5" />
                            Review
                          </span>
                        )}
                        {logged.reviewStatus === 'cleared' && (
                          <span
                            title="Review Cleared on Blank Canvas!"
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          >
                            Cleared
                          </span>
                        )}

                        {/* Notes toggle button */}
                        {logged.notes && (
                          <button
                            onClick={() =>
                              setExpandedNotesId(isNotesOpen ? null : item.id)
                            }
                            className="p-1 rounded text-slate-400 hover:text-white"
                            title="Toggle notes"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete entry */}
                        <button
                          onClick={() => deleteDsaProblem(logged.id)}
                          className="p-1 rounded text-slate-600 hover:text-rose-400 transition-colors"
                          title="Delete logged entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      /* Unsolved Problem: Quick Log Trigger */
                      <button
                        onClick={() => onLogProblemWithId(item.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Log Solve</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Notes Preview */}
                {isNotesOpen && logged?.notes && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap">
                    <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Problem Notes &amp; Invariants:
                    </div>
                    {logged.notes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
