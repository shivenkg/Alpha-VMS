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
  Shield,
  ShieldCheck,
  UserCheck,
  Bell,
  LogOut,
  Building2,
  MapPin,
  DoorOpen
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { NavViewId, UserRole } from '../../types';
import { JSAlphaSoftLogo } from '../common/JSAlphaSoftLogo';
import { OfflineSyncIndicator } from '../common/OfflineSyncIndicator';

interface SidebarProps {
  currentView: NavViewId;
  onSelectView: (view: NavViewId) => void;
  onOpenSharePreRegModal: () => void;
  onOpenProfileModal?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onOpenSharePreRegModal,
  onOpenProfileModal,
  onLogout,
}) => {
  const state = storageService.getState();
  const activeUser = storageService.getActiveUser();
  const role: UserRole = activeUser?.role || 'RECEPTIONIST';

  const pendingApprovalsCount = state.visits.filter((v) => v.state === 'PENDING_APPROVAL').length;
  const currentlyInsideCount = state.visits.filter((v) => v.state === 'CHECKED_IN').length;
  const pendingEdgeSyncCount = state.edgeSyncEvents.filter((e) => e.status === 'PENDING_UPLOAD').length;

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    storageService.setActiveContext({ tenantId: e.target.value });
  };

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    storageService.setActiveContext({ siteId: e.target.value });
  };

  const handleGateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    storageService.setActiveContext({ gateId: e.target.value });
  };

  const availableSites = state.sites.filter((s) => s.tenantId === state.activeTenantId);
  const availableGates = state.gates.filter((g) => g.siteId === state.activeSiteId);

  const isAdmin =
    role === 'TENANT_ADMIN' ||
    role === 'PLATFORM_SUPER_ADMIN' ||
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
  // Section: Admin & Governance (for Admins)
  // ==========================================
  if (isAdmin) {
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
          label: 'System Customization',
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
    <aside className="w-64 shrink-0 bg-white border-r border-[#D8E1E8] flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Active Persona Banner */}
      <div className="p-3 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#123B5D] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {activeUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#172B3A] truncate">{activeUser.name}</div>
              <div className="text-[10px] text-teal-700 font-semibold truncate flex items-center gap-1">
                <span>{role.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>

          {onOpenProfileModal && (
            <button
              onClick={onOpenProfileModal}
              title="Host Arrival Alerts (SMS / Email / Slack)"
              className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 hover:text-teal-900 border border-teal-200 transition cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] text-[#526575]">
          <span>
            ID: <strong className="font-mono text-[#123B5D]">{activeUser.loginId}</strong>
          </span>
          <div className="flex items-center gap-2">
            {onOpenProfileModal && (
              <button
                onClick={onOpenProfileModal}
                className="text-[10px] text-teal-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Alerts Config</span>
              </button>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                title="Log out of session"
                className="text-[10px] text-red-600 hover:text-red-800 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sections (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {sections.map((sec, idx) => (
          <div key={idx}>
            <div className="text-[10px] font-bold tracking-wider text-[#526575] uppercase px-3 mb-1.5 font-mono">
              {sec.title}
            </div>
            <nav className="space-y-0.5">
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
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition text-left bg-teal-50 text-teal-900 border border-teal-200 hover:bg-teal-100 hover:border-teal-300"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 shrink-0 text-teal-700" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded border leading-none shrink-0 ${
                            item.badgeColor || 'bg-slate-100 text-slate-700'
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
                    onClick={() => onSelectView(item.id as NavViewId)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition text-left ${
                      isActive
                        ? 'bg-[#123B5D] text-white shadow-xs font-semibold'
                        : 'text-[#172B3A] hover:bg-[#F4F7FA] hover:text-[#123B5D]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-teal-300' : 'text-[#526575]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded border leading-none shrink-0 ${
                          item.badgeColor || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Persistent Administration Control Toolbar (Bottom of Sidebar) */}
      <div className="shrink-0 border-t border-[#D8E1E8] bg-[#F8FAFC] p-3 space-y-2.5">
        {/* Header & Status Row: Title/Admin Link, Arrival Alerts, Cloud Sync */}
        <div className="flex items-center justify-between gap-1.5">
          <button
            type="button"
            onClick={() => onSelectView('admin_hub')}
            className="flex items-center gap-1.5 min-w-0 text-left hover:opacity-80 transition cursor-pointer"
            title="Open Full Administration Center Hub"
          >
            <Shield className="w-3.5 h-3.5 text-[#123B5D] shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#123B5D] font-mono truncate">
              Admin Control
            </span>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Arrival Notification Alerts */}
            {onOpenProfileModal && (
              <button
                id="sidebar-bottom-arrival-alerts-btn"
                onClick={onOpenProfileModal}
                title="Host Visitor Arrival Alert Channels (SMS, Email, Slack)"
                className="p-1 rounded-md bg-teal-50 text-teal-700 hover:bg-teal-100 hover:text-teal-900 border border-teal-200 transition relative cursor-pointer shrink-0"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              </button>
            )}

            {/* Cloud Sync Indicator */}
            <div className="scale-90 origin-right shrink-0">
              <OfflineSyncIndicator />
            </div>
          </div>
        </div>

        {/* Tenant / Site / Gate Selector Hierarchy */}
        <div className="space-y-1.5 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs text-xs">
          {/* Tenant Selector */}
          <div className="flex items-center gap-1.5 min-w-0">
            <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <select
              id="sidebar-tenant-select"
              value={state.activeTenantId}
              onChange={handleTenantChange}
              className="w-full bg-transparent text-[#172B3A] text-[11px] font-semibold focus:outline-none cursor-pointer truncate border-none"
              title="Select Active Enterprise Tenant"
            >
              {state.tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-100" />

          {/* Site / Campus Selector */}
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              id="sidebar-site-select"
              value={state.activeSiteId}
              onChange={handleSiteChange}
              className="w-full bg-transparent text-[#172B3A] text-[11px] font-medium focus:outline-none cursor-pointer truncate border-none"
              title="Select Active Campus / Facility Site"
            >
              {availableSites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-100" />

          {/* Gate Turnstile Selector */}
          <div className="flex items-center gap-1.5 min-w-0">
            <DoorOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              id="sidebar-gate-select"
              value={state.activeGateId}
              onChange={handleGateChange}
              className="w-full bg-transparent text-[#172B3A] text-[11px] font-medium focus:outline-none cursor-pointer truncate border-none"
              title="Select Active Gate / Barrier Turnstile"
            >
              {availableGates.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pass Format Designer (under Administration Control Toolbar) */}
        <button
          id="sidebar-pass-format-designer-btn"
          onClick={() => onSelectView('badges')}
          className={`w-full p-2 rounded-xl border transition text-left flex items-center justify-between cursor-pointer group ${
            currentView === 'badges'
              ? 'bg-[#123B5D] text-white border-[#0f304c] shadow-xs'
              : 'bg-white hover:bg-slate-50 text-[#172B3A] border-slate-200 shadow-2xs'
          }`}
          title="Open Pass Format Designer & Thermal Label Customizer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${
                currentView === 'badges'
                  ? 'bg-teal-500/25 text-teal-300'
                  : 'bg-teal-50 text-teal-700 group-hover:bg-teal-100'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">Pass Format Designer</div>
              <div
                className={`text-[10px] truncate ${
                  currentView === 'badges' ? 'text-teal-200' : 'text-[#526575]'
                }`}
              >
                QR Passes & Thermal Formats
              </div>
            </div>
          </div>
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 font-mono ${
              currentView === 'badges'
                ? 'bg-teal-400/20 text-teal-200 border-teal-400/30'
                : 'bg-teal-50 text-teal-700 border-teal-200'
            }`}
          >
            FORMAT
          </span>
        </button>

        {/* Tenant DB Health */}
        <div className="flex items-center justify-between text-[10px] text-[#526575] px-1">
          <span>Tenant DB Health</span>
          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-semibold font-mono">
            {state.tenants.find((t) => t.id === state.activeTenantId)?.databaseHealth || 'HEALTHY'}
          </span>
        </div>
      </div>
    </aside>
  );
};
