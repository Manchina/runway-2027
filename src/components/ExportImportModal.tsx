import React, { useState, useRef } from 'react';
import { useRunway } from '../context/RunwayContext';
import {
  X,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Sparkles,
} from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({ isOpen, onClose }) => {
  const {
    exportStateJson,
    importStateJson,
    resetToDefaults,
    loadDemoData,
    dsaProblems,
    hldWeeks,
  } = useRunway();

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    try {
      const json = exportStateJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `runway_backup_${timestamp}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({
        text: `Exported state successfully as ${filename}!`,
        type: 'success',
      });
    } catch (e: any) {
      setMessage({
        text: `Failed to export state: ${e.message}`,
        type: 'error',
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importStateJson(content);
      if (res.success) {
        setMessage({ text: res.message, type: 'success' });
      } else {
        setMessage({ text: res.message, type: 'error' });
      }
    };
    reader.onerror = () => {
      setMessage({ text: 'Error reading file', type: 'error' });
    };
    reader.readAsText(file);

    // Reset input value
    e.target.value = '';
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all progress? This will wipe logged DSA problems and reset HLD weeks to fresh state.'
      )
    ) {
      resetToDefaults();
      setMessage({ text: 'All state reset to defaults.', type: 'success' });
    }
  };

  const handleLoadDemo = () => {
    loadDemoData();
    setMessage({
      text: 'Demo grind history loaded! Check the 48-Hour Friction Queue and Pattern Matrix.',
      type: 'success',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Data Backup &amp; Migration Engine</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {message && (
            <div
              className={`p-3 rounded-lg border text-xs font-mono flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Logged DSA Problems:</span>
              <span className="text-white font-bold">{dsaProblems.length}</span>
            </div>
            <div className="flex justify-between">
              <span>HLD Weeks Configured:</span>
              <span className="text-white font-bold">{hldWeeks.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Target Pivot Date:</span>
              <span className="text-emerald-400 font-bold">January 1, 2027</span>
            </div>
          </div>

          {/* Export Action */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-white">Export Local State</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Download all progress, review queues, notes &amp; diagram links as a JSON file.
              </p>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>

          {/* Import Action */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-white">Import / Restore Backup</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Upload a previously saved <code className="text-indigo-300">runway_backup_*.json</code> file to hydrate state.
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer border border-slate-700"
              >
                <Upload className="w-3.5 h-3.5 text-slate-300" />
                <span>Upload</span>
              </button>
            </div>
          </div>

          {/* Demo Data & Factory Reset */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800 gap-2">
            <button
              onClick={handleLoadDemo}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-indigo-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Load Demo Data</span>
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-900/40 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Wipe State</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
