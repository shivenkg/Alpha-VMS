import React, { useState } from 'react';
import {
  ScanLine,
  Search,
  CheckCircle2,
  AlertCircle,
  Printer,
  ArrowDownLeft,
  ArrowUpRight,
  Shield,
  Clock,
  Camera,
  QrCode,
  Check,
  UserCheck,
  Share2
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Visit } from '../../types';
import { VisitorQrPassModal } from '../common/VisitorQrPassModal';

interface ReceptionViewProps {
  onSelectVisitForBadge: (visit: Visit) => void;
  onNavigateToWalkin: () => void;
  onOpenSharePreRegModal?: () => void;
}

export const ReceptionView: React.FC<ReceptionViewProps> = ({
  onSelectVisitForBadge,
  onNavigateToWalkin,
  onOpenSharePreRegModal,
}) => {
  const state = storageService.getState();
  const activeGate = storageService.getActiveGate();
  const activeSite = storageService.getActiveSite();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'checkin' | 'checkout'>('checkin');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [selectedVisitForQrPass, setSelectedVisitForQrPass] = useState<Visit | null>(null);

  // Filter visits for current site
  const siteVisits = state.visits.filter((v) => v.siteId === state.activeSiteId);

  // Eligible for check-in: APPROVED or ARRIVED
  const eligibleCheckIn = siteVisits.filter((v) => {
    const matchesSearch =
      v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.visitorCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.passToken.toLowerCase().includes(searchQuery.toLowerCase());
    return (v.state === 'APPROVED' || v.state === 'ARRIVED' || v.state === 'INVITED') && matchesSearch;
  });

  // Eligible for check-out: CHECKED_IN
  const eligibleCheckOut = siteVisits.filter((v) => {
    const matchesSearch =
      v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.visitorCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.badgeNumber && v.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return v.state === 'CHECKED_IN' && matchesSearch;
  });

  const handleCheckIn = (visit: Visit) => {
    const res = storageService.checkInVisit(visit.id, activeGate.id);
    if (res.success) {
      if (res.autoPrinted) {
        setFeedback({
          type: 'success',
          message: `Checked in ${visit.visitorName} successfully! Badge #${res.visit?.badgeNumber || ''} auto-printed to thermal printer.`,
        });
      } else {
        setFeedback({
          type: 'success',
          message: `Checked in ${visit.visitorName} successfully! Badge #${res.visit?.badgeNumber || ''} assigned (Manual Print mode).`,
        });
      }
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCheckOut = (visit: Visit) => {
    const res = storageService.checkOutVisit(visit.id, activeGate.id);
    if (res.success) {
      setFeedback({ type: 'success', message: `Checked out ${visit.visitorName}. Badge recorded as surrendered.` });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSimulateScan = (passToken: string) => {
    setSearchQuery(passToken);
    setScannedResult(`Scanned Token: ${passToken}`);
    setIsScannerActive(false);

    const match = siteVisits.find((v) => v.passToken.toUpperCase() === passToken.toUpperCase());
    if (match) {
      if (match.state === 'CHECKED_IN') {
        handleCheckOut(match);
      } else {
        handleCheckIn(match);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Desk Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#D8E1E8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-[#0F766E]" />
            <h1 className="text-lg font-bold text-[#172B3A]">Reception & Security Turnstile Desk</h1>
          </div>
          <p className="text-xs text-[#526575] mt-1 flex flex-wrap items-center gap-1.5">
            <span>Current Station: <strong className="text-[#172B3A]">{activeGate.name}</strong> ({activeGate.type})</span>
            <span>•</span>
            <span>Printer: <strong className="text-[#0F766E]">Zebra ZD421 (Online)</strong></span>
            <span>•</span>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
              storageService.getUserPreferences().autoPrintBadgesOnCheckIn
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-200 text-slate-700'
            }`}>
              <Printer className="w-3 h-3" />
              Auto-Print: {storageService.getUserPreferences().autoPrintBadgesOnCheckIn ? 'ON' : 'MANUAL'}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-300">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>
              Auto-Rendering: LIVE QUEUE
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {onOpenSharePreRegModal && (
            <button
              id="reception-share-prereg-btn"
              onClick={onOpenSharePreRegModal}
              className="border border-teal-600/40 bg-teal-50 text-teal-800 hover:bg-teal-100 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              title="Share Pre-Registration link or display counter QR Code for visitor self-registration"
            >
              <Share2 className="w-3.5 h-3.5 text-teal-700" />
              <span>Share Pre-Reg Link</span>
            </button>
          )}
          <button
            onClick={() => setIsScannerActive(!isScannerActive)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              isScannerActive
                ? 'bg-amber-600 text-white'
                : 'bg-[#0F766E] text-white hover:bg-[#0c5e58]'
            }`}
          >
            <Camera className="w-4 h-4" />
            {isScannerActive ? 'Close QR Scanner' : 'Simulate QR Scanner'}
          </button>
          <button
            onClick={onNavigateToWalkin}
            className="bg-[#123B5D] text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[#0e2f4a] transition"
          >
            + Register Walk-In
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-red-50 text-red-800 border-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Simulated QR Scanner Bar / Modal */}
      {isScannerActive && (
        <div className="bg-[#123B5D] text-white p-5 rounded-xl border border-teal-500/40 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-teal-300" />
              <span className="font-bold text-sm">2D Barcode & Digital Pass Scanner (Honeywell / Camera)</span>
            </div>
            <span className="text-[11px] text-teal-200">Listening on virtual serial port / camera input</span>
          </div>

          <p className="text-xs text-slate-300 mb-3">
            Simulate a physical guest presenting their digital pass QR badge at the turnstile reader. Click any active pass token below to simulate instant optical scan:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {siteVisits.slice(0, 6).map((v) => (
              <button
                key={v.id}
                onClick={() => handleSimulateScan(v.passToken)}
                className="bg-[#0d2a42] hover:bg-teal-900/60 p-2 rounded border border-teal-500/30 text-left transition text-xs"
              >
                <div className="font-bold text-white truncate">{v.visitorName}</div>
                <div className="text-[10px] font-mono text-teal-300 truncate">{v.passToken}</div>
                <div className="text-[10px] text-slate-400">State: {v.state}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs & Search Filter */}
      <div className="bg-white rounded-xl border border-[#D8E1E8] shadow-xs p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center bg-[#F4F7FA] p-1 rounded-lg border border-[#D8E1E8] w-fit">
            <button
              onClick={() => setActiveTab('checkin')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'checkin'
                  ? 'bg-[#123B5D] text-white shadow-xs'
                  : 'text-[#526575] hover:text-[#172B3A]'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Check-In Queue ({eligibleCheckIn.length})
            </button>
            <button
              onClick={() => setActiveTab('checkout')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'checkout'
                  ? 'bg-[#123B5D] text-white shadow-xs'
                  : 'text-[#526575] hover:text-[#172B3A]'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Check-Out Desk ({eligibleCheckOut.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-[#526575] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, company, token, badge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E] text-[#172B3A]"
            />
          </div>
        </div>

        {/* Tab 1: Check-In Queue */}
        {activeTab === 'checkin' && (
          <div>
            {eligibleCheckIn.length === 0 ? (
              <div className="py-12 text-center text-[#526575]">
                <UserCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">No pre-approved visitors waiting for check-in.</p>
                <p className="text-xs text-[#526575] mt-1">Walk-in visitors can be registered using the Walk-In tab.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#D8E1E8] text-[#526575] uppercase text-[10px] tracking-wider font-semibold">
                      <th className="pb-2.5">Visitor</th>
                      <th className="pb-2.5">Pass Token</th>
                      <th className="pb-2.5">Category</th>
                      <th className="pb-2.5">Host & Dept</th>
                      <th className="pb-2.5">Scheduled Window</th>
                      <th className="pb-2.5">Status</th>
                      <th className="pb-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8E1E8]">
                    {eligibleCheckIn.map((v) => (
                      <tr key={v.id} className="hover:bg-[#F4F7FA] transition">
                        <td className="py-3">
                          <div className="font-bold text-[#172B3A]">{v.visitorName}</div>
                          <div className="text-[11px] text-[#526575]">{v.visitorCompany}</div>
                        </td>
                        <td className="py-3 font-mono text-[11px] text-teal-800 font-semibold">
                          {v.passToken}
                        </td>
                        <td className="py-3">
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                            {v.visitorCategory.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="font-medium text-[#172B3A]">{v.hostName}</div>
                          <div className="text-[10px] text-[#526575]">{v.departmentName}</div>
                        </td>
                        <td className="py-3 text-[#526575]">
                          {new Date(v.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(v.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              v.state === 'APPROVED'
                                ? 'bg-teal-50 text-teal-800 border-teal-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                          >
                            {v.state}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedVisitForQrPass(v)}
                              title="View Confirmed Visitor Digital QR Pass & Exit Token"
                              className="p-1.5 rounded bg-teal-50 text-[#0F766E] hover:bg-teal-100 border border-teal-200 transition"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onSelectVisitForBadge(v)}
                              title="Preview & Print Badge"
                              className="p-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCheckIn(v)}
                              className="bg-[#123B5D] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#0e2f4a] transition flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Check In
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Check-Out Desk */}
        {activeTab === 'checkout' && (
          <div>
            {eligibleCheckOut.length === 0 ? (
              <div className="py-12 text-center text-[#526575]">
                <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">No visitors currently inside this facility.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#D8E1E8] text-[#526575] uppercase text-[10px] tracking-wider font-semibold">
                      <th className="pb-2.5">Visitor</th>
                      <th className="pb-2.5">Badge #</th>
                      <th className="pb-2.5">Zone & Muster</th>
                      <th className="pb-2.5">Host</th>
                      <th className="pb-2.5">Entry Time</th>
                      <th className="pb-2.5">Duration</th>
                      <th className="pb-2.5 text-right">Check-Out</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8E1E8]">
                    {eligibleCheckOut.map((v) => {
                      const entryTime = v.actualCheckIn ? new Date(v.actualCheckIn).getTime() : Date.now();
                      const elapsedMinutes = Math.max(1, Math.round((Date.now() - entryTime) / 60000));
                      const isOverstay = elapsedMinutes > 480; // 8 hours

                      return (
                        <tr key={v.id} className="hover:bg-[#F4F7FA] transition">
                          <td className="py-3">
                            <div className="font-bold text-[#172B3A]">{v.visitorName}</div>
                            <div className="text-[11px] text-[#526575]">{v.visitorCompany}</div>
                          </td>
                          <td className="py-3 font-mono font-bold text-teal-800">
                            {v.badgeNumber || 'N/A'}
                          </td>
                          <td className="py-3">
                            <div className="text-[#172B3A]">{v.assignedZone}</div>
                            <div className="text-[10px] text-[#526575]">{v.musterPoint}</div>
                          </td>
                          <td className="py-3 text-[#172B3A]">{v.hostName}</td>
                          <td className="py-3 text-[#526575]">
                            {v.actualCheckIn ? new Date(v.actualCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </td>
                          <td className="py-3">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                isOverstay
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {Math.floor(elapsedMinutes / 60)}h {elapsedMinutes % 60}m
                              {isOverstay && ' (Overstay)'}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedVisitForQrPass(v)}
                                title="Open Confirmed Visitor QR Pass & Simulate Exit Gate Optical Scan"
                                className="bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-300 px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>Scan Exit QR</span>
                              </button>
                              <button
                                onClick={() => handleCheckOut(v)}
                                className="bg-[#123B5D] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#0e2f4a] transition"
                              >
                                Process Exit
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmed Visitor QR Pass & Quick Exit Gate Modal */}
      <VisitorQrPassModal
        isOpen={Boolean(selectedVisitForQrPass)}
        onClose={() => setSelectedVisitForQrPass(null)}
        visit={selectedVisitForQrPass}
      />
    </div>
  );
};
