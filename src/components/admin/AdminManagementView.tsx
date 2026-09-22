import React, { useState } from 'react';
import {
  Building2,
  Users,
  Sliders,
  Plus,
  Shield,
  Key,
  Check,
  AlertCircle,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  Palette,
  FileText,
  Clock,
  ShieldCheck,
  Globe,
  Database,
  Search,
  Lock,
  FileSpreadsheet,
  CreditCard,
  ShieldAlert,
  Printer
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { AppUser, Tenant, UserRole } from '../../types';
import { JSAlphaSoftLogo } from '../common/JSAlphaSoftLogo';
import { AdminControlToolbar } from './AdminControlToolbar';
import { GoogleSheetsConfigTab } from './GoogleSheetsConfigTab';
import { VisitorPassDesignerTab } from './VisitorPassDesignerTab';
import { RoleWorkflowManagementTab } from './RoleWorkflowManagementTab';
import { AdminGlobalSearchFilterBar } from './AdminGlobalSearchFilterBar';

export type AdminActiveTab = 'users' | 'tenants' | 'customization' | 'sheets' | 'pass_designer' | 'roles_workflow';

interface AdminManagementViewProps {
  initialTab?: AdminActiveTab;
  onOpenSharePreRegModal?: () => void;
  onOpenSettingsModal?: () => void;
  onOpenProfileModal?: () => void;
  onOpenEmergencyModal?: () => void;
  onLogout?: () => void;
  onRoleAutoRender?: (role: UserRole) => void;
  isAutoRenderingEnabled?: boolean;
  onToggleAutoRendering?: () => void;
}

export const AdminManagementView: React.FC<AdminManagementViewProps> = ({
  initialTab = 'users',
  onOpenSharePreRegModal,
  onOpenSettingsModal,
  onOpenProfileModal,
  onOpenEmergencyModal,
  onLogout,
  onRoleAutoRender,
  isAutoRenderingEnabled = true,
  onToggleAutoRendering,
}) => {
  const [activeTab, setActiveTab] = useState<AdminActiveTab>(initialTab);
  const state = storageService.getState();
  const activeTenant = storageService.getActiveTenant();
  const activeUser = storageService.getActiveUser();
  const role: UserRole = activeUser?.role || 'RECEPTIONIST';
  const isSuperAdmin = role === 'PLATFORM_SUPER_ADMIN';

  // Feedback notifications
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  if (!isSuperAdmin) {
    return (
      <div className="bg-white rounded-2xl border border-amber-200 p-8 text-center max-w-lg mx-auto shadow-sm my-12">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-700">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Admin Control Center Hub Restricted</h2>
        <p className="text-sm text-slate-600 mb-4">
          The Admin Control Center Hub is restricted exclusively to the Platform Super Admin profile. Your current role is{' '}
          <span className="font-semibold text-slate-800">{role.replace(/_/g, ' ')}</span>.
        </p>
      </div>
    );
  }

  // ----------------------------------------------------
  // TAB 1: User Management State & Handlers
  // ----------------------------------------------------
  const [userSearch, setUserSearch] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserLoginId, setNewUserLoginId] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('welcome123');
  const [newUserRole, setNewUserRole] = useState<UserRole>('RECEPTIONIST');
  const [newUserDepartment, setNewUserDepartment] = useState('Front Desk Operations');
  const [newUserMfa, setNewUserMfa] = useState(false);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorToast(null);

    const res = storageService.addUser({
      name: newUserName,
      loginId: newUserLoginId,
      email: newUserEmail,
      password: newUserPassword,
      role: newUserRole,
      departmentName: newUserDepartment,
      mfaEnabled: newUserMfa,
      tenantId: activeTenant.id,
    });

    if (res.success && res.user) {
      setSuccessToast(`New user account created for ${res.user.name} (Login ID: ${res.user.loginId})`);
      setIsAddUserOpen(false);
      // Reset form
      setNewUserName('');
      setNewUserLoginId('');
      setNewUserEmail('');
      setNewUserPassword('welcome123');
      setTimeout(() => setSuccessToast(null), 4000);
    } else {
      setErrorToast(res.error || 'Failed to create user account.');
      setTimeout(() => setErrorToast(null), 4000);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete login access for "${userName}"?`)) {
      const res = storageService.deleteUser(userId);
      if (res.success) {
        setSuccessToast(`User "${userName}" deleted successfully.`);
        setTimeout(() => setSuccessToast(null), 3000);
      } else {
        setErrorToast(res.error || 'Failed to delete user.');
        setTimeout(() => setErrorToast(null), 3000);
      }
    }
  };

  const handleToggleUserStatus = (user: AppUser) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    storageService.updateUser(user.id, { status: nextStatus });
    setSuccessToast(`User ${user.name} is now ${nextStatus}.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // ----------------------------------------------------
  // TAB 2: Tenant Management State & Handlers
  // ----------------------------------------------------
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [tenantCode, setTenantCode] = useState('');
  const [tenantTier, setTenantTier] = useState<Tenant['tier']>('ENTERPRISE_STANDARD');
  const [tenantPrimaryColor, setTenantPrimaryColor] = useState('#123B5D');
  const [tenantInitialSite, setTenantInitialSite] = useState('');
  const [tenantInitialAddress, setTenantInitialAddress] = useState('');

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim() || !tenantCode.trim()) {
      setErrorToast('Please specify tenant name and alphanumeric code.');
      return;
    }

    const newTen = storageService.addTenant({
      name: tenantName,
      code: tenantCode,
      tier: tenantTier,
      primaryColor: tenantPrimaryColor,
      initialSiteName: tenantInitialSite || `${tenantName} Tech Center`,
      initialSiteAddress: tenantInitialAddress || 'Bangalore Tech Park, Karnataka',
    });

    setSuccessToast(`Enterprise Tenant "${newTen.name}" (${newTen.code}) provisioned with initial site!`);
    setIsAddTenantOpen(false);
    setTenantName('');
    setTenantCode('');
    setTenantInitialSite('');
    setTenantInitialAddress('');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // ----------------------------------------------------
  // TAB 3: Customization State & Handlers
  // ----------------------------------------------------
  const [brandOrgName, setBrandOrgName] = useState(activeTenant.name);
  const [brandColor, setBrandColor] = useState(activeTenant.branding.primaryColor || '#123B5D');
  const [brandLogoText, setBrandLogoText] = useState(activeTenant.branding.logoText || activeTenant.name);
  const [ndaTerms, setNdaTerms] = useState(
    'Visitors agree to maintain strict confidentiality regarding all proprietary materials, technical specifications, and facility operations observed during the visit.'
  );
  const [wifiAccessCode, setWifiAccessCode] = useState('JS-GUEST-SECURE-2026');

  const handleSaveCustomization = () => {
    storageService.updateTenantBranding(activeTenant.id, {
      primaryColor: brandColor,
      logoText: brandLogoText,
    });
    storageService.updateTenant(activeTenant.id, {
      name: brandOrgName,
    });
    setSuccessToast('Tenant branding, theme colors, and visitor policy saved successfully!');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Filtered users for table
  const filteredUsers = state.users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.loginId.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert Banners */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {errorToast && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 animate-fadeIn shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="font-semibold">{errorToast}</span>
        </div>
      )}

      {/* Multi-Tenant Context & Operational Control Toolbar (Above Administration Center) */}
      <AdminControlToolbar
        onOpenSharePreRegModal={onOpenSharePreRegModal}
        onOpenSettingsModal={onOpenSettingsModal}
        onOpenProfileModal={onOpenProfileModal}
        onOpenEmergencyModal={onOpenEmergencyModal}
        onLogout={onLogout}
        onRoleAutoRender={onRoleAutoRender}
        isAutoRenderingEnabled={isAutoRenderingEnabled}
        onToggleAutoRendering={onToggleAutoRendering}
      />

      {/* Active Enterprise Tenant Selector & Isolation Context */}
      <div className="bg-gradient-to-r from-[#123B5D] via-[#10324f] to-[#0F766E] rounded-2xl p-4 sm:p-5 text-white shadow-md border border-[#1b4b75] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-teal-300 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-teal-400/20 text-teal-200 border border-teal-400/30 font-bold">
                Active Enterprise Tenant
              </span>
              <span className="text-xs text-white/50">•</span>
              <span className="text-xs font-semibold text-teal-100">
                Tier: <strong className="text-white">{activeTenant.tier.replace(/_/g, ' ')}</strong>
              </span>
              <span className="text-xs text-white/50">•</span>
              <span className="text-[11px] font-mono text-emerald-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Shard: {activeTenant.databaseRef || 'tenant_db_primary'} (HEALTHY)
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-white mt-1">
              {activeTenant.name} <span className="font-mono text-sm text-teal-300 font-normal">[{activeTenant.code}]</span>
            </h2>
            <p className="text-xs text-slate-300">
              Facility Scope: {state.sites.filter((s) => s.tenantId === activeTenant.id).length} Campus Sites •{' '}
              {
                state.gates.filter((g) =>
                  state.sites
                    .filter((s) => s.tenantId === activeTenant.id)
                    .map((s) => s.id)
                    .includes(g.siteId)
                ).length
              }{' '}
              Turnstile Gates • Timezone: {activeTenant.timezone || 'Asia/Kolkata'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 bg-black/25 p-2 rounded-xl border border-white/15">
          <label htmlFor="admin-enterprise-tenant-switcher" className="text-xs font-bold text-teal-200 whitespace-nowrap pl-1">
            Select Active Tenant:
          </label>
          <select
            id="admin-enterprise-tenant-switcher"
            value={activeTenant.id}
            onChange={(e) => {
              const newId = e.target.value;
              const tenant = state.tenants.find((t) => t.id === newId);
              storageService.setActiveContext({ tenantId: newId });
              if (tenant) {
                setSuccessToast(`Active Enterprise Tenant switched to: ${tenant.name} (${tenant.code})`);
                setTimeout(() => setSuccessToast(null), 3500);
              }
            }}
            className="bg-[#0b2438] text-white font-semibold text-xs border border-teal-500/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer max-w-full"
          >
            {state.tenants.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#123B5D] text-white">
                {t.name} ({t.code}) — {t.tier.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Admin Module Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="w-full">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#123B5D]/10 text-[#123B5D] text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
              Administration Center Hub
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600 font-medium whitespace-nowrap flex items-center gap-1">
              Enterprise Tenant Context: <strong className="text-[#172B3A] font-bold">{activeTenant.name}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172B3A] mt-2 tracking-tight">
            Tenant Management, System Customization & Security Workflow Governance
          </h1>
          <p className="text-xs sm:text-sm text-[#526575] mt-1 max-w-3xl leading-relaxed">
            Configure multi-tenant isolation, role permission matrices, physical pass formats, and corporate credentials.
          </p>
        </div>

        {/* Tab Switcher - Full-width dedicated strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center overflow-x-auto gap-1.5 bg-[#F4F7FA] p-1.5 rounded-xl border border-slate-200">
          <button
            id="admin-tab-users"
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'users'
                ? 'bg-white text-[#123B5D] shadow-xs'
                : 'text-[#526575] hover:text-[#172B3A]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Accounts ({state.users.length})</span>
          </button>

          {/* Pass Format & Thermal Label Customiser — Visible ONLY under Super Admin role */}
          {isSuperAdmin && (
            <button
              id="admin-tab-pass-designer"
              onClick={() => setActiveTab('pass_designer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'pass_designer'
                  ? 'bg-white text-purple-900 border border-purple-200 shadow-xs'
                  : 'text-[#526575] hover:text-purple-900'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-purple-600" />
              <span>Pass & Thermal Customiser</span>
              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[9px] font-black uppercase tracking-wider ml-0.5">
                Super Admin
              </span>
            </button>
          )}

          <button
            id="admin-tab-roles-workflow"
            onClick={() => setActiveTab('roles_workflow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'roles_workflow'
                ? 'bg-white text-indigo-800 shadow-xs'
                : 'text-[#526575] hover:text-[#172B3A]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
            <span>Roles & Access Limits</span>
          </button>
          <button
            id="admin-tab-tenants"
            onClick={() => setActiveTab('tenants')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'tenants'
                ? 'bg-white text-[#123B5D] shadow-xs'
                : 'text-[#526575] hover:text-[#172B3A]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Tenants ({state.tenants.length})</span>
          </button>
          <button
            id="admin-tab-customization"
            onClick={() => setActiveTab('customization')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'customization'
                ? 'bg-white text-[#123B5D] shadow-xs'
                : 'text-[#526575] hover:text-[#172B3A]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customization</span>
          </button>
          <button
            id="admin-tab-google-sheets"
            onClick={() => setActiveTab('sheets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'sheets'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-[#526575] hover:text-[#172B3A]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Sheet Sync</span>
          </button>
        </div>
      </div>

      {/* Global Administrative Search & Filter Hub */}
      <AdminGlobalSearchFilterBar
        onNavigateToTab={(tab) => setActiveTab(tab)}
        onFilterUsersTab={(query) => {
          setActiveTab('users');
          setUserSearch(query);
        }}
        onNotifySuccess={(msg) => {
          setSuccessToast(msg);
          setTimeout(() => setSuccessToast(null), 3500);
        }}
      />

      {/* ========================================================================= */}
      {/* TAB 1: User Login ID Creation & User Management */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user, Login ID, role, email..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-[#172B3A] focus:outline-none focus:border-[#123B5D]"
              />
            </div>

            <button
              id="open-add-user-modal-btn"
              onClick={() => setIsAddUserOpen(true)}
              className="w-full sm:w-auto px-4 py-2 bg-[#123B5D] hover:bg-[#0F766E] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New User Login ID</span>
            </button>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#526575] border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Login ID</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[#172B3A]">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#123B5D]/10 text-[#123B5D] font-bold flex items-center justify-center text-xs shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[#172B3A] flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {user.mfaEnabled && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-teal-100 text-teal-800 font-semibold">
                                  MFA
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#526575] font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-[#123B5D] border border-slate-200">
                          {user.loginId}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            user.role === 'RECEPTIONIST'
                              ? 'bg-teal-100 text-teal-800'
                              : user.role === 'TENANT_ADMIN' || user.role === 'PLATFORM_SUPER_ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'SECURITY_GUARD'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {user.role.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#526575]">{user.departmentName}</td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleUserStatus(user)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition ${
                            user.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {user.status}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-[#526575] font-mono text-[11px]">
                        {user.lastLoginAt.includes('T')
                          ? new Date(user.lastLoginAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : user.lastLoginAt}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            title="Delete user credentials"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: Multi-Tenant Addition & Governance */}
      {/* ========================================================================= */}
      {activeTab === 'tenants' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#172B3A]">Enterprise Tenant Registry</h2>
              <p className="text-xs text-[#526575]">
                Isolated multi-tenant partitions with dedicated schema boundaries and compliance policies.
              </p>
            </div>
            <button
              id="open-add-tenant-modal-btn"
              onClick={() => setIsAddTenantOpen(true)}
              className="px-4 py-2 bg-[#123B5D] hover:bg-[#0F766E] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Enterprise Tenant</span>
            </button>
          </div>

          {/* Tenants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.tenants.map((t) => {
              const sitesForTenant = state.sites.filter((s) => s.tenantId === t.id);
              const isCurrent = t.id === activeTenant.id;

              return (
                <div
                  key={t.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition ${
                    isCurrent ? 'border-[#123B5D] ring-2 ring-[#123B5D]/10' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs"
                          style={{ backgroundColor: t.branding.primaryColor || '#123B5D' }}
                        >
                          {t.code.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#172B3A]">{t.name}</div>
                          <div className="text-[10px] text-[#526575] font-mono">{t.code}</div>
                        </div>
                      </div>
                      {isCurrent ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Active Context
                        </span>
                      ) : (
                        <button
                          onClick={() => storageService.setActiveContext({ tenantId: t.id })}
                          className="text-[10px] font-bold text-[#123B5D] hover:underline"
                        >
                          Switch To
                        </button>
                      )}
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Tier:</span>
                        <span className="font-bold text-[#172B3A]">{t.tier.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Managed Sites:</span>
                        <span className="font-bold text-[#172B3A]">{sitesForTenant.length} campuses</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Database Health:</span>
                        <span className="font-bold text-emerald-600">{t.databaseHealth}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Retain: {t.retentionDays} days</span>
                    <span className="font-mono text-[10px]">{t.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: System Customization & Branding */}
      {/* ========================================================================= */}
      {activeTab === 'customization' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-[#172B3A]">System Customization & Branding</h2>
            <p className="text-xs text-[#526575] mt-0.5">
              Personalize tenant corporate logos, colors, visitor pass layouts, and compliance policy agreements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visual Branding Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#123B5D] flex items-center gap-1.5">
                <Palette className="w-4 h-4" />
                <span>Visual Identity & Color Themes</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-[#172B3A] mb-1">
                  Tenant Organization Display Name
                </label>
                <input
                  type="text"
                  value={brandOrgName}
                  onChange={(e) => setBrandOrgName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#CBD5E1] rounded-xl text-xs font-medium text-[#172B3A] focus:outline-none focus:border-[#123B5D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B3A] mb-1">
                  Logo Text / Slogan
                </label>
                <input
                  type="text"
                  value={brandLogoText}
                  onChange={(e) => setBrandLogoText(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#CBD5E1] rounded-xl text-xs font-medium text-[#172B3A] focus:outline-none focus:border-[#123B5D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B3A] mb-1.5">
                  Primary Theme Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                  />
                  <div className="flex flex-wrap gap-2">
                    {['#123B5D', '#0F766E', '#EA580C', '#1E1B4B', '#14532D', '#B91C1C'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setBrandColor(c)}
                        className="w-6 h-6 rounded-lg border border-slate-300 shadow-2xs"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Live Logo & Header Preview
                </span>
                <div className="p-3 bg-[#123B5D] rounded-xl flex items-center justify-between text-white">
                  <JSAlphaSoftLogo darkTheme size="md" />
                  <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded text-teal-300">
                    {brandOrgName}
                  </span>
                </div>
              </div>
            </div>

            {/* Policies & Pass Agreement */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#123B5D] flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>Visitor Policies & Pass Rules</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-[#172B3A] mb-1">
                  Non-Disclosure Agreement (NDA) Statement
                </label>
                <textarea
                  rows={4}
                  value={ndaTerms}
                  onChange={(e) => setNdaTerms(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#CBD5E1] rounded-xl text-xs font-medium text-[#172B3A] focus:outline-none focus:border-[#123B5D] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B3A] mb-1">
                  Guest Wi-Fi SSID & Daily Passcode
                </label>
                <input
                  type="text"
                  value={wifiAccessCode}
                  onChange={(e) => setWifiAccessCode(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#CBD5E1] rounded-xl text-xs font-medium text-[#172B3A] focus:outline-none focus:border-[#123B5D]"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  All changes made here instantly reflect on the Front Desk check-in kiosk, thermal badge prints, and visitor pre-registration invitations.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveCustomization}
              className="px-5 py-2.5 bg-[#123B5D] hover:bg-[#0F766E] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Save & Apply Customization</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: Google Sheets Configuration */}
      {/* ========================================================================= */}
      {activeTab === 'sheets' && (
        <GoogleSheetsConfigTab
          onNotifySuccess={(msg) => {
            setSuccessToast(msg);
            setTimeout(() => setSuccessToast(null), 4000);
          }}
          onNotifyError={(msg) => {
            setErrorToast(msg);
            setTimeout(() => setErrorToast(null), 4000);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 5: Visitor Pass & Thermal Label Customiser (Super Admin Clearance) */}
      {/* ========================================================================= */}
      {activeTab === 'pass_designer' && (
        isSuperAdmin ? (
          <VisitorPassDesignerTab
            onSuccessToast={(msg) => {
              setSuccessToast(msg);
              setTimeout(() => setSuccessToast(null), 4000);
            }}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-amber-200 p-8 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172B3A]">Restricted: Platform Super Admin Clearance Required</h3>
              <p className="text-xs text-[#526575] max-w-md mx-auto mt-1">
                Visitor Pass Format Designer & Thermal Label Customiser is restricted exclusively to <strong>Platform Super Admin (Tier 0)</strong> clearance. Your active session role is <strong>{activeUser?.role.replace(/_/g, ' ')}</strong>.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  const superAdmin = state.users.find((u) => u.role === 'PLATFORM_SUPER_ADMIN');
                  if (superAdmin) {
                    storageService.setActiveContext({ userId: superAdmin.id });
                    setSuccessToast('Switched to Platform Super Admin: Ananya Sharma');
                    setTimeout(() => setSuccessToast(null), 3000);
                  }
                }}
                className="px-4 py-2 bg-[#123B5D] hover:bg-[#0F766E] text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Switch to Super Admin (Ananya Sharma)</span>
              </button>
            </div>
          </div>
        )
      )}

      {/* ========================================================================= */}
      {/* TAB 6: Role-Based Workflow Management & Access Limits */}
      {/* ========================================================================= */}
      {activeTab === 'roles_workflow' && (
        <RoleWorkflowManagementTab
          onSuccessToast={(msg) => {
            setSuccessToast(msg);
            setTimeout(() => setSuccessToast(null), 4000);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Create New User Login ID */}
      {/* ========================================================================= */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#123B5D] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-teal-300">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Create New User Login ID</h3>
                  <p className="text-[11px] text-slate-300">Grant role-based access credentials</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-3.5 text-xs text-[#172B3A]">
              <div>
                <label className="block font-bold text-[#172B3A] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => {
                    setNewUserName(e.target.value);
                    if (!newUserLoginId) {
                      setNewUserLoginId(e.target.value.toLowerCase().replace(/\s+/g, ''));
                    }
                  }}
                  placeholder="e.g. Meera Joshi"
                  className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#CBD5E1] rounded-xl text-xs font-medium focus:outline-none focus:border-[#123B5D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#172B3A] mb-1">Login ID (Username)</label>
                  <input
                    type="text"
                    required
                    value={newUserLoginId}
                    onChange={(e) => setNewUserLoginId(e.target.value.toLowerCase())}
                    placeholder="e.g. meera or reception2"
                    className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#CBD5E1] rounded-xl text-xs font-mono font-medium focus:outline-none focus:border-[#123B5D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#172B3A] mb-1">Access Password</label>
                  <input
                    type="text"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#CBD5E1] rounded-xl text-xs font-medium focus:outline-none focus:border-[#123B5D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#172B3A] mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. meera.joshi@tata-enterprise.com"
                  className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#CBD5E1] rounded-xl text-xs font-medium focus:outline-none focus:border-[#123B5D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#172B3A] mb-1">Assigned Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#CBD5E1] rounded-xl text-xs font-medium focus:outline-none focus:border-[#123B5D]"
                  >
                    <option value="RECEPTIONIST">Receptionist / Front Desk</option>
                    <option value="SECURITY_GUARD">Security Guard / Gatekeeper</option>
                    <option value="HOST_EMPLOYEE">Host Employee</option>
                    <option value="DEPARTMENT_APPROVER">Department Approver</option>
                    <option value="TENANT_ADMIN">Tenant Admin</option>
                    <option value="PLATFORM_SUPER_ADMIN">Platform Super Admin</option>
                    <option value="COMPLIANCE_AUDITOR">Compliance Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#172B3A] mb-1">Department</label>
                  <input
                    type="text"
                    value={newUserDepartment}
                    onChange={(e) => setNewUserDepartment(e.target.value)}
                    placeholder="e.g. Security Operations"
                    className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#CBD5E1] rounded-xl text-xs font-medium focus:outline-none focus:border-[#123B5D]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mfa-checkbox"
                  checked={newUserMfa}
                  onChange={(e) => setNewUserMfa(e.target.checked)}
                  className="rounded border-[#CBD5E1] text-[#123B5D] focus:ring-0"
                />
                <label htmlFor="mfa-checkbox" className="text-xs font-medium text-[#526575] cursor-pointer">
                  Require Multi-Factor Authentication (MFA via OTP)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-[#526575] hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#123B5D] hover:bg-[#0F766E] text-white font-bold transition shadow-xs"
                >
                  Save & Issue Login ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Add New Enterprise Tenant */}
      {/* ========================================================================= */}
      {isAddTenantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#123B5D] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-teal-300">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Add New Enterprise Tenant</h3>
                  <p className="text-[11px] text-slate-300">Provision isolated multi-tenant organization</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddTenantOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="p-6 space-y-3.5 text-xs text-[#172B3A]">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-[#172B3A] mb-1">Company / Tenant Name</label>
                  <input
                    type="text"
                    required
                    value={tenantName}
                    onChange={(e) => {
                      setTenantName(e.target.value);
                      if (!tenantCode) {
                        setTenantCode(e.target.value.substring(0, 4).toUpperCase());
                      }
                    }}
                    placeholder="e.g. Reliance Industries"
                    className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#CBD5E1] rounded-xl text-xs font-medium focus:outline-none focus:border-[#123B5D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#172B3A] mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={tenantCode}
                    onChange={(e) => setTenantCode(e.target.value.toUpperCase())}
                    placeholder="e.g. REL"
                    className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#CBD5E1] rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#123B5D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#172B3A] mb-1">Service SLA Tier</label>
                  <select
                    value={tenantTier}
                    onChange={(e) => setTenantTier(e.target.value as Tenant['tier'])}
                    className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#CBD5E1] rounded-xl text-xs font-medium focus:outline-none focus:border-[#123B5D]"
                  >
                    <option value="ENTERPRISE_STANDARD">Enterprise Standard</option>
                    <option value="ENTERPRISE_PREMIUM">Enterprise Premium</option>
                    <option value="MISSION_CRITICAL">Mission Critical (Gov / Defence)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#172B3A] mb-1">Brand Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={tenantPrimaryColor}
                      onChange={(e) => setTenantPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                    />
                    <input
                      type="text"
                      value={tenantPrimaryColor}
                      onChange={(e) => setTenantPrimaryColor(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#F4F7FA] border border-[#CBD5E1] rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#172B3A] mb-1">Initial Campus / Site Name</label>
                <input
                  type="text"
                  value={tenantInitialSite}
                  onChange={(e) => setTenantInitialSite(e.target.value)}
                  placeholder="e.g. Jio Tech Center & Corporate Park"
                  className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#CBD5E1] rounded-xl text-xs font-medium focus:outline-none focus:border-[#123B5D]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172B3A] mb-1">Campus Physical Address</label>
                <input
                  type="text"
                  value={tenantInitialAddress}
                  onChange={(e) => setTenantInitialAddress(e.target.value)}
                  placeholder="e.g. Navi Mumbai, Maharashtra 400701"
                  className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#CBD5E1] rounded-xl text-xs font-medium focus:outline-none focus:border-[#123B5D]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTenantOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-[#526575] hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#123B5D] hover:bg-[#0F766E] text-white font-bold transition shadow-xs"
                >
                  Provision Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
