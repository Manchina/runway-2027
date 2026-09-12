import React, { useState, useEffect } from 'react';
import { getApiConfig, setApiConfig, runwayApi } from '../services/api';
import { useRunway } from '../context/RunwayContext';
import {
  X,
  Cloud,
  ShieldCheck,
  Server,
  Database,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface CloudConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChanged?: () => void;
}

export const CloudConfigModal: React.FC<CloudConfigModalProps> = ({
  isOpen,
  onClose,
  onConnectionChanged,
}) => {
  const { dsaProblems, hldWeeks } = useRunway();
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getApiConfig();
      setApiUrl(config.url);
      setApiKey(config.key);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      // Save temporarily to test
      setApiConfig(apiUrl.trim(), apiKey.trim());
      const health = await runwayApi.checkHealth();
      setTestResult({
        success: true,
        message: 'Successfully connected to AWS Lambda + DynamoDB!',
        details: health,
      });
      if (onConnectionChanged) onConnectionChanged();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection failed: ${err.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setApiConfig(apiUrl.trim(), apiKey.trim());
    if (onConnectionChanged) onConnectionChanged();
    onClose();
  };

  const handleSwitchToLocalOnly = () => {
    setApiConfig('', '');
    setApiUrl('');
    setApiKey('');
    setTestResult({
      success: true,
      message: 'Switched to Local Storage Mode (100% offline, zero network requests).',
    });
    if (onConnectionChanged) onConnectionChanged();
  };

  const handleSyncLocalToCloud = async () => {
    setIsSyncing(true);
    try {
      // 1. Seed HLD weeks
      await runwayApi.seedHldCurriculum(hldWeeks);

      // 2. Upload all DSA problems
      for (const problem of dsaProblems) {
        await runwayApi.logDsaProblem(problem);
      }

      setTestResult({
        success: true,
        message: `Synced ${dsaProblems.length} DSA problems and 16 HLD weeks to DynamoDB!`,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Sync failed: ${err.message}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>AWS Cloud &amp; Bot Shield Settings</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Always-Free Tier
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Connect to your AWS Lambda Function URL &amp; DynamoDB backend.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto font-sans">
          {/* Status banner */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  apiUrl ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              <span className="font-mono text-slate-300">
                Current Mode:{' '}
                <strong className={apiUrl ? 'text-emerald-400' : 'text-slate-400'}>
                  {apiUrl ? 'AWS Cloud (DynamoDB)' : 'Local Storage (Browser Only)'}
                </strong>
              </span>
            </div>

            {apiUrl && (
              <button
                type="button"
                onClick={handleSwitchToLocalOnly}
                className="text-[11px] font-mono text-rose-400 hover:text-rose-300 underline"
              >
                Disconnect Cloud
              </button>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1 flex items-center justify-between">
                <span>AWS Lambda Function URL / API Endpoint</span>
                <span className="text-[10px] text-slate-500">e.g. https://xyz.lambda-url.us-east-1.on.aws</span>
              </label>
              <div className="relative">
                <Server className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="url"
                  placeholder="https://...on.aws or http://localhost:3001"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bot Shield Secret Key (x-runway-key)</span>
                </span>
                <span className="text-[10px] text-slate-500">Matches RUNWAY_API_KEY in Lambda</span>
              </label>
              <input
                type="password"
                placeholder="Enter your private shield key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Requests without this key are rejected with 401 in &lt;2ms, preventing any internet bot from querying your DynamoDB.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !apiUrl}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isTesting ? 'Pinging Lambda...' : 'Test Connection'}
            </button>

            {apiUrl && (
              <button
                type="button"
                onClick={handleSyncLocalToCloud}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-emerald-300 text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{isSyncing ? 'Syncing...' : 'Upload Local Data to Cloud'}</span>
              </button>
            )}
          </div>

          {/* Test Result Callout */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <div className="space-y-1">
                <div>{testResult.message}</div>
                {testResult.details && (
                  <div className="text-[10px] text-slate-400 font-mono">
                    Database: {testResult.details.database} &bull; Bot Shield: {testResult.details.botShield}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Architecture Reminder */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <div className="text-white font-semibold flex items-center gap-1.5 font-mono text-xs">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>AWS Zero-Dollar Guarantee Reminder</span>
            </div>
            <p>
              &bull; <strong>DynamoDB:</strong> 25 GB indexed storage is permanent free tier.
            </p>
            <p>
              &bull; <strong>Lambda:</strong> 1,000,000 free invocations/month. Concurrency hard-capped at 2.
            </p>
            <p>
              &bull; <strong>CloudFront:</strong> 1 TB free data transfer every single month.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            Package: <code className="text-indigo-400">backend/dist/lambda.zip</code> (11.5 KB)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
