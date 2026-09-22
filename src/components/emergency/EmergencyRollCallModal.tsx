import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Users,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Check,
  X,
  FileDown,
  Loader2,
  Search,
  Maximize2,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { generateVisitorLogsPdf } from '../../utils/reportPdfGenerator';

interface EmergencyRollCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullView?: () => void;
}

export const EmergencyRollCallModal: React.FC<EmergencyRollCallModalProps> = ({
  isOpen,
  onClose,
  onOpenFullView,
}) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return storageService.subscribe(() => setTick((t) => t + 1));
  }, []);

  const state = storageService.getState();
  const activeTenant = storageService.getActiveTenant();
  const activeSite = storageService.getActiveSite();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMusterFilter, setSelectedMusterFilter] = useState('ALL');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  if (!isOpen) return null;

  const currentlyInside = state.visits.filter(
    (v) => v.siteId === state.activeSiteId && v.state === 'CHECKED_IN'
  );

  const musterPoints = Array.from(
    new Set(currentlyInside.map((v) => v.musterPoint).filter(Boolean))
  );

  const filteredVisitors = currentlyInside.filter((v) => {
    const matchesMuster =
      selectedMusterFilter === 'ALL' || v.musterPoint === selectedMusterFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      v.visitorName.toLowerCase().includes(q) ||
      v.visitorCompany.toLowerCase().includes(q) ||
      (v.badgeNumber && v.badgeNumber.toLowerCase().includes(q)) ||
      (v.assignedZone && v.assignedZone.toLowerCase().includes(q));
    return matchesMuster && matchesSearch;
  });

  const accountedCount = currentlyInside.filter((v) => v.isAccountedForInEmergency).length;
  const missingCount = currentlyInside.length - accountedCount;
  const accountabilityPercentage =
    currentlyInside.length > 0
      ? Math.round((accountedCount / currentlyInside.length) * 100)
      : 100;

  const handleToggleAccounted = (visitId: string, currentStatus?: boolean) => {
    storageService.updateEmergencyAccountability(visitId, !currentStatus);
  };

  const handleMarkAllAccounted = () => {
    storageService.markAllVisitorsAccountedInEmergency(true);
    showToast('All visitors at this facility marked Accounted Safe.');
  };

  const handleResetRollCall = () => {
    storageService.markAllVisitorsAccountedInEmergency(false);
    showToast('Muster point accountability marks have been reset for re-verification.');
  };

  const handleDeclareAllClear = () => {
    storageService.toggleEmergency(false);
    setIsConfirmingClear(false);
    showToast(`ALL CLEAR DECLARED: Normal access restored at ${activeSite.name}.`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleSeedDrillVisitors = () => {
    storageService.seedDrillVisitorsIfEmpty();
    showToast('Checked in 3 demo visitors across muster points for drill accountability.');
  };

  const handleDownloadEmergencyPdf = () => {
    try {
      setIsExportingPdf(true);
      generateVisitorLogsPdf(
        currentlyInside,
        activeTenant,
        activeSite,
        `FIRST RESPONDER EMERGENCY MUSTER ROLL CALL • ${activeSite.name.toUpperCase()}`
      );
      showToast('First Responder Roll Call PDF successfully generated.');
    } catch (err) {
      console.error('Failed to generate emergency roll call PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div
      id="emergency-roll-call-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-fadeIn"
    >
      <div
        id="emergency-roll-call-modal-content"
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-red-300 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-red-700 via-red-800 to-rose-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0 shadow-xs border border-white/20">
              <AlertOctagon className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Facility Evacuation Roll Call Command
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-500 text-white uppercase tracking-wider border border-white/20 shadow-2xs">
                  {state.isEmergencyActive ? 'HIGH ALERT • ACTIVE' : 'STANDBY • ROLL CALL'}
                </span>
              </div>
              <p className="text-xs text-red-100 mt-0.5">
                Target Facility: <span className="font-bold text-white underline">{activeSite.name}</span> • Real-Time Muster Point Accountability
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenFullView && (
              <button
                type="button"
                id="emergency-modal-expand-btn"
                onClick={onOpenFullView}
                title="Open in full screen view"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              id="emergency-modal-close-btn"
              onClick={onClose}
              title="Close modal"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback Toast */}
        {feedbackToast && (
          <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between shadow-md">
            <span>{feedbackToast}</span>
            <button
              type="button"
              onClick={() => setFeedbackToast(null)}
              className="text-white hover:text-emerald-100 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body Content - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500">Total Visitors Inside</span>
                <div className="text-2xl font-bold text-slate-900 mt-0.5">{currentlyInside.length}</div>
                <p className="text-[10px] text-slate-500 mt-0.5">Checked-in on premises</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-slate-200/70 text-slate-700 flex items-center justify-center font-bold text-sm">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/70 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-emerald-800">Accounted Safe</span>
                <div className="text-2xl font-bold text-emerald-700 mt-0.5">{accountedCount}</div>
                <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Verified at muster zones</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-200/80 text-emerald-800 flex items-center justify-center font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                missingCount > 0
                  ? 'border-amber-300 bg-amber-50/90 text-amber-900'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <div>
                <span className="text-xs font-medium">Unaccounted / Missing</span>
                <div className="text-2xl font-bold mt-0.5">{missingCount}</div>
                <p className="text-[10px] font-semibold mt-0.5">
                  {accountabilityPercentage}% headcount confirmed
                </p>
              </div>
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                  missingCount > 0
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-slate-200/70 text-slate-700'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Operational Controls & Bulk Tools Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="emergency-modal-search-input"
                  type="text"
                  placeholder="Search visitor, badge, zone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {musterPoints.length > 0 && (
                <select
                  id="emergency-modal-muster-filter"
                  value={selectedMusterFilter}
                  onChange={(e) => setSelectedMusterFilter(e.target.value)}
                  className="text-xs py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden font-medium text-slate-700"
                >
                  <option value="ALL">All Muster Points ({currentlyInside.length})</option>
                  {musterPoints.map((mp) => (
                    <option key={mp} value={mp}>
                      {mp}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {currentlyInside.length > 0 && (
                <>
                  <button
                    type="button"
                    id="emergency-modal-mark-all-safe-btn"
                    onClick={handleMarkAllAccounted}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark All Safe</span>
                  </button>

                  <button
                    type="button"
                    id="emergency-modal-reset-roster-btn"
                    onClick={handleResetRollCall}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="Reset all marks for fresh roll call"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>Reset Marks</span>
                  </button>
                </>
              )}

              {currentlyInside.length === 0 && (
                <button
                  type="button"
                  id="emergency-modal-seed-drill-btn"
                  onClick={handleSeedDrillVisitors}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Seed Drill Visitors</span>
                </button>
              )}

              <button
                type="button"
                id="emergency-modal-download-pdf-btn"
                onClick={handleDownloadEmergencyPdf}
                disabled={isExportingPdf || currentlyInside.length === 0}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
                title="Download formatted roll call PDF for emergency first responders"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-red-700" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-3.5 h-3.5 text-red-700" />
                    <span>Export PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Table of Visitors Inside */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            {currentlyInside.length === 0 ? (
              <div className="p-8 text-center bg-slate-50">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">Facility Zero Occupancy</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  No visitors are currently marked checked-in at {activeSite.name}. All zones are clear.
                </p>
                <button
                  type="button"
                  onClick={handleSeedDrillVisitors}
                  className="mt-3.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Check In 3 Drill Visitors to Test Roll Call</span>
                </button>
              </div>
            ) : filteredVisitors.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50">
                No visitors matching current search or muster point filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold text-[10px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3.5">Visitor & Badge</th>
                      <th className="py-2.5 px-3">Company</th>
                      <th className="py-2.5 px-3">Assigned Zone</th>
                      <th className="py-2.5 px-3">Designated Muster Point</th>
                      <th className="py-2.5 px-3">Host Contact</th>
                      <th className="py-2.5 px-3.5 text-right">Accountability Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVisitors.map((v) => (
                      <tr
                        key={v.id}
                        className={`transition-colors ${
                          v.isAccountedForInEmergency
                            ? 'bg-emerald-50/60'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2.5 px-3.5">
                          <div className="font-bold text-slate-900">{v.visitorName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Badge: {v.badgeNumber || 'N/A'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {v.visitorCompany}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">
                          {v.assignedZone}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                            {v.musterPoint || 'Muster Point #1'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="text-slate-800 font-medium">{v.hostName}</div>
                          <div className="text-[10px] text-slate-500">{v.departmentName}</div>
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <button
                            type="button"
                            id={`emergency-toggle-accounted-${v.id}`}
                            onClick={() =>
                              handleToggleAccounted(v.id, v.isAccountedForInEmergency)
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto cursor-pointer shadow-2xs ${
                              v.isAccountedForInEmergency
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {v.isAccountedForInEmergency ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white" />
                                <span>Accounted Safe</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                                <span>Mark Accounted</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Bar with Declare All Clear & Reset */}
        <div className="p-3.5 sm:p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Facility Gate Systems & Turnstiles in Emergency Protocol</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {isConfirmingClear ? (
              <div className="flex items-center gap-2 bg-emerald-50 p-1.5 rounded-xl border border-emerald-300">
                <span className="text-xs font-semibold text-emerald-900 px-1">
                  Restore normal facility gate access?
                </span>
                <button
                  type="button"
                  id="emergency-modal-confirm-declare-all-clear"
                  onClick={handleDeclareAllClear}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Yes, Declare All Clear & Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingClear(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="emergency-modal-declare-all-clear-btn"
                onClick={() => setIsConfirmingClear(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                title="Declare All Clear, reset accountability roster, and restore normal gates"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Declare All Clear & Reset</span>
              </button>
            )}

            <button
              type="button"
              id="emergency-modal-done-btn"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
