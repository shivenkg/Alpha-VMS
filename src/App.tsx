import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, ShieldAlert, Clock, ShieldCheck } from 'lucide-react';
import { storageService } from './services/storageService';
import { NavViewId, Visit, VisitorProfile, AppUser, UserRole } from './types';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LoginView } from './components/auth/LoginView';
import { AdminManagementView } from './components/admin/AdminManagementView';
import { SharePreRegistrationModal } from './components/common/SharePreRegistrationModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { ReceptionView } from './components/reception/ReceptionView';
import { WalkInView } from './components/reception/WalkInView';
import { VisitorDirectoryView } from './components/visitors/VisitorDirectoryView';
import { ApprovalsQueueView } from './components/approvals/ApprovalsQueueView';
import { InvitationsView } from './components/invitations/InvitationsView';
import { BadgePrinterView } from './components/badges/BadgePrinterView';
import { HardwareDevicesView } from './components/hardware/HardwareDevicesView';
import { AuditTrailView } from './components/audit/AuditTrailView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ArchitectureDocsView } from './components/docs/ArchitectureDocsView';
import { EmergencyRollCallView } from './components/emergency/EmergencyRollCallView';
import { PublicPreRegistrationView } from './components/public/PublicPreRegistrationView';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { ExpressMobileCheckoutModal } from './components/badges/ExpressMobileCheckoutModal';
import { EmergencyRollCallModal } from './components/emergency/EmergencyRollCallModal';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import { useAutoAdjustScreen } from './hooks/useAutoAdjustScreen';

export const isSuperAdminRole = (role: UserRole): boolean => {
  return role === 'PLATFORM_SUPER_ADMIN';
};

export const getAutoRenderViewForRole = (role: UserRole): NavViewId => {
  switch (role) {
    case 'PLATFORM_SUPER_ADMIN':
      return 'user_management';
    case 'RECEPTIONIST':
    case 'SECURITY_GUARD':
    case 'GATE_SUPERVISOR':
      return 'reception';
    case 'HOST_EMPLOYEE':
    case 'DEPARTMENT_APPROVER':
      return 'approvals';
    case 'COMPLIANCE_AUDITOR':
      return 'audit';
    case 'DEVICE_EDGE_ADMIN':
      return 'devices';
    case 'TENANT_ADMIN':
    case 'SITE_ADMIN':
    case 'TENANT_SECURITY_ADMIN':
    default:
      return 'dashboard';
  }
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const hasAuth = storageService.isAuthenticated();
    if (!hasAuth) {
      // Auto-render authorized session with Super Admin to open full administration center hub
      const users = storageService.getState().users;
      const defaultUser =
        users.find((u) => u.role === 'PLATFORM_SUPER_ADMIN') ||
        users.find((u) => u.loginId === 'ananya') ||
        users[0];
      if (defaultUser) {
        storageService.setActiveContext({ userId: defaultUser.id });
        return true;
      }
    }
    return hasAuth;
  });

  const [currentView, setCurrentView] = useState<NavViewId>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'pre-register' || window.location.hash.includes('pre-register')) {
        return 'pre_register';
      }
    }
    const active = storageService.getActiveUser();
    const role = active?.role || 'PLATFORM_SUPER_ADMIN';
    return isSuperAdminRole(role) ? 'user_management' : getAutoRenderViewForRole(role);
  });

  const [selectedVisitForBadge, setSelectedVisitForBadge] = useState<Visit | null>(null);
  const [selectedVisitorForInvite, setSelectedVisitorForInvite] = useState<VisitorProfile | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isAutoRendering, setIsAutoRendering] = useState(true);
  const [expressCheckoutVisit, setExpressCheckoutVisit] = useState<Visit | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'express-checkout' && params.get('visitId')) {
        const visitId = params.get('visitId');
        return storageService.getState().visits.find((v) => v.id === visitId) || null;
      }
    }
    return null;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [, setTick] = useState(0);
  const [isForceRefreshing, setIsForceRefreshing] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);
  const [viewRefreshKey, setViewRefreshKey] = useState(0);
  const [viewPollingPreferences, setViewPollingPreferences] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('vms_view_polling_preferences');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const isCurrentViewPollingEnabled = viewPollingPreferences[currentView] ?? true;

  const handleToggleCurrentViewPolling = () => {
    setViewPollingPreferences((prev) => {
      const currentVal = prev[currentView] ?? true;
      const updated = {
        ...prev,
        [currentView]: !currentVal,
      };
      try {
        localStorage.setItem('vms_view_polling_preferences', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const sidebarCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleForceRefreshView = () => {
    setIsForceRefreshing(true);
    // Force re-sync state and immediately notify all subscribers without waiting for auto-render interval
    storageService.forceRefreshState();
    setViewRefreshKey((k) => k + 1);
    setTick((t) => t + 1);

    setTimeout(() => {
      setIsForceRefreshing(false);
      setJustRefreshed(true);
      setTimeout(() => setJustRefreshed(false), 2200);
    }, 450);
  };

  const handleOpenSidebar = () => {
    if (sidebarCloseTimerRef.current) {
      clearTimeout(sidebarCloseTimerRef.current);
      sidebarCloseTimerRef.current = null;
    }
    setIsSidebarOpen(true);
  };

  const handleScheduleCloseSidebar = () => {
    if (isSidebarPinned) return;
    if (sidebarCloseTimerRef.current) {
      clearTimeout(sidebarCloseTimerRef.current);
    }
    sidebarCloseTimerRef.current = setTimeout(() => {
      setIsSidebarOpen(false);
      sidebarCloseTimerRef.current = null;
    }, 280);
  };

  const handleCancelCloseSidebar = () => {
    if (sidebarCloseTimerRef.current) {
      clearTimeout(sidebarCloseTimerRef.current);
      sidebarCloseTimerRef.current = null;
    }
  };

  // Subscribe to storage changes for reactive state updates across all sub-components
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setIsAuthenticated(storageService.isAuthenticated());
      setTick((t) => t + 1);
    });
    return () => unsubscribe();
  }, []);

  // Auto-Rendering / Data Polling Engine: Live reactive interval updating queues, occupancy, and timestamps
  // Pauses automatically if either global auto-rendering is disabled or specific view polling is switched off
  useEffect(() => {
    if (!isAutoRendering) return;
    if (!isCurrentViewPollingEnabled) return;

    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 2500);

    return () => clearInterval(interval);
  }, [isAutoRendering, isCurrentViewPollingEnabled]);

  const activeUser = storageService.getActiveUser();
  const activeRole: UserRole = activeUser?.role || 'RECEPTIONIST';
  const isSuperAdmin = isSuperAdminRole(activeRole);

  // Enforce access control: Hide / redirect administration control center hub for all roles except super admin profile
  useEffect(() => {
    const isAdminView =
      currentView === 'user_management' ||
      currentView === 'tenants' ||
      currentView === 'customization' ||
      currentView === 'admin_hub';
    if (isAdminView && !isSuperAdmin) {
      setCurrentView(getAutoRenderViewForRole(activeRole));
    }
  }, [isSuperAdmin, activeRole, currentView]);

  const handleRoleAutoRender = (role: UserRole) => {
    const nextView = getAutoRenderViewForRole(role);
    setCurrentView(nextView);
  };

  const handleLoginSuccess = (user: AppUser) => {
    setIsAuthenticated(true);
    // Role-tailored initial landing view auto-rendered
    setCurrentView(getAutoRenderViewForRole(user.role));
  };

  const handleLogout = useCallback(() => {
    storageService.logout();
    setIsAuthenticated(false);
  }, []);

  // Hook to monitor user inactivity and automatically trigger handleLogout after 30 minutes of idle time
  const {
    isWarning: isIdleWarning,
    remainingSeconds: idleRemainingSeconds,
    resetTimer: resetIdleTimer,
  } = useInactivityTimeout({
    timeoutMs: 30 * 60 * 1000, // 30 minutes idle timeout
    warningThresholdMs: 60 * 1000, // 1 minute warning
    enabled: isAuthenticated,
    onLogout: handleLogout,
  });

  // Responsive screen size auto-adjust & auto-render hook
  useAutoAdjustScreen({
    autoCollapseSidebarThreshold: 1024,
    onAutoCollapseSidebar: () => {
      // Auto-collapse sidebar when screen size shrinks below desktop breakpoint
      setIsSidebarPinned(false);
      setIsSidebarOpen(false);
    },
    onScreenChange: () => {
      // Auto-render reflow on window/screen dimension changes
      setViewRefreshKey((k) => k + 1);
      setTick((t) => t + 1);
    },
  });

  const handleSelectVisitForBadge = (visit: Visit) => {
    setSelectedVisitForBadge(visit);
    setCurrentView('badges');
  };

  const handleInviteVisitor = (visitor: VisitorProfile) => {
    setSelectedVisitorForInvite(visitor);
    setCurrentView('invitations');
  };

  const handleWalkInComplete = (visit: Visit) => {
    setSelectedVisitForBadge(visit);
    setCurrentView('badges');
  };

  // If visitor is directly accessing the public self-registration portal URL
  if (currentView === 'pre_register') {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] text-[#172B3A] flex flex-col font-sans">
        <Header
          onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
          onNavigateToDashboard={() => setCurrentView('dashboard')}
        />
        <div className="flex-1 overflow-y-auto">
          <PublicPreRegistrationView
            onNavigateToApprovals={() => {
              if (isAuthenticated) setCurrentView('approvals');
              else setCurrentView('dashboard');
            }}
            onNavigateToDashboard={() => setCurrentView('dashboard')}
          />
        </div>
      </div>
    );
  }

  // If not logged in, render the dedicated Login Screen
  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onNavigateToPublicPreRegister={() => setCurrentView('pre_register')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[#172B3A] flex flex-col font-sans">
      {/* Top Header with Brand Logo and Burger Button directly before logo on top left corner */}
      <Header
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onNavigateToDashboard={() => setCurrentView('dashboard')}
        isSidebarOpen={isSidebarOpen}
        isSidebarPinned={isSidebarPinned}
        onToggleSidebar={() => {
          if (isSidebarPinned) {
            setIsSidebarPinned(false);
            setIsSidebarOpen(false);
          } else {
            setIsSidebarPinned(true);
            setIsSidebarOpen(true);
          }
        }}
        onOpenSidebar={handleOpenSidebar}
        onScheduleCloseSidebar={handleScheduleCloseSidebar}
      />

      {/* Main Workspace Body: Left Floating Sidebar + Right Content */}
      <div className={`flex-1 flex overflow-hidden relative ${!isSidebarPinned ? 'justify-center' : ''}`}>
        {/* Left Screen Edge Hover Trigger Strip (swipe from left edge to open) */}
        {!isSidebarOpen && !isSidebarPinned && (
          <div
            id="sidebar-edge-hover-trigger"
            onMouseEnter={handleOpenSidebar}
            className="fixed top-14 left-0 bottom-0 w-3 z-20 cursor-pointer"
            title="Hover to reveal sidebar"
          />
        )}

        {/* Backdrop overlay when sidebar is open and NOT pinned */}
        {isSidebarOpen && !isSidebarPinned && (
          <div
            id="sidebar-backdrop-overlay"
            className="fixed inset-0 top-14 z-35 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300 cursor-pointer"
            onClick={() => {
              setIsSidebarPinned(false);
              setIsSidebarOpen(false);
            }}
          />
        )}

        {/* Navigation Sidebar (hidden & collapsed by default, visible on hover, docked when pinned) */}
        <Sidebar
          currentView={currentView}
          onSelectView={(view) => {
            setCurrentView(view);
            if (!isSidebarPinned) {
              setIsSidebarOpen(false);
            }
          }}
          onOpenSharePreRegModal={() => setIsShareModalOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onLogout={handleLogout}
          isOpen={isSidebarOpen}
          isPinned={isSidebarPinned}
          onTogglePin={() => {
            setIsSidebarPinned((prev) => {
              const next = !prev;
              setIsSidebarOpen(next);
              return next;
            });
          }}
          onClose={() => {
            setIsSidebarPinned(false);
            setIsSidebarOpen(false);
          }}
          onMouseEnter={handleCancelCloseSidebar}
          onMouseLeave={handleScheduleCloseSidebar}
        />

        {/* Content View Router - auto-adjusts layout smoothly based on sidebar hovering and pinup */}
        <main
          id="app-main-content-viewport"
          className={`flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isSidebarPinned
              ? 'md:ml-72 max-w-[calc(100vw-18.5rem)]'
              : 'ml-0 max-w-7xl mx-auto w-full flex flex-col items-center'
          } pt-14 sm:pt-6 relative`}
        >
          {/* Responsive auto-adjust inner container ensuring perfect center alignment on all screen sizes */}
          <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col">
            {/* Enterprise Inactivity Warning Banner (approaching 30-min idle timeout) */}
            {isIdleWarning && (
              <div
                id="enterprise-idle-warning-banner"
                className="mb-3.5 px-4 py-3 rounded-xl bg-amber-500 text-white shadow-lg border border-amber-600 flex items-center justify-between gap-3 animate-pulse"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold block">Enterprise Session Inactivity Alert</span>
                    <span>
                      Your session will automatically log out in <strong>{idleRemainingSeconds}s</strong> due to 30 minutes of idle time.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  id="stay-logged-in-btn"
                  onClick={resetIdleTimer}
                  className="px-3.5 py-1.5 rounded-lg bg-white text-amber-900 font-bold text-xs hover:bg-amber-50 transition cursor-pointer shadow-xs whitespace-nowrap active:scale-95"
                >
                  Stay Logged In
                </button>
              </div>
            )}

            {/* View Toolbar: Polling Toggle Switch + Subtle 'Refresh View' Button */}
            <div className="flex items-center justify-end gap-2 sm:gap-2.5 mb-2.5 -mt-2">
            {/* Auto-Polling Toggle specifically for the current view */}
            <div
              id="view-auto-poll-wrapper"
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white border border-slate-200/90 shadow-2xs text-[11px] font-semibold backdrop-blur-xs select-none transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isCurrentViewPollingEnabled
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-slate-300'
                  }`}
                  aria-hidden="true"
                />
                <span className="text-slate-500 hidden sm:inline">Auto-Poll:</span>
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-tight ${
                    isCurrentViewPollingEnabled ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {isCurrentViewPollingEnabled ? 'Active' : 'Off'}
                </span>
              </div>

              {/* Small Switch */}
              <button
                id="toggle-view-polling"
                type="button"
                role="switch"
                aria-checked={isCurrentViewPollingEnabled}
                onClick={handleToggleCurrentViewPolling}
                title={
                  isCurrentViewPollingEnabled
                    ? `Pause automatic data polling specifically for ${currentView.replace(/_/g, ' ')} view to conserve network resources`
                    : `Enable automatic data polling specifically for ${currentView.replace(/_/g, ' ')} view`
                }
                className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  isCurrentViewPollingEnabled ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                <span className="sr-only">Toggle automatic data polling for current view</span>
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    isCurrentViewPollingEnabled ? 'translate-x-3.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Subtle 'Refresh View' button */}
            <button
              id="btn-refresh-view"
              onClick={handleForceRefreshView}
              disabled={isForceRefreshing}
              title="Force-refresh current view data immediately without waiting for auto-render cycle"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-500 hover:text-[#123B5D] border border-slate-200/90 shadow-2xs hover:shadow-xs text-[11px] font-semibold transition-all duration-200 cursor-pointer active:scale-95 group disabled:opacity-70 select-none backdrop-blur-xs"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#0F766E] transition-all duration-500 ${
                  isForceRefreshing ? 'animate-spin text-[#0F766E]' : 'group-hover:rotate-180'
                }`}
              />
              <span className="tracking-tight">
                {isForceRefreshing ? 'Refreshing Data...' : 'Refresh View'}
              </span>
              {justRefreshed && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold animate-fadeIn">
                  Updated
                </span>
              )}
            </button>
          </div>

          <React.Fragment key={`view-${currentView}-${viewRefreshKey}`}>
            {currentView === 'dashboard' && (
            <DashboardView
              onNavigate={setCurrentView}
              onSelectVisitForBadge={handleSelectVisitForBadge}
            />
          )}

          {currentView === 'reception' && (
            <ReceptionView
              onSelectVisitForBadge={handleSelectVisitForBadge}
              onNavigateToWalkin={() => setCurrentView('walkin')}
              onOpenSharePreRegModal={() => setIsShareModalOpen(true)}
            />
          )}

          {currentView === 'walkin' && (
            <WalkInView
              onCheckInComplete={handleWalkInComplete}
              onOpenSharePreRegModal={() => setIsShareModalOpen(true)}
            />
          )}

          {currentView === 'visitors' && (
            <VisitorDirectoryView onInviteVisitor={handleInviteVisitor} />
          )}

          {currentView === 'approvals' && <ApprovalsQueueView />}

          {currentView === 'invitations' && (
            <InvitationsView
              initialVisitor={selectedVisitorForInvite}
              onSelectVisitForBadge={handleSelectVisitForBadge}
            />
          )}

          {currentView === 'badges' && (
            <BadgePrinterView initialVisit={selectedVisitForBadge} />
          )}

          {/* Dedicated Administration Views - Restricted strictly to Platform Super Admin Profile */}
          {isSuperAdmin && currentView === 'user_management' && (
            <AdminManagementView
              initialTab="users"
              onOpenSharePreRegModal={() => setIsShareModalOpen(true)}
              onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
              onLogout={handleLogout}
              onRoleAutoRender={handleRoleAutoRender}
              isAutoRenderingEnabled={isAutoRendering}
              onToggleAutoRendering={() => setIsAutoRendering((prev) => !prev)}
            />
          )}

          {isSuperAdmin && currentView === 'tenants' && (
            <AdminManagementView
              initialTab="tenants"
              onOpenSharePreRegModal={() => setIsShareModalOpen(true)}
              onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
              onLogout={handleLogout}
              onRoleAutoRender={handleRoleAutoRender}
              isAutoRenderingEnabled={isAutoRendering}
              onToggleAutoRendering={() => setIsAutoRendering((prev) => !prev)}
            />
          )}

          {isSuperAdmin && currentView === 'customization' && (
            <AdminManagementView
              initialTab="customization"
              onOpenSharePreRegModal={() => setIsShareModalOpen(true)}
              onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
              onLogout={handleLogout}
              onRoleAutoRender={handleRoleAutoRender}
              isAutoRenderingEnabled={isAutoRendering}
              onToggleAutoRendering={() => setIsAutoRendering((prev) => !prev)}
            />
          )}

          {isSuperAdmin && currentView === 'admin_hub' && (
            <AdminManagementView
              onOpenSharePreRegModal={() => setIsShareModalOpen(true)}
              onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
              onLogout={handleLogout}
              onRoleAutoRender={handleRoleAutoRender}
              isAutoRenderingEnabled={isAutoRendering}
              onToggleAutoRendering={() => setIsAutoRendering((prev) => !prev)}
            />
          )}

          {!isSuperAdmin &&
            (currentView === 'user_management' ||
              currentView === 'tenants' ||
              currentView === 'customization' ||
              currentView === 'admin_hub') && (
              <div className="bg-white rounded-2xl border border-amber-200 p-8 text-center max-w-lg mx-auto shadow-sm my-12">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-700">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Admin Control Center Hub Restricted</h2>
                <p className="text-sm text-slate-600 mb-4">
                  The Admin Control Center Hub is restricted exclusively to the Platform Super Admin profile. Your current role is{' '}
                  <span className="font-semibold text-slate-800">{activeRole.replace(/_/g, ' ')}</span>.
                </p>
                <button
                  onClick={() => setCurrentView(getAutoRenderViewForRole(activeRole))}
                  className="px-4 py-2 bg-[#123B5D] text-white rounded-xl text-xs font-bold hover:bg-[#0f304c] transition cursor-pointer"
                >
                  Return to Authorized Workspace
                </button>
              </div>
            )}

          {(currentView === 'devices' || currentView === 'edge') && (
            <HardwareDevicesView />
          )}

          {currentView === 'emergency' && <EmergencyRollCallView />}

          {currentView === 'audit' && <AuditTrailView />}

          {currentView === 'reports' && <AnalyticsView />}

          {(currentView === 'blueprint' || currentView === 'api_explorer' || currentView === 'uat_tests' || currentView === 'iam') && (
            <ArchitectureDocsView />
          )}
          </React.Fragment>
          </div>
        </main>
      </div>

      {/* Share Visitor Pre-Registration Link Modal */}
      <SharePreRegistrationModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onNavigateToPublicPreRegister={() => setCurrentView('pre_register')}
      />

      {/* Hardware Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Host Profile & Arrival Notification Channels Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Express Mobile Touchless Check-Out Modal (Direct QR Scan) */}
      <ExpressMobileCheckoutModal
        isOpen={!!expressCheckoutVisit}
        onClose={() => setExpressCheckoutVisit(null)}
        visit={expressCheckoutVisit}
      />

      {/* Facility Evacuation Roll Call Command Modal */}
      <EmergencyRollCallModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onOpenFullView={() => {
          setIsEmergencyModalOpen(false);
          setCurrentView('emergency');
        }}
      />
    </div>
  );
}
