import React, { useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Save,
  Link2,
  ShieldCheck,
  Zap,
  Clock,
  ArrowUpRight,
  Database,
  Sliders,
  Check,
  Copy
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { GoogleSheetConfig } from '../../types';

interface GoogleSheetsConfigTabProps {
  onNotifySuccess?: (msg: string) => void;
  onNotifyError?: (msg: string) => void;
}

export const GoogleSheetsConfigTab: React.FC<GoogleSheetsConfigTabProps> = ({
  onNotifySuccess,
  onNotifyError,
}) => {
  const [config, setConfig] = useState<GoogleSheetConfig>(() =>
    storageService.getGoogleSheetConfig()
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    storageService.updateGoogleSheetConfig(config);
    setSavedSuccess(true);
    if (onNotifySuccess) {
      onNotifySuccess('Google Sheets configuration and sync rules updated successfully!');
    }
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const res = storageService.syncWithGoogleSheet();
      setConfig(storageService.getGoogleSheetConfig());
      setIsSyncing(false);
      if (onNotifySuccess) {
        onNotifySuccess(`Google Sheet synced! ${res.rowsSynced} visitor records pushed to tab "${config.sheetName}".`);
      }
    }, 1200);
  };

  const handleCopyEmail = () => {
    if (config.serviceAccountEmail && navigator.clipboard) {
      navigator.clipboard.writeText(config.serviceAccountEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Status Card */}
      <div className="bg-white rounded-xl border border-[#D8E1E8] p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-inner">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#172B3A]">
                Google Sheets Enterprise Synchronization
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                {config.enabled ? 'ACTIVE & CONNECTED' : 'DISABLED'}
              </span>
            </div>
            <p className="text-xs text-[#526575] mt-0.5">
              Automatically stream visitor arrival logs, check-ins, security badges, and compliance records directly into a centralized Google Spreadsheet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {config.spreadsheetUrl && (
            <a
              href={config.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#F4F7FA] text-[#123B5D] border border-[#D8E1E8] text-xs font-semibold hover:bg-slate-100 transition flex items-center gap-1.5"
            >
              <span>View Spreadsheet</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            id="admin-google-sheet-manual-sync-btn"
            onClick={handleManualSync}
            disabled={isSyncing || !config.enabled}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Pushing Records...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* Sync Summary Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#D8E1E8] shadow-xs">
          <div className="text-[11px] font-medium text-[#526575] uppercase tracking-wider">Sync Status</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-base font-bold text-emerald-700 font-mono">
              {config.syncStatus}
            </span>
            <span className="text-[11px] text-slate-400">• SSL v3 Encrypted</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8E1E8] shadow-xs">
          <div className="text-[11px] font-medium text-[#526575] uppercase tracking-wider">Total Rows Streamed</div>
          <div className="mt-1 text-base font-bold text-[#123B5D] font-mono">
            {config.totalRowsSynced || 0} Records
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8E1E8] shadow-xs">
          <div className="text-[11px] font-medium text-[#526575] uppercase tracking-wider">Last Push Timestamp</div>
          <div className="mt-1 text-xs font-semibold text-[#172B3A] font-mono">
            {config.lastSyncedAt ? new Date(config.lastSyncedAt).toLocaleString() : 'Never'}
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-xl border border-[#D8E1E8] shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="font-bold text-sm text-[#172B3A] flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[#0F766E]" />
            <span>Spreadsheet Connection Parameters</span>
          </h3>

          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-semibold text-slate-700">Enable Google Sheets Sync:</span>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block font-semibold text-[#172B3A] mb-1">
              Google Spreadsheet URL or ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.spreadsheetUrl}
              onChange={(e) => {
                const val = e.target.value;
                let id = val;
                const match = val.match(/\/d\/([a-zA-Z0-9-_]+)/);
                if (match) id = match[1];
                setConfig({ ...config, spreadsheetUrl: val, spreadsheetId: id });
              }}
              placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs.../edit"
              className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E] font-mono text-[11px]"
            />
            <p className="text-[10px] text-[#526575] mt-1">
              Extracted Sheet ID: <span className="font-mono text-teal-800">{config.spreadsheetId || 'None'}</span>
            </p>
          </div>

          <div>
            <label className="block font-semibold text-[#172B3A] mb-1">
              Worksheet / Tab Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.sheetName}
              onChange={(e) => setConfig({ ...config, sheetName: e.target.value })}
              placeholder="Visitor_Logs_2026"
              className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E]"
            />
            <p className="text-[10px] text-[#526575] mt-1">
              If tab does not exist in spreadsheet, it will be automatically created with column headers.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-[#172B3A] mb-1">
              Sync Mode Pipeline
            </label>
            <select
              value={config.syncMode}
              onChange={(e) => setConfig({ ...config, syncMode: e.target.value as any })}
              className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E]"
            >
              <option value="REALTIME_CHECKIN">Real-time Check-In & Check-Out Push (Recommended)</option>
              <option value="TWO_WAY_PRE_REG">Two-Way Pre-Registration Intake (Form → VMS)</option>
              <option value="BATCH_AUDIT_LOGS">Periodic Bulk Export (Forensic & Audit Trail)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block font-semibold text-[#172B3A]">
              Automated Event Triggers
            </label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoSyncOnCheckIn}
                  onChange={(e) => setConfig({ ...config, autoSyncOnCheckIn: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-slate-700">Trigger append when visitor checks in at reception or kiosk</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoSyncOnCheckOut}
                  onChange={(e) => setConfig({ ...config, autoSyncOnCheckOut: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-slate-700">Trigger row update with checkout timestamp on turnstile/mobile scan</span>
              </label>
            </div>
          </div>
        </div>

        {/* Synchronized Columns Matrix */}
        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-bold text-xs text-[#172B3A] mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Data Columns Streamed to Google Sheet</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
            {Object.entries(config.fieldsToSync).map(([key, val]) => (
              <label key={key} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={val}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      fieldsToSync: {
                        ...config.fieldsToSync,
                        [key]: e.target.checked,
                      },
                    })
                  }
                  className="w-3.5 h-3.5 text-emerald-600 rounded"
                />
                <span className="capitalize text-[#172B3A] font-medium">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Service Account Delegation Note */}
        <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 text-xs text-teal-900 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>Google Drive API Access Credentials</span>
          </div>
          <p className="text-[11px] text-teal-800 leading-relaxed">
            Ensure your Google Sheet is shared with edit permissions to this automated service robot account:
          </p>
          <div className="flex items-center gap-2 mt-1">
            <code className="px-2 py-1 bg-white border border-teal-300 rounded font-mono text-[11px] text-teal-950 select-all">
              {config.serviceAccountEmail}
            </code>
            <button
              onClick={handleCopyEmail}
              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-medium text-[11px] flex items-center gap-1 cursor-pointer"
            >
              {copiedEmail ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Save Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Settings successfully persisted!
            </span>
          ) : (
            <span className="text-[11px] text-[#526575]">
              Real-time webhook and audit hooks will activate immediately upon saving.
            </span>
          )}

          <button
            id="admin-save-google-sheet-config-btn"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#123B5D] hover:bg-[#0e2f4a] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Google Sheet Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
