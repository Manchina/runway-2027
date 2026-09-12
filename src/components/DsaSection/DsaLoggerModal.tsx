import React, { useState } from 'react';
import { useRunway } from '../../context/RunwayContext';
import { SYLLABUS_DSA_PROBLEMS, PATTERN_LIST } from '../../data/initialDsaCurriculum';
import type { StruggleTier, PatternName, SyllabusDsaProblem } from '../../types';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Tv,
  Search,
  ExternalLink,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface DsaLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProblemId?: string;
}

export const DsaLoggerModal: React.FC<DsaLoggerModalProps> = ({
  isOpen,
  onClose,
  preselectedProblemId,
}) => {
  const { logDsaProblem, dsaProblems } = useRunway();

  const initialProblem = React.useMemo(() => {
    if (preselectedProblemId) {
      const found = SYLLABUS_DSA_PROBLEMS.find((prob) => prob.id === preselectedProblemId);
      if (found) return found;
    }
    const loggedNumbers = new Set(dsaProblems.map((p) => p.leetcodeNumber));
    const firstUnsolved = SYLLABUS_DSA_PROBLEMS.find((p) => !loggedNumbers.has(p.leetcodeNumber));
    return firstUnsolved || SYLLABUS_DSA_PROBLEMS[0];
  }, [preselectedProblemId, dsaProblems]);

  const existingLog = React.useMemo(() => {
    return dsaProblems.find((d) => d.leetcodeNumber === initialProblem.leetcodeNumber);
  }, [dsaProblems, initialProblem]);

  const [mode, setMode] = useState<'syllabus' | 'custom'>('syllabus');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProblemId, setSelectedProblemId] = useState<string>(initialProblem.id);

  // Form Fields
  const [title, setTitle] = useState(initialProblem.title);
  const [leetcodeNumber, setLeetcodeNumber] = useState<number>(initialProblem.leetcodeNumber);
  const [pattern, setPattern] = useState<PatternName>(initialProblem.pattern);
  const [leetcodeUrl, setLeetcodeUrl] = useState(initialProblem.leetcodeUrl);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(initialProblem.difficulty);
  const [weekNumber, setWeekNumber] = useState<number>(initialProblem.weekNumber);
  const [struggleTier, setStruggleTier] = useState<StruggleTier>(existingLog?.struggleTier || 1);
  const [notes, setNotes] = useState(existingLog?.notes || '');

  const handleSelectSyllabusProblem = (p: SyllabusDsaProblem) => {
    setSelectedProblemId(p.id);
    setTitle(p.title);
    setLeetcodeNumber(p.leetcodeNumber);
    setPattern(p.pattern);
    setLeetcodeUrl(p.leetcodeUrl);
    setDifficulty(p.difficulty);
    setWeekNumber(p.weekNumber);

    const existing = dsaProblems.find((d) => d.leetcodeNumber === p.leetcodeNumber);
    if (existing) {
      setStruggleTier(existing.struggleTier);
      setNotes(existing.notes || '');
    } else {
      setStruggleTier(1);
      setNotes('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !leetcodeNumber) return;

    logDsaProblem({
      title: title.trim(),
      leetcodeNumber: Number(leetcodeNumber),
      pattern,
      leetcodeUrl:
        leetcodeUrl.trim() || `https://leetcode.com/problems/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`,
      struggleTier,
      notes: notes.trim() || undefined,
      difficulty,
      weekNumber,
    });

    onClose();
  };

  if (!isOpen) return null;

  const filteredSyllabus = SYLLABUS_DSA_PROBLEMS.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.leetcodeNumber.toString().includes(searchQuery) ||
      p.pattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `week ${p.weekNumber}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Log NeetCode Problem</span>
              <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                3-Tier Struggle System
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly evaluate your cognitive struggle. No passive illusion of competence.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setMode('syllabus')}
              className={`flex-1 py-1.5 text-xs font-mono rounded-md transition-all flex items-center justify-center gap-2 ${
                mode === 'syllabus'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Curated Syllabus (75 Problems)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`flex-1 py-1.5 text-xs font-mono rounded-md transition-all flex items-center justify-center gap-2 ${
                mode === 'custom'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Custom Problem</span>
            </button>
          </div>

          {/* Syllabus Quick Picker */}
          {mode === 'syllabus' ? (
            <div className="space-y-2">
              <label className="block text-xs font-mono text-slate-300">
                Select from Curated 16-Week Syllabus
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by name, number, pattern, or 'week 3'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 divide-y divide-slate-850">
                {filteredSyllabus.map((p) => {
                  const isLogged = dsaProblems.some((d) => d.leetcodeNumber === p.leetcodeNumber);
                  const isSelected = selectedProblemId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectSyllabusProblem(p)}
                      className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-950/40 text-indigo-200 border-l-2 border-indigo-500'
                          : 'hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 w-12">#{p.leetcodeNumber}</span>
                        <span className="font-medium text-white">{p.title}</span>
                        <span className="text-[10px] text-slate-500 hidden sm:inline">
                          (W{p.weekNumber} &bull; {p.pattern})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            p.difficulty === 'Easy'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : p.difficulty === 'Medium'
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-rose-400 bg-rose-500/10'
                          }`}
                        >
                          {p.difficulty}
                        </span>
                        {isLogged && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            Logged
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Custom Problem Fields */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Problem Number
                </label>
                <input
                  type="number"
                  value={leetcodeNumber}
                  onChange={(e) => setLeetcodeNumber(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Problem Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Valid Parentheses"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Pattern</label>
                <select
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value as PatternName)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  {PATTERN_LIST.map((pat) => (
                    <option key={pat} value={pat}>
                      {pat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          )}

          {/* Selected problem summary banner */}
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-indigo-400 font-bold">#{leetcodeNumber}</span>
              <span className="font-semibold text-white">{title}</span>
              <span className="text-slate-400 font-mono text-[11px]">&bull; {pattern}</span>
            </div>
            {leetcodeUrl && (
              <a
                href={leetcodeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[11px]"
              >
                <span>LeetCode</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* 3-Tier Struggle Radio Buttons */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2 font-semibold">
              Select Struggle Tier (Deliberate Struggle Method)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Tier 1 */}
              <div
                onClick={() => setStruggleTier(1)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  struggleTier === 1
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/50'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Tier 1
                    </span>
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        struggleTier === 1 ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    />
                  </div>
                  <h3 className="text-xs font-bold text-white mb-1">Cold Solve</h3>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Solved independently within 30 mins with zero external hints.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-emerald-900/30 text-[10px] font-mono text-emerald-400">
                  Review: Not Needed
                </div>
              </div>

              {/* Tier 2 */}
              <div
                onClick={() => setStruggleTier(2)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  struggleTier === 2
                    ? 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-md shadow-amber-950/50'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Tier 2
                    </span>
                    <AlertTriangle
                      className={`w-4 h-4 ${
                        struggleTier === 2 ? 'text-amber-400' : 'text-slate-600'
                      }`}
                    />
                  </div>
                  <h3 className="text-xs font-bold text-white mb-1">Hint Assisted</h3>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Required pattern or text hints to unlock the key intuition.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-900/30 text-[10px] font-mono text-amber-400">
                  Review: Auto +48 Hours
                </div>
              </div>

              {/* Tier 3 */}
              <div
                onClick={() => setStruggleTier(3)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  struggleTier === 3
                    ? 'bg-rose-950/40 border-rose-500 text-rose-200 shadow-md shadow-rose-950/50'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      Tier 3
                    </span>
                    <Tv
                      className={`w-4 h-4 ${
                        struggleTier === 3 ? 'text-rose-400' : 'text-slate-600'
                      }`}
                    />
                  </div>
                  <h3 className="text-xs font-bold text-white mb-1">Video Replay</h3>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Watched full video or code solution. High risk of passive bias.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-rose-900/30 text-[10px] font-mono text-rose-400">
                  Review: Auto +48 Hours
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Cognitive Synthesis */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Engineering Notes &amp; Invariants (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Invariant: Maintain monotonic decreasing stack. Got tripped by edge case with single element. Time: O(N), Space: O(N)."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/60 transition-all active:scale-95 cursor-pointer"
            >
              Save Problem Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
