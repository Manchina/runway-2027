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
  Code2,
  X,
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
  const [tierFilter, setTierFilter] = useState<
    'all' | 'unsolved' | 'solved' | '1' | '2' | '3' | 'pending' | 'Easy' | 'Medium' | 'Hard'
  >('all');
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

    // Tier / Difficulty / Status filter
    if (tierFilter === 'unsolved') {
      return !item.loggedEntry;
    }
    if (tierFilter === 'solved') {
      return Boolean(item.loggedEntry);
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
    if (tierFilter === 'Easy' || tierFilter === 'Medium' || tierFilter === 'Hard') {
      return item.difficulty === tierFilter;
    }

    return true;
  });

  return (
    <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg">
      {/* Controls Header */}
      <div className="p-4 border-b border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/90">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                NeetCode Problem Bank
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                {filteredItems.length} Problems
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, #, pattern..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter dropdown */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as any)}
              className="w-full sm:w-auto px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500 font-mono cursor-pointer"
            >
              <option value="all">All Statuses &amp; Difficulties</option>
              <option value="solved">Solved Only</option>
              <option value="unsolved">Unsolved Only</option>
              <option value="pending">Review Pending (48h)</option>
              <option value="1">Tier 1: Cold Solve</option>
              <option value="2">Tier 2: Hints Assisted</option>
              <option value="3">Tier 3: Video Replay</option>
              <option value="Easy">Easy Difficulty</option>
              <option value="Medium">Medium Difficulty</option>
              <option value="Hard">Hard Difficulty</option>
            </select>
          </div>
        </div>
      </div>

      {/* Problems List */}
      <div className="divide-y divide-slate-850/80 max-h-[580px] overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 font-mono space-y-2">
            <div>No problems match the current filter criteria.</div>
            <button
              onClick={() => {
                setSearch('');
                setTierFilter('all');
              }}
              className="text-indigo-400 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const logged = item.loggedEntry;
            const isSolved = Boolean(logged);
            const isNotesOpen = expandedNotesId === item.id;

            return (
              <div
                key={item.id}
                className={`p-3.5 transition-colors ${
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
                  {/* Left: Problem Number + Title + Pattern + Badges */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`font-mono text-xs font-bold w-12 shrink-0 ${
                        isSolved ? 'text-white' : 'text-slate-500'
                      }`}
                    >
                      #{item.leetcodeNumber}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
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
                          className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded shrink-0 border ${
                            item.difficulty === 'Easy'
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                              : item.difficulty === 'Medium'
                              ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                              : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                          }`}
                        >
                          {item.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                        {item.weekNumber > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            W{item.weekNumber}
                          </span>
                        )}
                        <span>&bull;</span>
                        <span className="text-slate-400">{item.pattern}</span>
                        {logged && (
                          <>
                            <span>&bull;</span>
                            <span className="text-slate-500">
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
                        <button
                          type="button"
                          onClick={() => onLogProblemWithId(item.id)}
                          title="Click to edit struggle tier or notes"
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 border ${
                            logged.struggleTier === 1
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-950/50'
                              : logged.struggleTier === 2
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {logged.struggleTier === 1 && (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Tier 1 (Cold)</span>
                            </>
                          )}
                          {logged.struggleTier === 2 && (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              <span>Tier 2 (Hints)</span>
                            </>
                          )}
                          {logged.struggleTier === 3 && (
                            <>
                              <Tv className="w-3.5 h-3.5 text-rose-400" />
                              <span>Tier 3 (Replay)</span>
                            </>
                          )}
                        </button>

                        {/* Review Status Pill */}
                        {logged.reviewStatus === 'pending' && (
                          <span
                            title="48-Hour Review Pending in Friction Queue"
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-1 font-semibold"
                          >
                            <Clock className="w-2.5 h-2.5" />
                            Review
                          </span>
                        )}
                        {logged.reviewStatus === 'cleared' && (
                          <span
                            title="Review Cleared on Blank Canvas!"
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold"
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
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isNotesOpen
                                ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                            title="Toggle notes"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete entry */}
                        <button
                          onClick={() => deleteDsaProblem(logged.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
                          title="Delete logged solve"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      /* Unsolved Problem: Quick Log Trigger */
                      <button
                        onClick={() => onLogProblemWithId(item.id)}
                        className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-emerald-950/40 hover:border-emerald-500/40 border border-slate-800 text-slate-300 hover:text-emerald-300 text-xs font-mono flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Log Solve</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Notes Preview */}
                {isNotesOpen && logged?.notes && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap">
                    <div className="text-[10px] font-bold uppercase text-indigo-400 mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>Engineering Invariants &amp; Notes:</span>
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
