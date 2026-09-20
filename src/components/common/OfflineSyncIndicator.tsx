import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  CloudUpload,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Server,
  Database,
  ArrowRight,
  ShieldCheck,
  X,
  PlusCircle
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { EdgeSyncEvent } from '../../types';

export const OfflineSyncIndicator: React.FC = () => {
  const state = storageService.getState();
  const [isOpen, setIsOpen] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const pendingEvents = storageService.getPendingOfflineEvents();
  const pendingCount = pendingEvents.length;
  const isOnline = state.isEdgeOnline;

  const handleToggleOnline = () => {
    storageService.setEdgeOnline(!isOnline);
  };

  const handlePushToServer = () => {
    setIsPushing(true);
    setTimeout(() => {
      const res = storageService.pushPendingOfflineEvents();
      setIsPushing(false);
      setSyncFeedback(res.message);
      setTimeout(() => setSyncFeedback(null), 4000);
    }, 900);
  };

  const handleSimulateBufferedEvent = () => {
    const event = storageService.simulateTestOfflineEvent();
    setSyncFeedback(`Generated test buffered event: ${event.eventType} (Queue: ${pendingCount + 1})`);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  return (
    <>
      {/* Primary Header Status Indicator Pill */}
      <div className="relative">
        <button
          id="offline-sync-status-indicator"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none ${
            !isOnline
              ? pendingCount > 0
                ? 'bg-rose-950/80 text-rose-200 border-rose-500 shadow-sm animate-pulse'
                : 'bg-amber-950/70 text-amber-200 border-amber-500/70'
              : pendingCount > 0
              ? 'bg-amber-950/80 text-amber-300 border-amber-400 shadow-sm'
              : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
          }`}
          title="Click to inspect Offline Sync Buffer & Central Cloud Push Queue"
        >
          {/* Status Icon */}
          <div className="flex items-center gap-1.5">
            {!isOnline ? (
              <WifiOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            ) : pendingCount > 0 ? (
              <CloudUpload className="w-3.5 h-3.5 text-amber-400 animate-bounce shrink-0" />
            ) : (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}

            {/* Label */}
            <span className="font-medium tracking-tight">
              {!isOnline
                ? 'Edge: Offline'
                : pendingCount > 0
                ? 'Sync Alert'
                : 'Cloud: Synced'}
            </span>
          </div>

          {/* Pending Badge Counter */}
          {pendingCount > 0 ? (
            <span
              id="pending-sync-counter-badge"
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold tracking-tight ${
                !isOnline
                  ? 'bg-rose-500 text-white animate-bounce'
                  : 'bg-amber-400 text-slate-900 font-bold'
              }`}
            >
              {pendingCount} waiting
            </span>
          ) : (
            <span className="text-[10px] text-emerald-400/80 hidden xl:inline font-mono">
              0 queued
            </span>
          )}
        </button>
      </div>

      {/* Sync Management Popover Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div
            id="offline-sync-detail-modal"
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="bg-[#123B5D] text-white px-6 py-4 flex items-center justify-between border-b border-[#0f304c]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isOnline ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                >
                  {isOnline ? <Wifi className="w-5 h-5 text-white" /> : <WifiOff className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <span>Edge Offline Sync State & Buffer</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                        isOnline
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                      }`}
                    >
                      {isOnline ? 'ONLINE' : 'OFFLINE (BUFFERED)'}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-300">
                    Real-time replication state between physical edge controllers and central database.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs">
              {/* Alert notification if records are waiting */}
              {pendingCount > 0 ? (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-start gap-3 text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold text-sm">
                      {pendingCount} Pending Record{pendingCount > 1 ? 's' : ''} Waiting for Cloud Push
                    </div>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Check-in, check-out, or registration events were captured locally on edge controllers while offline.
                      Click &ldquo;Push All to Central Server&rdquo; to reconcile transactions into the master ledger.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center gap-3 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-sm">Central Database Fully Synchronized</div>
                    <p className="text-xs text-emerald-700">
                      All local edge events are reconciled. Zero replication lag detected.
                    </p>
                  </div>
                </div>
              )}

              {syncFeedback && (
                <div className="p-3 bg-teal-50 text-teal-900 border border-teal-300 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>{syncFeedback}</span>
                </div>
              )}

              {/* Topology / Health Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Server className="w-4 h-4 text-[#0F766E]" />
                    <span className="font-semibold text-[11px]">Edge Controller</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-900">edge-ctrl-01</div>
                  <div className="text-[10px] text-slate-500">Local SQLite / Encrypted WAL</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Database className="w-4 h-4 text-[#123B5D]" />
                    <span className="font-semibold text-[11px]">Central Cloud DB</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-900">
                    {isOnline ? 'Connected' : 'Unreachable'}
                  </div>
                  <div className="text-[10px] text-slate-500">PostgreSQL (Multi-Tenant)</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <CloudUpload className="w-4 h-4 text-teal-600" />
                    <span className="font-semibold text-[11px]">Pending Buffer</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-900">
                    {pendingCount} record{pendingCount === 1 ? '' : 's'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {state.edgeSyncEvents.filter((e) => e.status === 'SYNCED').length} historical synced
                  </div>
                </div>
              </div>

              {/* Pending Records Queue Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Edge Upload Queue ({pendingCount} pending)
                  </h3>
                  <button
                    onClick={handleSimulateBufferedEvent}
                    className="text-[11px] text-[#0F766E] hover:text-[#0c5e58] font-semibold flex items-center gap-1 cursor-pointer"
                    title="Simulate a check-in event captured locally on offline edge controller"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Simulate Buffered Event
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  {pendingEvents.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 bg-slate-50">
                      <ShieldCheck className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                      <p className="font-medium text-xs">No pending records waiting to be pushed.</p>
                      <p className="text-[11px] text-slate-500">
                        Turn off Edge Network or click &ldquo;Simulate Buffered Event&rdquo; to test offline queuing.
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-mono border-b border-slate-200">
                        <tr>
                          <th className="p-2">Event Type</th>
                          <th className="p-2">Captured At (UTC)</th>
                          <th className="p-2">Payload Details</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingEvents.map((evt) => (
                          <tr key={evt.id} className="hover:bg-amber-50/50">
                            <td className="p-2 font-mono font-bold text-[#123B5D]">
                              {evt.eventType}
                            </td>
                            <td className="p-2 text-slate-500 font-mono text-[10px]">
                              {new Date(evt.capturedAtUtc).toLocaleTimeString()}
                            </td>
                            <td className="p-2 text-slate-700 max-w-[200px] truncate">
                              {JSON.stringify(evt.payload)}
                            </td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                PENDING UPLOAD
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
                <button
                  id="toggle-edge-network-modal-btn"
                  onClick={handleToggleOnline}
                  className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition text-xs ${
                    isOnline
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {isOnline ? (
                    <>
                      <WifiOff className="w-4 h-4 text-amber-600" />
                      <span>Simulate Network Outage (Go Offline)</span>
                    </>
                  ) : (
                    <>
                      <Wifi className="w-4 h-4" />
                      <span>Restore Cloud Connection (Go Online)</span>
                    </>
                  )}
                </button>

                <button
                  id="push-offline-sync-now-btn"
                  onClick={handlePushToServer}
                  disabled={isPushing || pendingCount === 0}
                  className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition text-xs shadow-sm ${
                    pendingCount === 0
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-[#123B5D] text-white hover:bg-[#0e2f4a]'
                  }`}
                >
                  {isPushing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-teal-300" />
                      <span>Pushing to Central Cloud...</span>
                    </>
                  ) : (
                    <>
                      <CloudUpload className="w-4 h-4 text-teal-300" />
                      <span>Push All to Central Server ({pendingCount})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
