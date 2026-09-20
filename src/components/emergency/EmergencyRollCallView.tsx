import React, { useState } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  Users,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio,
  Download,
  Check,
  X
} from 'lucide-react';
import { storageService } from '../../services/storageService';

export const EmergencyRollCallView: React.FC = () => {
  const state = storageService.getState();
  const activeSite = storageService.getActiveSite();

  const [emergencyType, setEmergencyType] = useState<'FIRE' | 'SECURITY' | 'DRILL' | 'WEATHER'>('FIRE');
  const [instructions, setInstructions] = useState('Evacuate via nearest emergency exit. Assemble at designated North Lawn & West Parking muster zones.');

  const currentlyInside = state.visits.filter(
    (v) => v.siteId === state.activeSiteId && v.state === 'CHECKED_IN'
  );

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
  };

  const handleClearEmergency = () => {
    if (window.confirm('Declare ALL CLEAR and restore normal facility gate operations?')) {
      storageService.toggleEmergency(false);
    }
  };

  const handleToggleAccounted = (visitId: string, currentStatus?: boolean) => {
    storageService.updateEmergencyAccountability(visitId, !currentStatus);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className={`p-6 rounded-xl border shadow-sm transition ${
          state.isEmergencyActive
            ? 'bg-red-950 text-white border-red-600 animate-pulse'
            : 'bg-white text-[#172B3A] border-[#D8E1E8]'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                state.isEmergencyActive ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'
              }`}
            >
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black">
                  {state.isEmergencyActive
                    ? 'FACILITY EMERGENCY EVACUATION ACTIVE'
                    : 'Emergency Evacuation & Roll Call Command'}
                </h1>
                {state.isEmergencyActive && (
                  <span className="text-xs bg-red-600 text-white font-extrabold uppercase px-2 py-0.5 rounded">
                    HIGH ALERT
                  </span>
                )}
              </div>
              <p
                className={`text-xs mt-1 ${
                  state.isEmergencyActive ? 'text-red-200' : 'text-[#526575]'
                }`}
              >
                Target Facility: <span className="font-bold">{activeSite.name}</span> • Real-time physical accountability roster
              </p>
            </div>
          </div>

          <div>
            {state.isEmergencyActive ? (
              <button
                onClick={handleClearEmergency}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-md"
              >
                Declare All Clear & Reset
              </button>
            ) : (
              <button
                onClick={handleTriggerEmergency}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center gap-2"
              >
                <Flame className="w-4 h-4" />
                Initiate Emergency Evacuation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#D8E1E8] shadow-xs">
          <span className="text-xs font-medium text-[#526575]">Total Visitors In Building</span>
          <div className="mt-2 text-2xl font-bold text-[#172B3A]">{currentlyInside.length}</div>
          <p className="text-[11px] text-[#526575] mt-1">Requires 100% headcount verification</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-300 shadow-xs">
          <span className="text-xs font-medium text-emerald-700">Accounted For at Muster Points</span>
          <div className="mt-2 text-2xl font-bold text-emerald-700">{accountedCount}</div>
          <p className="text-[11px] text-emerald-600 mt-1">Verified safe at designated zones</p>
        </div>

        <div
          className={`p-4 rounded-xl border shadow-xs ${
            missingCount > 0 ? 'bg-amber-50 border-amber-300' : 'bg-white border-[#D8E1E8]'
          }`}
        >
          <span className={`text-xs font-medium ${missingCount > 0 ? 'text-amber-800' : 'text-[#526575]'}`}>
            Unaccounted / Missing
          </span>
          <div className={`mt-2 text-2xl font-bold ${missingCount > 0 ? 'text-amber-900' : 'text-[#172B3A]'}`}>
            {missingCount}
          </div>
          <p className={`text-[11px] mt-1 ${missingCount > 0 ? 'text-amber-700 font-semibold' : 'text-[#526575]'}`}>
            {accountabilityPercentage}% overall accountability
          </p>
        </div>
      </div>

      {/* Roll Call Checklist Table */}
      <div className="bg-white rounded-xl border border-[#D8E1E8] shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#172B3A]">Muster Point Accountability Roll Call</h2>
            <p className="text-xs text-[#526575]">Mark each visitor as verified safe at evacuation points</p>
          </div>

          <button
            onClick={() => alert('Roll call summary exported for first responders.')}
            className="bg-[#F4F7FA] text-[#123B5D] border border-[#D8E1E8] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-100 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export First Responder Roster
          </button>
        </div>

        {currentlyInside.length === 0 ? (
          <div className="p-8 text-center text-[#526575] bg-[#F4F7FA] rounded-lg border border-dashed border-[#D8E1E8]">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            <p className="text-xs font-semibold">Zero visitors inside this site. All clear!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-[#526575] font-semibold text-[10px] uppercase">
                  <th className="pb-2.5">Visitor</th>
                  <th className="pb-2.5">Company</th>
                  <th className="pb-2.5">Assigned Zone</th>
                  <th className="pb-2.5">Designated Muster Point</th>
                  <th className="pb-2.5">Host Contact</th>
                  <th className="pb-2.5 text-right">Accountability Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E1E8]">
                {currentlyInside.map((v) => (
                  <tr
                    key={v.id}
                    className={`transition ${
                      v.isAccountedForInEmergency ? 'bg-emerald-50/50' : 'hover:bg-[#F4F7FA]'
                    }`}
                  >
                    <td className="py-3">
                      <div className="font-bold text-[#172B3A]">{v.visitorName}</div>
                      <div className="text-[10px] text-[#526575] font-mono">Badge: {v.badgeNumber}</div>
                    </td>
                    <td className="py-3 font-medium text-[#172B3A]">{v.visitorCompany}</td>
                    <td className="py-3 font-semibold text-slate-800">{v.assignedZone}</td>
                    <td className="py-3 text-teal-800 font-medium">{v.musterPoint}</td>
                    <td className="py-3">
                      <div className="text-[#172B3A]">{v.hostName}</div>
                      <div className="text-[10px] text-[#526575]">{v.departmentName}</div>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleToggleAccounted(v.id, v.isAccountedForInEmergency)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto ${
                          v.isAccountedForInEmergency
                            ? 'bg-emerald-700 text-white'
                            : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                        }`}
                      >
                        {v.isAccountedForInEmergency ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
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
