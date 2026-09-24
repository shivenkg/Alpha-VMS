import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  UserPlus,
  Users,
  CheckSquare,
  QrCode,
  Printer,
  AlertOctagon,
  HardDrive,
  Wifi,
  BarChart3,
  FileText,
  KeyRound,
  Building,
  Layers,
  TestTube2,
  FileCode2,
  BookOpen,
  Share2,
  Sliders,
  ShieldCheck,
  UserCheck,
  Bell,
  LogOut,
  Pin,
  PinOff
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { NavViewId, UserRole } from '../../types';
import { JSAlphaSoftLogo } from '../common/JSAlphaSoftLogo';

interface SidebarProps {
  currentView: NavViewId;
  onSelectView: (view: NavViewId) => void;
  onOpenSharePreRegModal: () => void;
  onOpenProfileModal?: () => void;
  onLogout?: () => void;
  isOpen?: boolean;
  isPinned?: boolean;
  onTogglePin?: () => void;
  onClose?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onOpenSharePreRegModal,
  onOpenProfileModal,
  onLogout,
  isOpen = true,
  isPinned = false,
  onTogglePin,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  const state = storageService.getState();
  const activeUser = storageService.getActiveUser();
  const role: UserRole = activeUser?.role || 'RECEPTIONIST';

  const pendingApprovalsCount = state.visits.filter((v) => v.state === 'PENDING_APPROVAL').length;
  const currentlyInsideCount = state.visits.filter((v) => v.state === 'CHECKED_IN').length;
  const pendingEdgeSyncCount = state.edgeSyncEvents.filter((e) => e.status === 'PENDING_UPLOAD').length;

  const isSuperAdmin = role === 'PLATFORM_SUPER_ADMIN';
  const isAdmin =
    role === 'TENANT_ADMIN' ||
    role === 'PLATFORM_SUPER_ADMIN' ||
    role === 'SITE_ADMIN' ||
    role === 'TENANT_SECURITY_ADMIN';

  const isReceptionist = role === 'RECEPTIONIST';
  const isSecurity = role === 'SECURITY_GUARD';
  const isHost = role === 'HOST_EMPLOYEE' || role === 'DEPARTMENT_APPROVER';
  const isAuditor = role === 'COMPLIANCE_AUDITOR';

  // Dynamic Navigation Sections based on Login ID & Role
  const sections: {
    title: string;
    items: {
      id: NavViewId | 'share_modal_action';
      label: string;
      icon: any;
      badge?: string;
      badgeColor?: string;
      isAction?: boolean;
    }[];
  }[] = [];

  // ==========================================
  // Section: Admin & Governance (Strictly Super Admin Only)
  // ==========================================
  if (isSuperAdmin) {
    sections.push({
      title: 'ADMINISTRATION & TENANTS',
      items: [
        {
          id: 'user_management',
          label: 'User Login IDs & Access',
          icon: Users,
          badge: `${state.users.length} Users`,
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        },
        {
          id: 'tenants',
          label: 'Tenant Addition & Hierarchy',
          icon: Building,
          badge: `${state.tenants.length} Tenants`,
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        },
        {
          id: 'customization',
          label: 'System ABCDEF',
          icon: Sliders,
        },
      ],
    });
  }

  // ==========================================
  // Section: Operations & Reception
  // (Available to Reception, Admin, Security, Host)
  // ==========================================
  const opsItems: any[] = [];

  if (!isHost) {
    opsItems.push({
      id: 'dashboard',
      label: 'Operations Dashboard',
      icon: LayoutDashboard,
    });
  }

  // Receptionist, Security, and Admins can do fast check-in and walk-ins
  if (isReceptionist || isAdmin || isSecurity) {
    opsItems.push({
      id: 'reception',
      label: 'Reception & Fast Check-In',
      icon: ScanLine,
      badge: currentlyInsideCount > 0 ? `${currentlyInsideCount} Inside` : undefined,
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-300 font-semibold',
    });
    opsItems.push({
      id: 'walkin',
      label: 'Walk-In Registration',
      icon: UserPlus,
    });
  }

  // Visitor Directory (explicitly requested for reception, admin, host)
  opsItems.push({
    id: 'visitors',
    label: 'Visitor Directory',
    icon: Users,
  });

  // Approval Queue (explicitly requested for reception, approvers, hosts, admins)
  opsItems.push({
    id: 'approvals',
    label: 'Approval Queue',
    icon: CheckSquare,
    badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Pending` : undefined,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
  });

  // Share Pre-Registration Link (explicitly requested for reception, host, admin)
  opsItems.push({
    id: 'share_modal_action',
    label: 'Share Pre-Reg Link',
    icon: Share2,
    badge: 'Guest Link',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300 font-bold',
    isAction: true,
  });

  sections.push({
    title: isReceptionist ? 'FRONT DESK RECEPTION' : 'OPERATIONS & WORKFLOW',
    items: opsItems,
  });

  // ==========================================
  // Section: Passes & Physical Security
  // ==========================================
  const passItems: any[] = [];
  if (isReceptionist || isSecurity || isAdmin) {
    passItems.push({
      id: 'invitations',
      label: 'Invitations & QR Passes',
      icon: QrCode,
    });
    passItems.push({
      id: 'badges',
      label: 'Badge Designer & Printing',
      icon: Printer,
    });
  }

  passItems.push({
    id: 'emergency',
    label: 'Emergency Evacuation',
    icon: AlertOctagon,
    badge: state.isEmergencyActive ? 'ACTIVE' : undefined,
    badgeColor: 'bg-red-500 text-white animate-pulse font-bold',
  });

  sections.push({
    title: 'PASSES & FACILITY SAFETY',
    items: passItems,
  });

  // ==========================================
  // Section: Observability & Technical (Admins & Auditors)
  // ==========================================
  if (isAdmin || isAuditor) {
    sections.push({
      title: 'INFRASTRUCTURE & OBSERVABILITY',
      items: [
        {
          id: 'devices',
          label: 'Device & Hardware Registry',
          icon: HardDrive,
        },
        {
          id: 'edge',
          label: 'Edge Sync & Offline Buffer',
          icon: Wifi,
          badge: pendingEdgeSyncCount > 0 ? `${pendingEdgeSyncCount} Queued` : undefined,
          badgeColor: 'bg-blue-100 text-blue-800',
        },
        {
          id: 'reports',
          label: 'Operational Reports',
          icon: BarChart3,
        },
        {
          id: 'audit',
          label: 'Immutable Audit Trail',
          icon: FileText,
        },
      ],
    });

    sections.push({
      title: 'ENTERPRISE ARCHITECTURE & SPECS',
      items: [
        {
          id: 'blueprint',
          label: 'Architecture, ADRs & DDL',
          icon: BookOpen,
        },
        {
          id: 'api_explorer',
          label: 'OpenAPI 3.1 Live Catalog',
          icon: FileCode2,
        },
        {
          id: 'uat_tests',
          label: 'Automated 25 UAT Tests',
          icon: TestTube2,
        },
        {
          id: 'iam',
          label: 'OIDC Identity & RBAC Matrix',
          icon: KeyRound,
        },
      ],
    });
  }

  return (
    <aside
      id="main-navigation-sidebar"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`fixed top-14 left-0 bottom-0 z-40 w-72 bg-white border-r border-[#D8E1E8] flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform shadow-md ${
        isPinned
          ? 'translate-x-0 opacity-100 pointer-events-auto'
          : isOpen
          ? 'shadow-2xl translate-x-0 opacity-100 pointer-events-auto'
          : '-translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      {/* Active Persona Identity Header */}
      <div className="p-3.5 border-b border-[#E2E8F0] bg-gradient-to-b from-[#F8FAFC] to-white shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#123B5D] to-[#0F766E] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 ring-2 ring-teal-500/20">
              {activeUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-slate-900 leading-snug truncate">
                {activeUser.name}
              </div>
              <div className="inline-flex items-center text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-full mt-0.5">
                <span>{role.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>

          {onOpenProfileModal && (
            <button
              id="sidebar-profile-bell-btn"
              onClick={onOpenProfileModal}
              title="Host Arrival Alert Channels (SMS, Email, Slack)"
              className="p-2 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 hover:text-teal-900 border border-teal-200/90 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs shrink-0"
            >
              <Bell className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="truncate">
            ID: <strong className="font-mono text-[#123B5D] font-semibold">{activeUser.loginId}</strong>
          </span>
          <div className="flex items-center gap-2.5 shrink-0">
            {onOpenProfileModal && (
              <button
                id="sidebar-profile-alerts-link"
                onClick={onOpenProfileModal}
                className="text-[11px] text-teal-700 font-semibold hover:text-teal-900 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Alerts</span>
              </button>
            )}
            {onLogout && (
              <button
                id="sidebar-profile-logout-link"
                onClick={onLogout}
                title="Log out of session"
                className="text-[11px] text-red-600 hover:text-red-800 font-semibold hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sections (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <div
              id={idx === 0 ? 'sidebar-first-nav-section-title' : undefined}
              className="px-3 py-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono flex items-center justify-between"
            >
              <span>{sec.title}</span>
            </div>
            <nav className="space-y-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isAction = item.isAction;
                const isActive = currentView === item.id;

                if (isAction) {
                  return (
                    <button
                      key={item.id}
                      id="sidebar-share-prereg-action-btn"
                      onClick={onOpenSharePreRegModal}
                      className="group w-full flex items-center justify-between px-3 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-150 text-left bg-gradient-to-r from-teal-50 to-emerald-50/80 text-teal-900 border border-teal-200/90 hover:bg-teal-100/90 hover:border-teal-300 shadow-2xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-[18px] h-[18px] shrink-0 text-teal-700 group-hover:scale-105 transition-transform" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border leading-tight shrink-0 shadow-2xs ${
                            item.badgeColor || 'bg-teal-100 text-teal-800 border-teal-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => {
                      onSelectView(item.id as NavViewId);
                      if (!isPinned && onClose) onClose();
                    }}
                    className={`group w-full flex items-center justify-between px-3 py-2.5 text-[13px] rounded-xl transition-all duration-150 text-left cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#123B5D] to-[#164871] text-white shadow-xs font-semibold'
                        : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-950 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                          isActive ? 'text-teal-300' : 'text-slate-400 group-hover:text-slate-700'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border leading-tight shrink-0 shadow-2xs tracking-tight ${
                            isActive
                              ? 'bg-white/20 text-white border-white/30'
                              : item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 shadow-2xs" />
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom Pin & Status Dock */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/80 shrink-0 flex items-center justify-between">
        {onTogglePin && (
          <button
            type="button"
            id="sidebar-pin-toggle-btn"
            onClick={onTogglePin}
            title={isPinned ? 'Unpin sidebar (auto-collapses on selection)' : 'Pin sidebar to desktop workspace'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-150 cursor-pointer shadow-2xs ${
              isPinned
                ? 'bg-teal-50 text-teal-800 border-teal-300 hover:bg-teal-100'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {isPinned ? (
              <>
                <PinOff className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Pinned</span>
              </>
            ) : (
              <>
                <Pin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Pin Sidebar</span>
              </>
            )}
          </button>
        )}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>VMS v3.4 Enterprise</span>
        </div>
      </div>
    </aside>
  );
};
