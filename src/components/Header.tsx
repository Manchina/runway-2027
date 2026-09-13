import React from 'react';
import { useRunway } from '../context/RunwayContext';
import { Cloud, Database, Flame, Plus } from 'lucide-react';

interface HeaderProps { onOpenLogModal: () => void; onOpenBackupModal: () => void; onOpenCloudModal: () => void; }

export const Header: React.FC<HeaderProps> = ({ onOpenLogModal, onOpenBackupModal, onOpenCloudModal }) => {
  const { streakCount, lastCompletedDate, isCloudConnected } = useRunway();
  const isActiveToday = lastCompletedDate === new Date().toISOString().split('T')[0];
  return <header className="workspace-header sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 px-4 py-3 backdrop-blur-xl sm:px-6">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-black tracking-tight text-slate-950 shadow-lg shadow-violet-500/20">R27</div><div className="min-w-0"><h1 className="truncate text-sm font-bold tracking-tight text-white">Runway</h1><p className="hidden text-xs text-slate-500 sm:block">Your interview practice workspace</p></div></div>
      <div className="flex items-center gap-2"><div className={`hidden items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium sm:flex ${isActiveToday ? 'border-amber-400/20 bg-amber-400/10 text-amber-200' : 'border-slate-800 bg-slate-900 text-slate-400'}`}><Flame className={`h-3.5 w-3.5 ${isActiveToday ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />{streakCount} day streak</div><button type="button" onClick={onOpenCloudModal} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:text-white" title={isCloudConnected ? 'Cloud sync connected' : 'Configure cloud sync'}><Cloud className={`h-4 w-4 ${isCloudConnected ? 'text-emerald-400' : ''}`} /></button><button type="button" onClick={onOpenBackupModal} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:text-white" title="Backup and restore"><Database className="h-4 w-4" /></button><button type="button" onClick={onOpenLogModal} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-bold text-slate-950 shadow-sm transition hover:bg-cyan-100 active:scale-95 sm:px-4"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Log practice</span><span className="sm:hidden">Log</span></button></div>
    </div>
  </header>;
};
