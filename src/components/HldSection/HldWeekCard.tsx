import React, { useState } from 'react';
import type { HldWeekEntry, HldStatus, HldWeekChecklist } from '../../types';
import { useRunway } from '../../context/RunwayContext';
import {
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  ExternalLink,
  Layers,
  Edit3,
  Award,
  Compass,
} from 'lucide-react';

interface HldWeekCardProps {
  week: HldWeekEntry;
  isInitiallyOpen?: boolean;
}

export const HldWeekCard: React.FC<HldWeekCardProps> = ({ week, isInitiallyOpen = false }) => {
  const { updateHldWeek, toggleHldChecklistItem } = useRunway();
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  const [excalidrawUrlInput, setExcalidrawUrlInput] = useState(week.excalidrawUrl || '');
  const [summaryNotesInput, setSummaryNotesInput] = useState(week.summaryNotes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const handleStatusChange = (newStatus: HldStatus) => {
    updateHldWeek(week.weekNumber, { status: newStatus });
  };

  const handleSaveUrl = () => {
    updateHldWeek(week.weekNumber, { excalidrawUrl: excalidrawUrlInput.trim() || undefined });
  };

  const handleSaveNotes = () => {
    updateHldWeek(week.weekNumber, { summaryNotes: summaryNotesInput.trim() || undefined });
    setIsEditingNotes(false);
  };

  const checklistItems: { key: keyof HldWeekChecklist; label: string }[] = [
    { key: 'readingDone', label: 'Chapter Reading Done' },
    { key: 'estimationPracticed', label: 'Back-of-Envelope Sizing Practiced' },
    { key: 'diagramCompleted', label: 'Architecture Diagram Drawn' },
    { key: 'bottlenecksAudited', label: 'Single-Point-of-Failure & Tradeoffs Audited' },
  ];

  const completedCount = Object.values(week.checklist).filter(Boolean).length;

  const statusConfig: Record<
    HldStatus,
    { label: string; color: string; border: string; bg: string }
  > = {
    not_started: {
      label: 'Not Started',
      color: 'text-slate-400',
      border: 'border-slate-700',
      bg: 'bg-slate-800/40',
    },
    reading: {
      label: 'Reading',
      color: 'text-blue-400',
      border: 'border-blue-500/40',
      bg: 'bg-blue-500/10',
    },
    diagrammed: {
      label: 'Diagrammed',
      color: 'text-indigo-400',
      border: 'border-indigo-500/40',
      bg: 'bg-indigo-500/10',
    },
    mastered: {
      label: 'Mastered',
      color: 'text-emerald-400',
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-500/10',
    },
  };

  const currentStatus = statusConfig[week.status];

  return (
    <div
      className={`border rounded-xl transition-all overflow-hidden ${
        week.status === 'mastered'
          ? 'bg-slate-900/90 border-emerald-900/40'
          : week.status === 'diagrammed'
          ? 'bg-slate-900/90 border-indigo-900/40'
          : 'bg-slate-900/60 border-slate-800'
      }`}
    >
      {/* Card Header / Summary Row */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-850/60 select-none transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
              week.status === 'mastered'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
            }`}
          >
            W{week.weekNumber}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                Vol {week.bookVolume}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                {week.chapterTitle}
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
              <span className="font-mono">
                {completedCount}/4 deliverables
              </span>
              {week.excalidrawUrl && (
                <>
                  <span>&bull;</span>
                  <span className="text-indigo-400 font-mono flex items-center gap-0.5">
                    <Layers className="w-3 h-3" /> Diagram linked
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Status Badge */}
          <span
            className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full border ${currentStatus.bg} ${currentStatus.color} ${currentStatus.border}`}
          >
            {currentStatus.label}
          </span>

          <button
            type="button"
            className="p-1 text-slate-400 hover:text-white"
            aria-label="Toggle card"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Accordion Body */}
      {isOpen && (
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/70 space-y-4 text-xs">
          {/* Core Concepts */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold mb-1.5 flex items-center gap-1">
              <Compass className="w-3 h-3" />
              <span>Core Architectural Concepts</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {week.coreConcepts.map((concept, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.8 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>

          {/* Weekend Deliverable Brief */}
          <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/40">
            <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 font-bold mb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>Weekend Deliverable</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">{week.deliverable}</p>
          </div>

          {/* 4-Step Checklist */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center justify-between">
              <span>System Design Execution Checklist</span>
              <span className="font-mono text-indigo-400">{completedCount} of 4 Complete</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {checklistItems.map(({ key, label }) => {
                const checked = week.checklist[key];
                return (
                  <div
                    key={key}
                    onClick={() => toggleHldChecklistItem(week.weekNumber, key)}
                    className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer select-none transition-all ${
                      checked
                        ? 'bg-emerald-950/20 border-emerald-700/50 text-emerald-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                    <span className="text-xs font-medium leading-tight">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Excalidraw / Diagram URL */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Architecture Diagram Link (Excalidraw / Figma / Miro)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="https://excalidraw.com/#room=..."
                value={excalidrawUrlInput}
                onChange={(e) => setExcalidrawUrlInput(e.target.value)}
                onBlur={handleSaveUrl}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleSaveUrl}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
              >
                Save
              </button>
              {week.excalidrawUrl && (
                <a
                  href={week.excalidrawUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono flex items-center gap-1 transition-colors shadow-sm"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Summary & Notes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Architecture Notes &amp; Bottleneck Analysis
              </label>
              {!isEditingNotes && (
                <button
                  type="button"
                  onClick={() => setIsEditingNotes(true)}
                  className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{week.summaryNotes ? 'Edit' : 'Add Notes'}</span>
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={summaryNotesInput}
                  onChange={(e) => setSummaryNotesInput(e.target.value)}
                  placeholder="Summarize read/write path tradeoffs, replication strategy, cache eviction, failure modes..."
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSummaryNotesInput(week.summaryNotes || '');
                      setIsEditingNotes(false);
                    }}
                    className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-semibold"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            ) : week.summaryNotes ? (
              <div
                onClick={() => setIsEditingNotes(true)}
                className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 font-mono text-xs whitespace-pre-wrap cursor-pointer hover:border-slate-700 transition-colors"
              >
                {week.summaryNotes}
              </div>
            ) : (
              <div
                onClick={() => setIsEditingNotes(true)}
                className="p-3 rounded-lg border border-dashed border-slate-800 text-slate-500 text-xs font-mono text-center cursor-pointer hover:border-slate-700 hover:text-slate-400 transition-colors"
              >
                Click here to record tradeoffs, sizing numbers, or architecture invariants.
              </div>
            )}
          </div>

          {/* Status Quick Switcher */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Update Status:
            </span>
            <div className="flex items-center gap-1.5">
              {(['not_started', 'reading', 'diagrammed', 'mastered'] as HldStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono capitalize transition-all cursor-pointer ${
                    week.status === st
                      ? `${statusConfig[st].bg} ${statusConfig[st].color} border ${statusConfig[st].border} font-bold shadow-sm`
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {statusConfig[st].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
