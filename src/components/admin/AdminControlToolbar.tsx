import React, { useState } from 'react';
import {
  Building2,
  DoorOpen,
  Share2,
  Sliders,
  Bell,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { OfflineSyncIndicator } from '../common/OfflineSyncIndicator';
import { UserRole } from '../../types';

interface AdminControlToolbarProps {
  onOpenSharePreRegModal?: () => void;
  onOpenSettingsModal?: () => void;
  onOpenProfileModal?: () => void;
  onOpenEmergencyModal?: () => void;
  onLogout?: () => void;
  onRoleAutoRender?: (role: UserRole) => void;
  isAutoRenderingEnabled?: boolean;
  onToggleAutoRendering?: () => void;
}

export const AdminControlToolbar: React.FC<AdminControlToolbarProps> = ({
  onOpenSharePreRegModal,
  onOpenSettingsModal,
  onOpenProfileModal,
  onOpenEmergencyModal,
  onLogout,
  onRoleAutoRender,
  isAutoRenderingEnabled = true,
  onToggleAutoRendering,
}) => {
  const state = storageService.getState();
  const [resetFeedback, setResetFeedback] = useState(false);

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    storageService.setActiveContext({ tenantId: e.target.value });
  };

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    storageService.setActiveContext({ siteId: e.target.value });
  };

  const handleGateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    storageService.setActiveContext({ gateId: e.target.value });
  };

  const handleResetData = () => {
    if (window.confirm('Reset all tenant state, visits, and audit logs to original clean master state?')) {
      storageService.resetToCleanState();
      setResetFeedback(true);
      setTimeout(() => setResetFeedback(false), 2000);
    }
  };

  const availableSites = state.sites.filter((s) => s.tenantId === state.activeTenantId);
  const availableGates = state.gates.filter((g) => g.siteId === state.activeSiteId);

  return (
    <div
      id="admin-above-header-control-bar"
      className="bg-[#123B5D] text-white rounded-2xl p-2.5 sm:p-3 border border-[#0f304c] shadow-xs flex flex-wrap items-center justify-between gap-2.5 sm:gap-3"
    >
      {/* Multi-Tenant Context Selectors (Tenant / Site / Gate) */}
      <div className="flex items-center gap-2 bg-[#0d2a42] px-3 py-1.5 rounded-lg border border-[#1b4b75] text-xs shrink-0 max-w-full overflow-x-auto">
        {/* Tenant Selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <select
            id="admin-toolbar-tenant-select"
            value={state.activeTenantId}
            onChange={handleTenantChange}
            className="bg-transparent text-white font-medium border-none focus:outline-none cursor-pointer pr-1 max-w-[130px] sm:max-w-[170px] xl:max-w-[210px] truncate"
            aria-label="Active Tenant Organization"
          >
            {state.tenants.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#123B5D] text-white">
                {t.name} ({t.code})
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-500">/</span>

        {/* Site Selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            id="admin-toolbar-site-select"
            value={state.activeSiteId}
            onChange={handleSiteChange}
            className="bg-transparent text-white font-medium border-none focus:outline-none cursor-pointer max-w-[100px] sm:max-w-[140px] xl:max-w-[170px] truncate"
            aria-label="Active Physical Site"
          >
            {availableSites.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#123B5D] text-white">
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-500">/</span>

        {/* Gate Selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          <DoorOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            id="admin-toolbar-gate-select"
            value={state.activeGateId}
            onChange={handleGateChange}
            className="bg-transparent text-white font-medium border-none focus:outline-none cursor-pointer max-w-[80px] sm:max-w-[120px] truncate"
            aria-label="Active Entry Gate"
          >
            {availableGates.map((g) => (
              <option key={g.id} value={g.id} className="bg-[#123B5D] text-white">
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Action Buttons & Status Indicators */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap shrink-0">
        {/* Share Pre-Registration Link */}
        {onOpenSharePreRegModal && (
          <button
            id="admin-toolbar-share-prereg-btn"
            onClick={onOpenSharePreRegModal}
            title="Share Visitor Pre-Registration Link"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-[#0F766E] hover:bg-[#0c5e58] text-white border border-teal-500/40 transition cursor-pointer shadow-xs shrink-0"
          >
            <Share2 className="w-3.5 h-3.5 text-teal-200 shrink-0" />
            <span>Share Pre-Reg Link</span>
          </button>
        )}

        {/* Hardware / Customization Settings */}
        {onOpenSettingsModal && (
          <button
            id="admin-toolbar-settings-btn"
            onClick={onOpenSettingsModal}
            title="System Settings & Hardware Preferences"
            className="p-1.5 rounded-lg bg-[#0d2a42] text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 transition shrink-0"
          >
            <Sliders className="w-4 h-4" />
          </button>
        )}

        {/* Host Arrival Notifications / Profile */}
        {onOpenProfileModal && (
          <button
            id="admin-toolbar-notification-btn"
            onClick={onOpenProfileModal}
            title="Host Visitor Arrival Alert Channels (SMS, Email, Slack)"
            className="p-1.5 rounded-lg bg-[#0d2a42] text-teal-300 border border-teal-500/40 hover:text-white hover:bg-teal-600/30 transition relative cursor-pointer shrink-0"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
          </button>
        )}

        {/* Auto-Rendering Live Stream Status Pill */}
        <button
          id="admin-toolbar-auto-render-btn"
          type="button"
          onClick={onToggleAutoRendering}
          title={
            isAutoRenderingEnabled
              ? 'Auto-Rendering is LIVE: Reactive facility stream & visitor queues actively auto-render'
              : 'Auto-Rendering is PAUSED: Click to resume automatic live rendering'
          }
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition shrink-0 cursor-pointer ${
            isAutoRenderingEnabled
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/70 shadow-xs'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {isAutoRenderingEnabled && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isAutoRenderingEnabled ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            ></span>
          </span>
          <span className="text-[11px] font-medium text-emerald-200">Auto-Render:</span>
          <span className={`text-[11px] font-bold ${isAutoRenderingEnabled ? 'text-emerald-300' : 'text-slate-400'}`}>
            {isAutoRenderingEnabled ? 'LIVE' : 'PAUSED'}
          </span>
        </button>

        {/* Offline Sync State */}
        <div className="shrink-0">
          <OfflineSyncIndicator />
        </div>

        {/* Emergency Evacuation Button */}
        {onOpenEmergencyModal && (
          <button
            id="admin-toolbar-emergency-btn"
            onClick={onOpenEmergencyModal}
            title="Emergency Evacuation & Roll Call"
            className={`p-1.5 rounded-lg border transition shrink-0 ${
              state.isEmergencyActive
                ? 'bg-red-500 text-white border-red-400 animate-bounce'
                : 'bg-[#0d2a42] text-red-400 border-red-500/30 hover:bg-red-950/50'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
        )}

        {/* Reset Master State */}
        <button
          id="admin-toolbar-reset-state-btn"
          onClick={handleResetData}
          title="Reset state to initial clean master seed"
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700/50 transition relative"
        >
          <RotateCcw className="w-4 h-4" />
          {resetFeedback && (
            <span className="absolute -bottom-7 right-0 text-[10px] bg-slate-800 text-teal-300 px-2 py-0.5 rounded shadow whitespace-nowrap">
              Reset Done!
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
