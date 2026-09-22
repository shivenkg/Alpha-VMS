import React from 'react';
import { Shield, X, Clock, User, Globe, Hash, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AuditEvent } from '../../types';

interface AdminAuditLogModalProps {
  log: AuditEvent | null;
  onClose: () => void;
}

export const AdminAuditLogModal: React.FC<AdminAuditLogModalProps> = ({ log, onClose }) => {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#123B5D] px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-teal-300">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>Security Audit Event Details</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    log.status === 'SUCCESS'
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                      : log.status === 'DENIED'
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                      : 'bg-red-500/20 text-red-200 border border-red-400/30'
                  }`}
                >
                  {log.status}
                </span>
              </h3>
              <p className="text-[11px] text-slate-300 font-mono">
                Event ID: {log.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white transition p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Summary Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Action & Event</span>
              <span className="px-2 py-0.5 rounded bg-[#123B5D]/10 text-[#123B5D] font-mono font-bold text-[11px]">
                {log.action} • {log.eventType}
              </span>
            </div>
            <p className="text-[#172B3A] font-medium leading-relaxed">
              {log.details}
            </p>
          </div>

          {/* Grid Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <User className="w-3 h-3 text-teal-600" />
                <span>Actor / Operator</span>
              </div>
              <div className="font-bold text-[#172B3A]">{log.actorName}</div>
              <div className="text-[10px] text-teal-700 font-mono">{log.actorRole.replace(/_/g, ' ')}</div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-teal-600" />
                <span>Timestamp</span>
              </div>
              <div className="font-medium text-[#172B3A]">
                {new Date(log.timestamp).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">{log.timestamp}</div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <Globe className="w-3 h-3 text-teal-600" />
                <span>Origin IP Address</span>
              </div>
              <div className="font-mono text-[#172B3A]">{log.ipAddress || '127.0.0.1 (Loopback Edge)'}</div>
              <div className="text-[10px] text-slate-500">Security Ingress Network</div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <Hash className="w-3 h-3 text-teal-600" />
                <span>Correlation & Entity</span>
              </div>
              <div className="font-mono text-[10px] text-slate-700 truncate" title={log.correlationId}>
                {log.correlationId || 'N/A'}
              </div>
              <div className="text-[10px] text-slate-500">
                Entity: {log.entityType} ({log.entityId})
              </div>
            </div>
          </div>

          {/* State Transition (if any) */}
          {(log.previousState || log.newState) && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Previous State</span>
                <span className="font-mono font-semibold text-slate-700">{log.previousState || 'NONE'}</span>
              </div>
              <div className="text-slate-400 font-bold">→</div>
              <div className="space-y-0.5 text-right">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">New State</span>
                <span className="font-mono font-bold text-emerald-700">{log.newState || 'COMMITTED'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            Tenant: {log.tenantId}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#123B5D] hover:bg-[#0F766E] text-white font-bold transition text-xs cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
