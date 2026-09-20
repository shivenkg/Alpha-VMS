import React, { useState } from 'react';
import {
  FileText,
  Search,
  Shield,
  Filter,
  Eye,
  Calendar,
  Lock,
  Download
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { AuditEvent } from '../../types';

export const AuditTrailView: React.FC = () => {
  const state = storageService.getState();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [inspectEvent, setInspectEvent] = useState<AuditEvent | null>(null);

  const filteredEvents = state.auditEvents.filter((e) => {
    const matchesSearch =
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.actorName.toLowerCase().includes(search.toLowerCase()) ||
      e.correlationId.toLowerCase().includes(search.toLowerCase()) ||
      e.entityId.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'ALL' || e.action.includes(typeFilter);
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#D8E1E8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0F766E]" />
            <h1 className="text-lg font-bold text-[#172B3A]">Immutable Audit Trail & Compliance Log</h1>
          </div>
          <p className="text-xs text-[#526575] mt-1">
            Tamper-evident system events with cryptographically correlated IDs, actor provenance, and security metadata.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-[#526575] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E]"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg text-[#172B3A]"
          >
            <option value="ALL">All Actions</option>
            <option value="CHECK">Check-In / Out</option>
            <option value="APPROVE">Approvals</option>
            <option value="PRINT">Badge Prints</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-[#D8E1E8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F7FA] border-b border-[#D8E1E8]">
              <tr className="text-[#526575] uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Correlation ID</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8E1E8]">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-[#F4F7FA] transition">
                  <td className="py-3 px-4 text-[#526575] font-mono whitespace-nowrap">
                    {new Date(evt.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        evt.action.includes('CHECK_IN')
                          ? 'bg-teal-50 text-teal-800 border-teal-200'
                          : evt.action.includes('CHECK_OUT')
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : evt.action.includes('EMERGENCY')
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : evt.action.includes('PRINT')
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-slate-100 text-slate-800 border-slate-300'
                      }`}
                    >
                      {evt.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#172B3A]">{evt.actorName}</div>
                    <div className="text-[10px] text-[#526575]">{evt.actorRole}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] text-slate-700">{evt.entityId}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#0F766E] truncate max-w-[140px]">
                    {evt.correlationId}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{evt.ipAddress}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setInspectEvent(evt)}
                      className="p-1 rounded text-slate-600 hover:text-[#123B5D] hover:bg-slate-200"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Detail Modal */}
      {inspectEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#D8E1E8] shadow-2xl max-w-lg w-full p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-[#172B3A]">Forensic Audit Event Metadata</h3>
              <button onClick={() => setInspectEvent(null)} className="text-slate-400">✕</button>
            </div>

            <div className="space-y-1 text-slate-700">
              <div><strong>Action:</strong> {inspectEvent.action}</div>
              <div><strong>Actor:</strong> {inspectEvent.actorName} ({inspectEvent.actorRole})</div>
              <div><strong>Entity:</strong> {inspectEvent.entityType} ({inspectEvent.entityId})</div>
              <div><strong>Correlation ID:</strong> <span className="font-mono text-teal-700">{inspectEvent.correlationId}</span></div>
              <div><strong>Timestamp:</strong> {inspectEvent.timestamp}</div>
            </div>

            <div className="bg-[#172B3A] text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto max-h-60">
              <pre>{inspectEvent.details}</pre>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setInspectEvent(null)}
                className="bg-[#123B5D] text-white px-3 py-1.5 rounded font-semibold hover:bg-[#0e2f4a]"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
