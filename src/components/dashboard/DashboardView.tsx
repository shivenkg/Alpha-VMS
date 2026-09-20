import React from 'react';
import {
  Users,
  Clock,
  CheckSquare,
  Printer,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Visit } from '../../types';

interface DashboardViewProps {
  onNavigate: (view: any) => void;
  onSelectVisitForBadge: (visit: Visit) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onSelectVisitForBadge }) => {
  const state = storageService.getState();
  const activeTenant = storageService.getActiveTenant();
  const activeSite = storageService.getActiveSite();

  const currentSiteVisits = state.visits.filter((v) => v.siteId === state.activeSiteId);
  const currentlyInside = currentSiteVisits.filter((v) => v.state === 'CHECKED_IN');
  const pendingApprovals = currentSiteVisits.filter((v) => v.state === 'PENDING_APPROVAL');
  const expectedToday = currentSiteVisits.filter((v) => v.state === 'APPROVED' || v.state === 'ARRIVED');
  const completedToday = currentSiteVisits.filter((v) => v.state === 'CHECKED_OUT');

  const onlinePrintersCount = state.devices.filter((d) => d.type === 'BADGE_PRINTER' && d.status === 'ONLINE').length;

  const handleQuickApprove = (visitId: string) => {
    storageService.approveVisit(visitId, 'SECURITY');
  };

  const handleQuickCheckIn = (visitId: string) => {
    storageService.checkInVisit(visitId);
  };

  const handleQuickCheckOut = (visitId: string) => {
    storageService.checkOutVisit(visitId);
  };

  return (
    <div className="space-y-6">
      {/* Site Context Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#D8E1E8] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-[#172B3A]">{activeSite.name}</h1>
            <span className="text-xs bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded border border-teal-200">
              {activeSite.code}
            </span>
            <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Auto-Rendering: LIVE STREAM
            </span>
          </div>
          <p className="text-xs text-[#526575] mt-1">
            {activeSite.address} • Timezone: <span className="font-mono">{activeSite.timezone}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('reception')}
            className="bg-[#123B5D] text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-[#0e2f4a] transition shadow-xs flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Open Reception Desk
          </button>
          <button
            onClick={() => onNavigate('walkin')}
            className="bg-[#0F766E] text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-[#0c5e58] transition shadow-xs"
          >
            Register Walk-In
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Currently Inside */}
        <div className="bg-white p-4 rounded-xl border border-[#D8E1E8] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#526575]">Currently On-Premises</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#172B3A]">{currentlyInside.length}</span>
            <span className="text-xs text-emerald-600 font-medium">live active</span>
          </div>
          <p className="text-[11px] text-[#526575] mt-1">Across all zones and buildings</p>
        </div>

        {/* Expected Today */}
        <div className="bg-white p-4 rounded-xl border border-[#D8E1E8] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#526575]">Approved / Arriving</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#123B5D] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#172B3A]">{expectedToday.length}</span>
            <span className="text-xs text-slate-500 font-medium">pending check-in</span>
          </div>
          <p className="text-[11px] text-[#526575] mt-1">Scheduled for arrival today</p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-4 rounded-xl border border-[#D8E1E8] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#526575]">Pending Approvals</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#172B3A]">{pendingApprovals.length}</span>
            {pendingApprovals.length > 0 && (
              <span className="text-xs text-amber-600 font-medium">action required</span>
            )}
          </div>
          <p className="text-[11px] text-[#526575] mt-1">Host & security escalations</p>
        </div>

        {/* Hardware Status */}
        <div className="bg-white p-4 rounded-xl border border-[#D8E1E8] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#526575]">Thermal Badge Printers</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#172B3A]">{onlinePrintersCount} Online</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Zebra & Brother spools ready</p>
        </div>
      </div>

      {/* Two Column Layout: Currently Inside Roster + Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live On-Premises Visitors */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#D8E1E8] shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#172B3A]">Currently Inside Facility</h2>
              <p className="text-xs text-[#526575]">Live headcount with active assigned badges</p>
            </div>
            <button
              onClick={() => onNavigate('reception')}
              className="text-xs text-[#0F766E] font-semibold hover:underline"
            >
              View Turnstile Desk →
            </button>
          </div>

          {currentlyInside.length === 0 ? (
            <div className="p-8 text-center text-[#526575] bg-[#F4F7FA] rounded-lg border border-dashed border-[#D8E1E8]">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-xs font-medium">No visitors currently inside this facility.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#D8E1E8] text-[#526575] uppercase text-[10px] tracking-wider font-semibold">
                    <th className="pb-2">Visitor</th>
                    <th className="pb-2">Company / Category</th>
                    <th className="pb-2">Host & Dept</th>
                    <th className="pb-2">Badge #</th>
                    <th className="pb-2">Checked In</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8E1E8]">
                  {currentlyInside.map((v) => (
                    <tr key={v.id} className="hover:bg-[#F4F7FA] transition">
                      <td className="py-3 font-semibold text-[#172B3A]">{v.visitorName}</td>
                      <td className="py-3">
                        <div className="text-[#172B3A] font-medium">{v.visitorCompany}</div>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {v.visitorCategory.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="text-[#172B3A]">{v.hostName}</div>
                        <div className="text-[10px] text-[#526575]">{v.departmentName}</div>
                      </td>
                      <td className="py-3 font-mono font-medium text-teal-800 bg-teal-50/50 px-2 py-1 rounded w-fit">
                        {v.badgeNumber || 'N/A'}
                      </td>
                      <td className="py-3 text-[#526575]">
                        {v.actualCheckIn ? new Date(v.actualCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectVisitForBadge(v)}
                            title="Print / View Badge"
                            className="p-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleQuickCheckOut(v.id)}
                            className="bg-[#123B5D] text-white px-2.5 py-1 rounded text-xs font-semibold hover:bg-[#0d2a42]"
                          >
                            Check Out
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

        {/* Right Col: Pending Approval Queue */}
        <div className="bg-white rounded-xl border border-[#D8E1E8] shadow-xs p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#172B3A]">Pending Approvals</h2>
              <p className="text-xs text-[#526575]">Awaiting Host or Security Pre-Clearance</p>
            </div>
            <button
              onClick={() => onNavigate('approvals')}
              className="text-xs text-[#0F766E] font-semibold hover:underline"
            >
              All ({pendingApprovals.length}) →
            </button>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="p-6 text-center text-[#526575] bg-[#F4F7FA] rounded-lg border border-dashed border-[#D8E1E8] my-auto">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <p className="text-xs font-medium">All visits approved. Zero backlog.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[350px]">
              {pendingApprovals.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-lg border border-[#D8E1E8] bg-[#F4F7FA] hover:border-slate-400 transition text-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-[#172B3A]">{v.visitorName}</div>
                      <div className="text-[11px] text-[#526575]">{v.visitorCompany}</div>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded border border-amber-200">
                      APPROVAL REQ
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                    <span className="font-medium text-slate-900">Purpose:</span> {v.purpose}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#526575]">
                    <span>Host: {v.hostName}</span>
                    <span>Zone: {v.assignedZone}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                    <button
                      onClick={() => handleQuickApprove(v.id)}
                      className="flex-1 bg-emerald-700 text-white py-1 rounded text-xs font-semibold hover:bg-emerald-800 flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => storageService.rejectVisit(v.id, 'Declined by Security')}
                      className="px-2 py-1 rounded text-xs text-red-600 bg-red-50 hover:bg-red-100 font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expected Arrivals & Quick Actions */}
      <div className="bg-white rounded-xl border border-[#D8E1E8] shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#172B3A]">Expected Scheduled Arrivals</h2>
            <p className="text-xs text-[#526575]">Visitors with approved digital passes ready for check-in</p>
          </div>
          <button
            onClick={() => onNavigate('invitations')}
            className="text-xs text-[#0F766E] font-semibold hover:underline"
          >
            Create Invitation →
          </button>
        </div>

        {expectedToday.length === 0 ? (
          <p className="text-xs text-[#526575] py-4 text-center">No upcoming scheduled visits pending arrival.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expectedToday.map((v) => (
              <div
                key={v.id}
                className="p-3.5 rounded-lg border border-[#D8E1E8] hover:shadow-xs transition bg-[#F4F7FA] space-y-2 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-[#172B3A]">{v.visitorName}</h3>
                    <p className="text-[11px] text-[#526575]">{v.visitorCompany}</p>
                  </div>
                  <span className="text-[10px] bg-teal-50 text-[#0F766E] border border-teal-200 font-bold px-1.5 py-0.5 rounded">
                    APPROVED
                  </span>
                </div>

                <div className="text-[11px] text-[#526575]">
                  <div>Pass: <span className="font-mono text-slate-800">{v.passToken}</span></div>
                  <div>Scheduled: {new Date(v.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => handleQuickCheckIn(v.id)}
                    className="flex-1 bg-[#123B5D] text-white py-1.5 rounded text-xs font-semibold hover:bg-[#0e2f4a] flex items-center justify-center gap-1"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    Process Check-In
                  </button>
                  <button
                    onClick={() => onSelectVisitForBadge(v)}
                    title="Print Badge"
                    className="p-1.5 rounded bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
