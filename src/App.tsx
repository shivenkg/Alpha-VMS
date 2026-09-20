import React, { useState, useEffect } from 'react';
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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const hasAuth = storageService.isAuthenticated();
    if (!hasAuth) {
      // Auto-render authorized session for instant portal access
      const users = storageService.getState().users;
      const defaultUser = users.find((u) => u.loginId === 'reception' || u.role === 'RECEPTIONIST') || users[0];
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
    const user = storageService.getActiveUser();
    if (user?.role === 'RECEPTIONIST') return 'reception';
    if (user?.role === 'TENANT_ADMIN' || user?.role === 'PLATFORM_SUPER_ADMIN') return 'user_management';
    return 'dashboard';
  });

  const [selectedVisitForBadge, setSelectedVisitForBadge] = useState<Visit | null>(null);
  const [selectedVisitorForInvite, setSelectedVisitorForInvite] = useState<VisitorProfile | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
  const [, setTick] = useState(0);

  // Subscribe to storage changes for reactive state updates across all sub-components
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setIsAuthenticated(storageService.isAuthenticated());
      setTick((t) => t + 1);
    });
    return () => unsubscribe();
  }, []);

  // Auto-Rendering Engine: Live reactive interval updating queues, occupancy, and timestamps
  useEffect(() => {
    if (!isAutoRendering) return;

    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 2500);

    return () => clearInterval(interval);
  }, [isAutoRendering]);

  const getAutoRenderViewForRole = (role: UserRole): NavViewId => {
    switch (role) {
      case 'RECEPTIONIST':
      case 'SECURITY_GUARD':
      case 'GATE_SUPERVISOR':
        return 'reception';
      case 'TENANT_ADMIN':
      case 'PLATFORM_SUPER_ADMIN':
      case 'SITE_ADMIN':
        return 'user_management';
      case 'HOST_EMPLOYEE':
      case 'DEPARTMENT_APPROVER':
        return 'approvals';
      case 'COMPLIANCE_AUDITOR':
        return 'audit';
      case 'DEVICE_EDGE_ADMIN':
        return 'devices';
      default:
        return 'dashboard';
    }
  };

  const handleRoleAutoRender = (role: UserRole) => {
    const nextView = getAutoRenderViewForRole(role);
    setCurrentView(nextView);
  };

  const handleLoginSuccess = (user: AppUser) => {
    setIsAuthenticated(true);
    // Role-tailored initial landing view auto-rendered
    setCurrentView(getAutoRenderViewForRole(user.role));
  };

  const handleLogout = () => {
    storageService.logout();
    setIsAuthenticated(false);
  };

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
          onOpenEmergencyModal={() => setCurrentView('emergency')}
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
      {/* Top Header with Brand Logo */}
      <Header
        onOpenEmergencyModal={() => setCurrentView('emergency')}
        onNavigateToDashboard={() => setCurrentView('dashboard')}
      />

      {/* Main Workspace Body: Left Sidebar + Right Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          onOpenSharePreRegModal={() => setIsShareModalOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Content View Router */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
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

          {/* Dedicated Administration Views */}
          {currentView === 'user_management' && (
            <AdminManagementView
              initialTab="users"
              onOpenSharePreRegModal={() => setIsShareModalOpen(true)}
              onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              onOpenEmergencyModal={() => setCurrentView('emergency')}
              onLogout={handleLogout}
              onRoleAutoRender={handleRoleAutoRender}
              isAutoRenderingEnabled={isAutoRendering}
              onToggleAutoRendering={() => setIsAutoRendering((prev) => !prev)}
            />
          )}

          {currentView === 'tenants' && (
            <AdminManagementView
              initialTab="tenants"
              onOpenSharePreRegModal={() => setIsShareModalOpen(true)}
              onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              onOpenEmergencyModal={() => setCurrentView('emergency')}
              onLogout={handleLogout}
              onRoleAutoRender={handleRoleAutoRender}
              isAutoRenderingEnabled={isAutoRendering}
              onToggleAutoRendering={() => setIsAutoRendering((prev) => !prev)}
            />
          )}

          {currentView === 'customization' && (
            <AdminManagementView
              initialTab="customization"
              onOpenSharePreRegModal={() => setIsShareModalOpen(true)}
              onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              onOpenEmergencyModal={() => setCurrentView('emergency')}
              onLogout={handleLogout}
              onRoleAutoRender={handleRoleAutoRender}
              isAutoRenderingEnabled={isAutoRendering}
              onToggleAutoRendering={() => setIsAutoRendering((prev) => !prev)}
            />
          )}

          {currentView === 'admin_hub' && (
            <AdminManagementView
              onOpenSharePreRegModal={() => setIsShareModalOpen(true)}
              onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              onOpenEmergencyModal={() => setCurrentView('emergency')}
              onLogout={handleLogout}
              onRoleAutoRender={handleRoleAutoRender}
              isAutoRenderingEnabled={isAutoRendering}
              onToggleAutoRendering={() => setIsAutoRendering((prev) => !prev)}
            />
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
    </div>
  );
}
