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
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { generateVisitorLogsPdf } from '../../utils/reportPdfGenerator';

export const EmergencyRollCallView: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return storageService.subscribe(() => setTick((t) => t + 1));
  }, []);

  const state = storageService.getState();
  const activeTenant = storageService.getActiveTenant();
  const activeSite = storageService.getActiveSite();

  const [emergencyType, setEmergencyType] = useState<'FIRE' | 'SECURITY' | 'DRILL' | 'WEATHER'>('FIRE');
  const [instructions, setInstructions] = useState(
    'Evacuate via nearest emergency exit. Assemble at designated North Lawn & West Parking muster zones.'
  );
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMusterFilter, setSelectedMusterFilter] = useState('ALL');
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

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

  const handleTriggerEmergency = () => {
    storageService.toggleEmergency(true, {
      type: emergencyType,
      declaredAt: new Date().toISOString(),
      declaredBy: storageService.getActiveUser().name,
      siteId: activeSite.id,
      instructions,
    });
    showToast(`EMERGENCY DECLARED: Evacuation protocols active for ${activeSite.name}.`);
  };

  const handleClearEmergency = () => {
    storageService.toggleEmergency(false);
    setIsConfirmingClear(false);
    showToast(`ALL CLEAR DECLARED: Normal facility operations restored at ${activeSite.name}.`);
  };

  const handleToggleAccounted = (visitId: string, currentStatus?: boolean) => {
    storageService.updateEmergencyAccountability(visitId, !currentStatus);
  };

  const handleMarkAllAccounted = () => {
    storageService.markAllVisitorsAccountedInEmergency(true);
    showToast('All checked-in visitors marked Accounted Safe.');
  };

  const handleResetRollCall = () => {
    storageService.markAllVisitorsAccountedInEmergency(false);
    showToast('Accountability checkmarks reset for fresh roll call verification.');
  };

  const handleSeedDrillVisitors = () => {
    storageService.seedDrillVisitorsIfEmpty();
    showToast('Checked in 3 demo visitors across muster points for drill verification.');
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
      showToast('First responder muster roll call PDF downloaded successfully.');
    } catch (err) {
      console.error('Failed to generate emergency roll call PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{feedbackToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            className="text-white hover:text-emerald-100 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div
        className={`p-6 rounded-2xl border shadow-sm transition-all duration-200 ${
          state.isEmergencyActive
            ? 'bg-gradient-to-r from-red-950 via-red-900 to-rose-950 text-white border-red-600 animate-pulse'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                state.isEmergencyActive
                  ? 'bg-red-600 text-white ring-4 ring-red-500/30'
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}
            >
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {state.isEmergencyActive
                    ? 'FACILITY EMERGENCY EVACUATION ACTIVE'
                    : 'Emergency Evacuation & Roll Call Command'}
                </h1>
                {state.isEmergencyActive && (
                  <span className="text-xs bg-red-600 text-white font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-white/20 shadow-2xs">
                    HIGH ALERT
                  </span>
                )}
              </div>
              <p
                className={`text-xs mt-1 ${
                  state.isEmergencyActive ? 'text-red-200' : 'text-slate-500'
                }`}
              >
                Target Facility: <strong className="font-bold underline">{activeSite.name}</strong> • Real-time physical accountability roster & first-responder export
              </p>
              {state.isEmergencyActive && state.emergencyAlertDetails && (
                <div className="mt-2 text-xs text-red-200 flex items-center gap-2 flex-wrap">
                  <span className="bg-red-800/80 px-2 py-0.5 rounded text-[11px] font-mono border border-red-700">
                    Type: {state.emergencyAlertDetails.type}
                  </span>
                  <span>Declared by: <strong className="text-white">{state.emergencyAlertDetails.declaredBy}</strong></span>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            {state.isEmergencyActive ? (
              isConfirmingClear ? (
                <div className="flex items-center gap-2 bg-emerald-950/90 p-2 rounded-xl border border-emerald-500 shadow-lg">
                  <span className="text-xs font-semibold text-emerald-200 px-1">
                    Confirm Declare All Clear?
                  </span>
                  <button
                    type="button"
                    id="confirm-declare-all-clear-btn"
                    onClick={handleClearEmergency}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Yes, Declare All Clear & Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClear(false)}
                    className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="declare-all-clear-reset-btn"
                  onClick={() => setIsConfirmingClear(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  title="Declare All Clear, restore access gates, and reset muster point roll call"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Declare All Clear & Reset</span>
                </button>
              )
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value as any)}
                  className="text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-hidden"
                >
                  <option value="FIRE">Fire Alarm</option>
                  <option value="SECURITY">Security Lockdown</option>
                  <option value="DRILL">Evacuation Drill</option>
                  <option value="WEATHER">Severe Weather</option>
                </select>

                <button
                  type="button"
                  id="initiate-emergency-evacuation-btn"
                  onClick={handleTriggerEmergency}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Flame className="w-4 h-4" />
                  <span>Initiate Emergency Evacuation</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Visitors In Building</span>
            <div className="mt-1 text-2xl font-bold text-slate-900">{currentlyInside.length}</div>
            <p className="text-[11px] text-slate-500 mt-1">Requires 100% headcount verification</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-300 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-emerald-700">Accounted For at Muster Points</span>
            <div className="mt-1 text-2xl font-bold text-emerald-700">{accountedCount}</div>
            <p className="text-[11px] text-emerald-600 mt-1">Verified safe at designated zones</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border shadow-xs flex items-center justify-between ${
            missingCount > 0 ? 'bg-amber-50/80 border-amber-300' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <span className={`text-xs font-medium ${missingCount > 0 ? 'text-amber-800' : 'text-slate-500'}`}>
              Unaccounted / Missing
            </span>
            <div className={`mt-1 text-2xl font-bold ${missingCount > 0 ? 'text-amber-900' : 'text-slate-900'}`}>
              {missingCount}
            </div>
            <p className={`text-[11px] mt-1 ${missingCount > 0 ? 'text-amber-700 font-semibold' : 'text-slate-500'}`}>
              {accountabilityPercentage}% overall accountability
            </p>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              missingCount > 0 ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Roll Call Checklist Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        {/* Controls and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Muster Point Accountability Roll Call</h2>
            <p className="text-xs text-slate-500">Mark each visitor as verified safe at designated evacuation assembly points</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {currentlyInside.length > 0 && (
              <>
                <button
                  type="button"
                  id="roll-call-mark-all-safe-btn"
                  onClick={handleMarkAllAccounted}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark All Safe</span>
                </button>

                <button
                  type="button"
                  id="roll-call-reset-marks-btn"
                  onClick={handleResetRollCall}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition flex items-center gap-1 shadow-2xs cursor-pointer"
                  title="Reset all marks for fresh roll call verification"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Marks</span>
                </button>
              </>
            )}

            {currentlyInside.length === 0 && (
              <button
                type="button"
                id="roll-call-seed-drill-btn"
                onClick={handleSeedDrillVisitors}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Seed Drill Visitors</span>
              </button>
            )}

            <button
              id="emergency-download-visitor-pdf-btn"
              type="button"
              onClick={handleDownloadEmergencyPdf}
              disabled={isExportingPdf || currentlyInside.length === 0}
              className="bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
              title="Download formatted first responder emergency muster roll call as PDF"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-700" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5 text-red-700" />
                  <span>Download Roster PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter bar */}
        {currentlyInside.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="roll-call-search-input"
                type="text"
                placeholder="Search visitor, badge, host, zone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {musterPoints.length > 0 && (
              <select
                id="roll-call-muster-filter-select"
                value={selectedMusterFilter}
                onChange={(e) => setSelectedMusterFilter(e.target.value)}
                className="text-xs py-1.5 px-3 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden"
              >
                <option value="ALL">All Muster Assembly Points ({currentlyInside.length})</option>
                {musterPoints.map((mp) => (
                  <option key={mp} value={mp}>
                    {mp}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {currentlyInside.length === 0 ? (
          <div className="p-10 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2.5 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-800">Zero Visitors Currently Inside Facility</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No active checked-in visitor sessions are logged at {activeSite.name}. The building is physically verified clear.
            </p>
            <button
              type="button"
              onClick={handleSeedDrillVisitors}
              className="mt-4 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Check In 3 Drill Visitors to Test Roll Call</span>
            </button>
          </div>
        ) : filteredVisitors.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
            No visitors matching the current search query or muster zone filter.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5">Visitor & Badge</th>
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">Assigned Zone</th>
                  <th className="py-2.5 px-3">Designated Muster Point</th>
                  <th className="py-2.5 px-3">Host Contact</th>
                  <th className="py-2.5 px-3.5 text-right">Accountability Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisitors.map((v) => (
                  <tr
                    key={v.id}
                    className={`transition-colors ${
                      v.isAccountedForInEmergency ? 'bg-emerald-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900">{v.visitorName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Badge: {v.badgeNumber || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">{v.visitorCompany}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{v.assignedZone}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                        {v.musterPoint || 'Muster Point #1'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">{v.hostName}</div>
                      <div className="text-[10px] text-slate-500">{v.departmentName}</div>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button
                        type="button"
                        id={`roll-call-toggle-${v.id}`}
                        onClick={() => handleToggleAccounted(v.id, v.isAccountedForInEmergency)}
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
  );
};
