import React, { useState } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  FileCheck,
  Clock,
  Eye,
  Calendar,
  AlertTriangle,
  Lock,
  Plus
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { VisitorProfile } from '../../types';

interface VisitorDirectoryViewProps {
  onInviteVisitor: (visitor: VisitorProfile) => void;
}

export const VisitorDirectoryView: React.FC<VisitorDirectoryViewProps> = ({ onInviteVisitor }) => {
  const state = storageService.getState();
  const [search, setSearch] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorProfile | null>(null);

  const filteredVisitors = state.visitors.filter((v) => {
    return (
      v.fullName.toLowerCase().includes(search.toLowerCase()) ||
      v.company.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      v.category.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#D8E1E8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0F766E]" />
            <h1 className="text-lg font-bold text-[#172B3A]">Visitor Master Profiles</h1>
          </div>
          <p className="text-xs text-[#526575] mt-1">
            Zero-Trust visitor directory with automatic PII masking, NDA consent verification, and visit history.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#526575] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search visitor directory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E]"
            />
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-[#D8E1E8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F7FA] border-b border-[#D8E1E8]">
              <tr className="text-[#526575] uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Visitor</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Masked ID Document</th>
                <th className="py-3 px-4">Consents</th>
                <th className="py-3 px-4">Watchlist</th>
                <th className="py-3 px-4">Total Visits</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8E1E8]">
              {filteredVisitors.map((v) => (
                <tr key={v.id} className="hover:bg-[#F4F7FA] transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                        {v.photoUrl ? (
                          <img src={v.photoUrl} alt={v.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-slate-600">{v.fullName.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[#172B3A]">{v.fullName}</div>
                        <div className="text-[11px] text-[#526575]">{v.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-[#172B3A]">{v.company}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {v.category.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                      <Lock className="w-3 h-3 text-[#526575]" />
                      <span>{v.maskedDocumentNumber}</span>
                    </div>
                    <span className="text-[10px] text-[#526575]">{v.documentType}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span
                        title="Safety Consent"
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                          v.consentSigned
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        Privacy
                      </span>
                      <span
                        title="NDA Agreement"
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                          v.ndaSigned
                            ? 'bg-teal-50 text-teal-700 border-teal-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {v.ndaSigned ? 'NDA Signed' : 'NDA Pending'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        v.watchlistStatus === 'CLEAN'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {v.watchlistStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#172B3A]">{v.totalVisits}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedVisitor(v)}
                        title="View Full Profile"
                        className="p-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onInviteVisitor(v)}
                        className="bg-[#123B5D] text-white px-2.5 py-1 rounded text-xs font-semibold hover:bg-[#0e2f4a] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Invite
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visitor Profile Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#D8E1E8] shadow-xl max-w-lg w-full p-6 space-y-4 text-xs animate-fadeIn">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-100 border border-teal-300 overflow-hidden flex items-center justify-center">
                  {selectedVisitor.photoUrl ? (
                    <img src={selectedVisitor.photoUrl} alt={selectedVisitor.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-lg text-teal-800">{selectedVisitor.fullName.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#172B3A]">{selectedVisitor.fullName}</h2>
                  <p className="text-xs text-[#526575]">{selectedVisitor.company} • {selectedVisitor.category}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVisitor(null)}
                className="text-slate-400 hover:text-slate-700 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#F4F7FA] p-3 rounded-lg border border-[#D8E1E8]">
              <div>
                <span className="text-[#526575] block">Email:</span>
                <span className="font-semibold text-[#172B3A]">{selectedVisitor.email}</span>
              </div>
              <div>
                <span className="text-[#526575] block">Phone:</span>
                <span className="font-semibold text-[#172B3A]">{selectedVisitor.phoneNumber}</span>
              </div>
              <div>
                <span className="text-[#526575] block">Document Type:</span>
                <span className="font-semibold text-[#172B3A]">{selectedVisitor.documentType}</span>
              </div>
              <div>
                <span className="text-[#526575] block">Masked ID Number:</span>
                <span className="font-mono font-semibold text-[#123B5D]">{selectedVisitor.maskedDocumentNumber}</span>
              </div>
              <div>
                <span className="text-[#526575] block">Total Recorded Visits:</span>
                <span className="font-bold text-teal-800">{selectedVisitor.totalVisits}</span>
              </div>
              <div>
                <span className="text-[#526575] block">Watchlist Screening:</span>
                <span className="font-bold text-emerald-700">{selectedVisitor.watchlistStatus}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-[#172B3A] text-xs">Past Visit History in Tenant</h3>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {state.visits
                  .filter((v) => v.visitorId === selectedVisitor.id)
                  .map((v) => (
                    <div key={v.id} className="p-2 rounded bg-white border border-[#D8E1E8] flex items-center justify-between text-[11px]">
                      <div>
                        <div className="font-medium text-[#172B3A]">{v.purpose}</div>
                        <div className="text-[10px] text-[#526575]">{new Date(v.scheduledStart).toLocaleDateString()} • Host: {v.hostName}</div>
                      </div>
                      <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {v.state}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => {
                  onInviteVisitor(selectedVisitor);
                  setSelectedVisitor(null);
                }}
                className="bg-[#123B5D] text-white px-3.5 py-1.5 rounded text-xs font-semibold hover:bg-[#0e2f4a]"
              >
                Create New Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
