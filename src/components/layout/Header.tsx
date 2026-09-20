import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { JSAlphaSoftLogo } from '../common/JSAlphaSoftLogo';

interface HeaderProps {
  onOpenEmergencyModal?: () => void;
  onNavigateToDashboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenEmergencyModal,
  onNavigateToDashboard,
}) => {
  const state = storageService.getState();
  const activeSite = storageService.getActiveSite();

  return (
    <header className="sticky top-0 z-40 bg-[#123B5D] text-white border-b border-[#0f304c] shadow-xs">
      {/* Top emergency lockdown bar if active */}
      {state.isEmergencyActive && (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between animate-pulse text-sm font-semibold">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-300 shrink-0" />
            <span>
              CRITICAL FACILITY ALERT: Emergency evacuation active at {activeSite.name}. Proceed to designated Muster Points immediately!
            </span>
          </div>
          {onOpenEmergencyModal && (
            <button
              onClick={onOpenEmergencyModal}
              className="bg-white text-red-700 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition shrink-0 cursor-pointer"
            >
              Manage Evacuation Roll Call
            </button>
          )}
        </div>
      )}

      {/* Clean, distraction-free corporate bar with brand logo */}
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <button
            type="button"
            id="global-header-brand-logo-btn"
            onClick={onNavigateToDashboard}
            className="flex items-center gap-3 shrink-0 text-left hover:opacity-90 transition cursor-pointer"
            title="JS AlphaSoft VMS - Return to Operations Portal"
          >
            <JSAlphaSoftLogo darkTheme size="md" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white/10 text-teal-200 border border-white/10">
              Enterprise VMS Portal
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
