import React, { useState } from 'react';
import {
  CheckSquare,
  ShieldCheck,
  UserCheck,
  XCircle,
  AlertTriangle,
  Clock,
  Building,
  CheckCircle2,
  FileDown,
  Loader2
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Visit } from '../../types';
import { generateVisitorLogsPdf } from '../../utils/reportPdfGenerator';

export const ApprovalsQueueView: React.FC = () => {
  const state = storageService.getState();
  const activeTenant = storageService.getActiveTenant();
  const activeUser = storageService.getActiveUser();
  const activeSite = storageService.getActiveSite();

  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [rejectingVisitId, setRejectingVisitId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const siteVisits = state.visits.filter((v) => v.siteId === state.activeSiteId);

  const filteredVisits = siteVisits.filter((v) => {
    if (filter === 'PENDING') return v.state === 'PENDING_APPROVAL';
    if (filter === 'APPROVED') return v.state === 'APPROVED';
    if (filter === 'REJECTED') return v.state === 'REJECTED';
    return true;
  });

  const handleDownloadPdf = () => {
    try {
      setIsExportingPdf(true);
      generateVisitorLogsPdf(
        filteredVisits.length > 0 ? filteredVisits : siteVisits,
        activeTenant,
        activeSite,
        `VISITOR APPROVAL STATUS & AUDIT LOG • ${filter} VISITS`
      );
    } catch (err) {
      console.error('Failed to generate approvals report PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleApprove = (visitId: string, level: 'HOST' | 'DEPARTMENT' | 'SECURITY') => {
    const res = storageService.approveVisit(visitId, level);
    if (res.success) {
      setFeedback(`Approved visit: ${res.visit?.visitorName} (${level} approval level).`);
    } else {
      setFeedback(res.message);
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleConfirmReject = () => {
    if (!rejectingVisitId || !rejectReason.trim()) {
      alert('Please provide a mandatory reason for rejecting this visit.');
      return;
    }

    const res = storageService.rejectVisit(rejectingVisitId, rejectReason.trim());
    if (res.success) {
      setFeedback(`Visit rejected with reason: "${rejectReason.trim()}"`);
      setRejectingVisitId(null);
      setRejectReason('');
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#D8E1E8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#0F766E]" />
            <h1 className="text-lg font-bold text-[#172B3A]">Visitor Approval Workflows</h1>
          </div>
          <p className="text-xs text-[#526575] mt-1">
            Enforces multi-level governance: Host Verification, Department Approval, and Site Physical Security pre-clearance.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Pills */}
          <div className="flex items-center bg-[#F4F7FA] p-1 rounded-lg border border-[#D8E1E8] text-xs">
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                filter === 'PENDING'
                  ? 'bg-[#123B5D] text-white shadow-xs'
                  : 'text-[#526575] hover:text-[#172B3A]'
              }`}
            >
              Pending ({siteVisits.filter((v) => v.state === 'PENDING_APPROVAL').length})
            </button>
            <button
              onClick={() => setFilter('APPROVED')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                filter === 'APPROVED'
                  ? 'bg-[#123B5D] text-white shadow-xs'
                  : 'text-[#526575] hover:text-[#172B3A]'
              }`}
            >
              Approved ({siteVisits.filter((v) => v.state === 'APPROVED').length})
            </button>
            <button
              onClick={() => setFilter('REJECTED')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                filter === 'REJECTED'
                  ? 'bg-[#123B5D] text-white shadow-xs'
                  : 'text-[#526575] hover:text-[#172B3A]'
              }`}
            >
              Rejected ({siteVisits.filter((v) => v.state === 'REJECTED').length})
            </button>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                filter === 'ALL'
                  ? 'bg-[#123B5D] text-white shadow-xs'
                  : 'text-[#526575] hover:text-[#172B3A]'
              }`}
            >
              All Visits
            </button>
          </div>

          <button
            id="approvals-download-visitor-pdf-btn"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf || filteredVisits.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition cursor-pointer shadow-2xs disabled:opacity-50 shrink-0"
            title="Download formatted visitor approvals list as PDF document"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-700" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-teal-700" />
                <span>Download as PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-teal-50 border border-teal-300 text-teal-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Approvals Cards / Table */}
      <div className="space-y-4">
        {filteredVisits.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-[#D8E1E8] shadow-xs text-[#526575]">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
            <p className="text-sm font-semibold text-[#172B3A]">No visits match this filter.</p>
            <p className="text-xs mt-1">Pending approval requests will appear here automatically.</p>
          </div>
        ) : (
          filteredVisits.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-xl border border-[#D8E1E8] shadow-xs p-5 hover:border-slate-400 transition space-y-4 text-xs"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#172B3A]">{v.visitorName}</span>
                    <span className="text-xs text-[#526575]">({v.visitorCompany})</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {v.visitorCategory.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#526575] mt-0.5">
                    Visit ID: <span className="font-mono">{v.id}</span> • Pass Token: <span className="font-mono text-teal-800">{v.passToken}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold border ${
                      v.state === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : v.state === 'PENDING_APPROVAL'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : v.state === 'REJECTED'
                        ? 'bg-red-50 text-red-800 border-red-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {v.state}
                  </span>
                </div>
              </div>

              {/* Visit Details Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#F4F7FA] p-3 rounded-lg border border-[#D8E1E8]">
                <div>
                  <span className="text-[#526575] block font-medium">Host & Department:</span>
                  <span className="font-semibold text-[#172B3A]">{v.hostName}</span>
                  <span className="text-[10px] text-[#526575] block">{v.departmentName}</span>
                </div>
                <div>
                  <span className="text-[#526575] block font-medium">Scheduled Window:</span>
                  <span className="font-semibold text-[#172B3A]">
                    {new Date(v.scheduledStart).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] text-[#526575] block">
                    {new Date(v.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {new Date(v.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  <span className="text-[#526575] block font-medium">Destination Zone:</span>
                  <span className="font-semibold text-[#172B3A]">{v.assignedZone}</span>
                  <span className="text-[10px] text-[#526575] block">{v.musterPoint}</span>
                </div>
              </div>

              {/* Purpose */}
              <div className="text-xs text-slate-800 bg-white p-2.5 rounded border border-slate-200">
                <span className="font-bold text-[#123B5D]">Visit Purpose:</span> {v.purpose}
              </div>

              {/* Approval Stages Multi-Level Indicator */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {/* Host Stage */}
                <div className="flex items-center gap-1.5">
                  <UserCheck className={`w-4 h-4 ${v.approvalStatus.hostApproved ? 'text-emerald-600' : 'text-amber-500'}`} />
                  <span>
                    Host Approval:{' '}
                    <strong className={v.approvalStatus.hostApproved ? 'text-emerald-700' : 'text-amber-600'}>
                      {v.approvalStatus.hostApproved ? 'Approved' : 'Pending'}
                    </strong>
                  </span>
                </div>

                <span className="text-slate-300">•</span>

                {/* Security Stage */}
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className={`w-4 h-4 ${v.approvalStatus.securityApproved ? 'text-emerald-600' : 'text-amber-500'}`} />
                  <span>
                    Security Clearance:{' '}
                    <strong className={v.approvalStatus.securityApproved ? 'text-emerald-700' : 'text-amber-600'}>
                      {v.approvalStatus.securityApproved ? 'Approved' : 'Pending'}
                    </strong>
                  </span>
                </div>

                {v.stateReason && (
                  <div className="text-red-700 font-medium ml-auto">
                    Reason: {v.stateReason}
                  </div>
                )}
              </div>

              {/* Action Buttons if Pending */}
              {v.state === 'PENDING_APPROVAL' && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  {!v.approvalStatus.hostApproved && (
                    <button
                      onClick={() => handleApprove(v.id, 'HOST')}
                      className="bg-[#0F766E] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#0c5e58] transition"
                    >
                      Host Pre-Approve
                    </button>
                  )}

                  {!v.approvalStatus.securityApproved && (
                    <button
                      onClick={() => handleApprove(v.id, 'SECURITY')}
                      className="bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-emerald-800 transition"
                    >
                      Security Admin Approve
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setRejectingVisitId(v.id);
                      setRejectReason('');
                    }}
                    className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded text-xs font-semibold hover:bg-red-100 transition"
                  >
                    Reject Visit
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reject Reason Prompt Modal */}
      {rejectingVisitId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#D8E1E8] shadow-xl max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-[#172B3A]">Reject Visitor Invitation</h3>
              <button onClick={() => setRejectingVisitId(null)} className="text-slate-400">✕</button>
            </div>

            <p className="text-[#526575]">
              Please document the mandatory rejection justification for audit trail logging:
            </p>

            <textarea
              rows={3}
              required
              placeholder="e.g. Incomplete contractor insurance certificate or invalid photo document..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-red-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingVisitId(null)}
                className="px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="bg-red-600 text-white px-4 py-1.5 rounded font-semibold hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
