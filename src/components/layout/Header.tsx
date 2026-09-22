import React, { useState, useEffect } from 'react';
import { AlertTriangle, Menu, X, Users, CheckCircle2 } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { JSAlphaSoftLogo } from '../common/JSAlphaSoftLogo';

interface HeaderProps {
  onOpenEmergencyModal?: () => void;
  onNavigateToDashboard?: () => void;
  isSidebarOpen?: boolean;
  isSidebarPinned?: boolean;
  onToggleSidebar?: () => void;
  onOpenSidebar?: () => void;
  onScheduleCloseSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenEmergencyModal,
  onNavigateToDashboard,
  isSidebarOpen = false,
  isSidebarPinned = false,
  onToggleSidebar,
  onOpenSidebar,
  onScheduleCloseSidebar,
}) => {
  const [, setTick] = useState(0);
  const [isConfirmingAllClear, setIsConfirmingAllClear] = useState(false);

  useEffect(() => {
    return storageService.subscribe(() => setTick((t) => t + 1));
  }, []);

  const state = storageService.getState();
  const activeSite = storageService.getActiveSite();

  const handleExecuteAllClear = () => {
    storageService.toggleEmergency(false);
    setIsConfirmingAllClear(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#123B5D] text-white border-b border-[#0f304c] shadow-xs">
      {/* Top emergency lockdown bar if active */}
      {state.isEmergencyActive && (
        <div
          id="header-emergency-lockdown-bar"
          className="bg-red-600 text-white px-3 sm:px-6 py-2.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md"
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            <span className="p-1 rounded bg-red-700 text-white animate-pulse shrink-0">
              <AlertTriangle className="w-4 h-4 text-yellow-300" />
            </span>
            <span>
              CRITICAL FACILITY ALERT: Emergency evacuation active at <strong className="font-bold text-white underline">{activeSite.name}</strong>. Proceed to designated Muster Points immediately!
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {onOpenEmergencyModal && (
              <button
                id="header-manage-evacuation-roll-call-btn"
                type="button"
                onClick={onOpenEmergencyModal}
                className="bg-white text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-red-700" />
                <span>Manage Evacuation Roll Call</span>
              </button>
            )}

            {isConfirmingAllClear ? (
              <div className="flex items-center gap-1.5 bg-red-900/90 px-2 py-1 rounded-lg border border-red-400">
                <span className="text-[11px] font-semibold text-white px-1">Confirm All Clear?</span>
                <button
                  id="header-confirm-declare-all-clear-btn"
                  type="button"
                  onClick={handleExecuteAllClear}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Yes, Declare & Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingAllClear(false)}
                  className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                id="header-declare-all-clear-reset-btn"
                type="button"
                onClick={() => setIsConfirmingAllClear(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-xs flex items-center gap-1.5"
                title="Declare all clear, restore gates, and reset muster point roll call"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Declare All Clear & Reset</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Clean, corporate bar with burger button positioned before brand logo on top-left corner */}
      <div className="w-full px-3 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Burger Button directly before Company Logo */}
            {onToggleSidebar && (
              <button
                type="button"
                id="header-sidebar-burger-btn"
                onClick={onToggleSidebar}
                onMouseEnter={onOpenSidebar}
                onMouseLeave={onScheduleCloseSidebar}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer select-none group ${
                  isSidebarPinned
                    ? 'bg-teal-600 text-white border-teal-500 shadow-xs'
                    : isSidebarOpen
                    ? 'bg-white/20 text-teal-200 border-white/30'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/15 hover:border-white/30'
                }`}
                title={
                  isSidebarPinned
                    ? 'Sidebar is pinned open. Click to close and collapse.'
                    : 'Hover to preview navigation, click to pin open.'
                }
                aria-label={isSidebarPinned ? 'Close navigation sidebar' : 'Toggle navigation menu'}
              >
                {isSidebarPinned ? (
                  <X className="w-4 h-4 text-white transition-transform duration-200" />
                ) : (
                  <Menu
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isSidebarOpen ? 'text-teal-300 rotate-90' : 'text-slate-200 group-hover:text-white'
                    }`}
                  />
                )}
                <span className="text-xs font-bold tracking-tight hidden sm:inline">
                  {isSidebarPinned ? 'Close' : 'Menu'}
                </span>
                {isSidebarPinned && (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-300 animate-pulse" title="Pinned Open" />
                )}
              </button>
            )}

            <button
              type="button"
              id="global-header-brand-logo-btn"
              onClick={onNavigateToDashboard}
              className="flex items-center gap-3 shrink-0 text-left hover:opacity-90 transition cursor-pointer"
              title="JS AlphaSoft VMS - Return to Operations Portal"
            >
              <JSAlphaSoftLogo darkTheme size="md" />
            </button>
          </div>

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
