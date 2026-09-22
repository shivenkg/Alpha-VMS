import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Lock,
  Unlock,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  Save,
  Search,
  Sliders,
  Filter,
  Eye,
  Key,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  Settings2,
  ChevronRight
} from 'lucide-react';
import {
  storageService,
  VMS_FUNCTION_DEFINITIONS,
  DEFAULT_ROLE_PERMISSIONS
} from '../../services/storageService';
import { UserRole, VMSFunctionId, AppUser } from '../../types';

interface RoleWorkflowManagementTabProps {
  onSuccessToast?: (msg: string) => void;
}

const ROLE_METADATA: Record<
  UserRole,
  { name: string; badgeColor: string; description: string; securityTier: string }
> = {
  PLATFORM_SUPER_ADMIN: {
    name: 'Platform Super Admin',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    description: 'Root system administrator across multi-tenant shards and core cryptographic settings.',
    securityTier: 'Tier 0 (Root Clearance)',
  },
  TENANT_ADMIN: {
    name: 'Tenant Admin',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    description: 'Primary corporate administrator for tenant facility policies and departmental IAM.',
    securityTier: 'Tier 1 (Enterprise Full)',
  },
  SITE_ADMIN: {
    name: 'Site Admin',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    description: 'Facility branch director managing local campus gates, hardware, and physical staff.',
    securityTier: 'Tier 2 (Campus Level)',
  },
  TENANT_SECURITY_ADMIN: {
    name: 'Security Admin',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
    description: 'Security operations manager overseeing clearances, incident alerts, and audit logs.',
    securityTier: 'Tier 2 (Security Operations)',
  },
  GATE_SUPERVISOR: {
    name: 'Gate Supervisor',
    badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    description: 'Lead physical gate controller managing turnstiles, guard patrols, and emergency muster.',
    securityTier: 'Tier 3 (Perimeter Control)',
  },
  SECURITY_GUARD: {
    name: 'Security Guard',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    description: 'Stationed guard for physical entry check-in, barcode scanning, and badge printing.',
    securityTier: 'Tier 4 (Stationed Field)',
  },
  RECEPTIONIST: {
    name: 'Receptionist',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    description: 'Front-desk operations for visitor walk-ins, host check-ins, and visitor pass issuance.',
    securityTier: 'Tier 4 (Front Desk)',
  },
  HOST_EMPLOYEE: {
    name: 'Host Employee',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    description: 'Enterprise staff member submitting visitor invites and granting arrival clearances.',
    securityTier: 'Tier 5 (Standard Staff)',
  },
  DEPARTMENT_APPROVER: {
    name: 'Department Approver',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    description: 'Departmental head authorized to sign off on high-security or high-risk visitor visits.',
    securityTier: 'Tier 3 (Approvals Desk)',
  },
  COMPLIANCE_AUDITOR: {
    name: 'Compliance Auditor',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    description: 'Read-only regulatory and forensics officer inspecting immutable access trails.',
    securityTier: 'Tier 2 (Auditing)',
  },
  DEVICE_EDGE_ADMIN: {
    name: 'Device & Edge Admin',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    description: 'IoT network technician managing edge printers, turnstile relays, and offline buffer sync.',
    securityTier: 'Tier 2 (Hardware IoT)',
  },
};

const CATEGORY_NAMES: Record<string, { label: string; icon: any; color: string }> = {
  OPERATIONS: { label: 'Operations & Desk Execution', icon: Layers, color: 'text-teal-700 bg-teal-50 border-teal-200' },
  SECURITY_GOVERNANCE: { label: 'Security, Approvals & Governance', icon: Shield, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  SAFETY_EMERGENCY: { label: 'Life Safety & Emergency Response', icon: AlertTriangle, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  INFRASTRUCTURE: { label: 'Hardware & Edge Infrastructure', icon: Settings2, color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
  ADMINISTRATION: { label: 'System Administration & Integration', icon: Key, color: 'text-purple-700 bg-purple-50 border-purple-200' },
};

export const RoleWorkflowManagementTab: React.FC<RoleWorkflowManagementTabProps> = ({ onSuccessToast }) => {
  const users: AppUser[] = storageService.getState().users;

  // Active sub-tab: 'ROLE_WORKFLOW' (configure what functions a role has) vs 'USER_ACCESS_LIMITS' (restrict individual users)
  const [activeSubTab, setActiveSubTab] = useState<'ROLE_WORKFLOW' | 'USER_ACCESS_LIMITS'>('ROLE_WORKFLOW');

  // Role Workflow State
  const [selectedRole, setSelectedRole] = useState<UserRole>('RECEPTIONIST');
  const rolePermissionsMap = storageService.getAllRolePermissions();
  const [activeFunctions, setActiveFunctions] = useState<VMSFunctionId[]>(
    rolePermissionsMap[selectedRole] || DEFAULT_ROLE_PERMISSIONS[selectedRole] || []
  );
  const [isSavingRole, setIsSavingRole] = useState(false);

  // User Limits State
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserForLimiting, setSelectedUserForLimiting] = useState<AppUser | null>(null);
  const [userRestrictions, setUserRestrictions] = useState<VMSFunctionId[]>([]);
  const [isSavingUserLimit, setIsSavingUserLimit] = useState(false);

  // When changing selected role
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    const fns = storageService.getRolePermissions(role);
    setActiveFunctions(fns);
  };

  // Toggle function for selected role
  const handleToggleFunctionInRole = (fnId: VMSFunctionId) => {
    if (activeFunctions.includes(fnId)) {
      setActiveFunctions(activeFunctions.filter((id) => id !== fnId));
    } else {
      setActiveFunctions([...activeFunctions, fnId]);
    }
  };

  const handleSaveRolePermissions = () => {
    setIsSavingRole(true);
    storageService.updateRolePermissions(selectedRole, activeFunctions);
    setTimeout(() => {
      setIsSavingRole(false);
      if (onSuccessToast) {
        onSuccessToast(
          `Workflow policy updated for role "${ROLE_METADATA[selectedRole].name}". ${activeFunctions.length} functions active.`
        );
      }
    }, 300);
  };

  const handleResetRoleToDefault = () => {
    const defaultFns = DEFAULT_ROLE_PERMISSIONS[selectedRole] || [];
    setActiveFunctions(defaultFns);
    storageService.updateRolePermissions(selectedRole, defaultFns);
    if (onSuccessToast) {
      onSuccessToast(`Role "${ROLE_METADATA[selectedRole].name}" reset to factory default workflow policy.`);
    }
  };

  // Open user restriction modal/panel
  const handleOpenUserLimiting = (u: AppUser) => {
    setSelectedUserForLimiting(u);
    const restricted = storageService.getUserRestrictedFunctions(u.id);
    setUserRestrictions(restricted);
  };

  // Toggle user restriction on a function
  const handleToggleUserRestriction = (fnId: VMSFunctionId) => {
    if (userRestrictions.includes(fnId)) {
      setUserRestrictions(userRestrictions.filter((id) => id !== fnId));
    } else {
      setUserRestrictions([...userRestrictions, fnId]);
    }
  };

  const handleSaveUserLimits = () => {
    if (!selectedUserForLimiting) return;
    setIsSavingUserLimit(true);
    storageService.updateUserAccessLimit(selectedUserForLimiting.id, userRestrictions);
    setTimeout(() => {
      setIsSavingUserLimit(false);
      if (onSuccessToast) {
        onSuccessToast(
          `Access limitation enforced for ${selectedUserForLimiting.name}. ${userRestrictions.length} functions restricted.`
        );
      }
      setSelectedUserForLimiting(null);
    }, 300);
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u: AppUser) => {
      const matchText =
        u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        u.loginId.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(userSearchTerm.toLowerCase());
      return matchText;
    });
  }, [users, userSearchTerm]);

  // Group functions by category
  const categorizedFunctions = useMemo(() => {
    const groups: Record<string, typeof VMS_FUNCTION_DEFINITIONS> = {
      OPERATIONS: [],
      SECURITY_GOVERNANCE: [],
      SAFETY_EMERGENCY: [],
      INFRASTRUCTURE: [],
      ADMINISTRATION: [],
    };
    VMS_FUNCTION_DEFINITIONS.forEach((fn) => {
      if (groups[fn.category]) {
        groups[fn.category].push(fn);
      }
    });
    return groups;
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-800 text-[11px] font-bold uppercase tracking-wider border border-indigo-200">
              Role-Based Access Control (RBAC)
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Fine-Grained Workflow Governance</span>
          </div>
          <h2 className="text-lg font-bold text-[#172B3A] mt-1">
            Role-Based Workflow Management & Access Control
          </h2>
          <p className="text-xs text-[#526575] mt-0.5">
            Add or remove functional modules from security roles, configure operational boundaries, and limit access on individual user accounts.
          </p>
        </div>

        {/* Sub-tab Pill Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
          <button
            id="subtab-role-workflows-btn"
            onClick={() => setActiveSubTab('ROLE_WORKFLOW')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'ROLE_WORKFLOW'
                ? 'bg-white text-[#123B5D] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Role Workflow Policies</span>
          </button>
          <button
            id="subtab-user-limits-btn"
            onClick={() => setActiveSubTab('USER_ACCESS_LIMITS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'USER_ACCESS_LIMITS'
                ? 'bg-white text-[#123B5D] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Limit User Access ({users.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: ROLE WORKFLOW POLICIES (Add / Remove Functions from Roles) */}
      {/* ========================================================================= */}
      {activeSubTab === 'ROLE_WORKFLOW' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Role Navigation Column (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Security Role
                </span>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                  11 Roles
                </span>
              </div>

              <div className="space-y-1.5 mt-3">
                {(Object.keys(ROLE_METADATA) as UserRole[]).map((roleKey) => {
                  const meta = ROLE_METADATA[roleKey];
                  const isSelected = selectedRole === roleKey;
                  const count = (storageService.getRolePermissions(roleKey) || []).length;

                  return (
                    <button
                      key={roleKey}
                      onClick={() => handleSelectRole(roleKey)}
                      className={`w-full text-left p-3 rounded-lg border transition cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/50 shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold ${
                              isSelected ? 'text-teal-950' : 'text-[#172B3A]'
                            }`}
                          >
                            {meta.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {meta.description}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isSelected
                              ? 'bg-teal-700 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {count} fns
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Function Checklist & Permissions Studio (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Active Role Header Details */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${ROLE_METADATA[selectedRole].badgeColor}`}
                  >
                    {ROLE_METADATA[selectedRole].securityTier}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-600">
                    {activeFunctions.length} / {VMS_FUNCTION_DEFINITIONS.length} Modules Active
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#172B3A] mt-1">
                  {ROLE_METADATA[selectedRole].name} Workflow Scope
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {ROLE_METADATA[selectedRole].description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={handleResetRoleToDefault}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Reset to factory baseline"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Default</span>
                </button>
                <button
                  id="save-role-permissions-btn"
                  type="button"
                  onClick={handleSaveRolePermissions}
                  disabled={isSavingRole}
                  className="px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#0d655e] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingRole ? 'Saving...' : 'Save Role Policy'}</span>
                </button>
              </div>
            </div>

            {/* Categorized Function Blocks */}
            <div className="space-y-4">
              {Object.entries(categorizedFunctions).map(([catKey, fns]) => {
                const catMeta = CATEGORY_NAMES[catKey] || {
                  label: catKey,
                  icon: Layers,
                  color: 'text-slate-700 bg-slate-50 border-slate-200',
                };
                const CatIcon = catMeta.icon;

                return (
                  <div key={catKey} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-md border ${catMeta.color}`}>
                          <CatIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-[#172B3A]">{catMeta.label}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            const newActive = Array.from(new Set([...activeFunctions, ...fns.map((f) => f.id)]));
                            setActiveFunctions(newActive);
                          }}
                          className="text-teal-700 hover:underline font-semibold cursor-pointer"
                        >
                          Enable All
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            const idsToRemove = new Set(fns.map((f) => f.id));
                            setActiveFunctions(activeFunctions.filter((id) => !idsToRemove.has(id)));
                          }}
                          className="text-rose-600 hover:underline font-semibold cursor-pointer"
                        >
                          Disable All
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 p-2">
                      {fns.map((fn) => {
                        const isEnabled = activeFunctions.includes(fn.id);

                        return (
                          <div
                            key={fn.id}
                            onClick={() => handleToggleFunctionInRole(fn.id)}
                            className={`p-3 rounded-lg transition cursor-pointer flex items-start justify-between gap-3 ${
                              isEnabled ? 'bg-teal-50/30 hover:bg-teal-50/60' : 'hover:bg-slate-50 opacity-75'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="pt-0.5">
                                <div
                                  className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                                    isEnabled
                                      ? 'bg-teal-700 border-teal-700 text-white'
                                      : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-[#172B3A]">{fn.name}</span>
                                  <span className="text-[10px] font-mono text-slate-400 uppercase">[{fn.id}]</span>
                                </div>
                                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                                  {fn.description}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0 pt-0.5">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isEnabled
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {isEnabled ? 'GRANTED' : 'DENIED'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: USER ACCESS LIMITS (Restrict specific users regardless of role) */}
      {/* ========================================================================= */}
      {activeSubTab === 'USER_ACCESS_LIMITS' && (
        <div className="space-y-4">
          {/* Header and Search Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#172B3A]">
                User Account Access Overrides & Limitation Rules
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Apply bespoke restriction policies to specific personnel without altering the organization-wide role baseline.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Filter user by name, role or login ID..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* User Directory Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">System Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Custom Restrictions</th>
                    <th className="py-3 px-4">Effective Clearance</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u: AppUser) => {
                    const roleMeta = ROLE_METADATA[u.role as UserRole] || {
                      name: u.role,
                      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
                    };
                    const userBlockedFns = storageService.getUserRestrictedFunctions(u.id);
                    const effectiveFns = storageService.getUserEffectivePermissions(u.id);

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#172B3A]">{u.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {u.loginId} • {u.email}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${roleMeta.badgeColor}`}
                          >
                            {roleMeta.name}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                u.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            />
                            {u.status}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {userBlockedFns.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-800 text-[10px] font-bold border border-rose-200">
                              <Lock className="w-3 h-3 text-rose-600" />
                              <span>{userBlockedFns.length} Functions Blocked</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Standard (No limits)</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-xs font-semibold text-[#123B5D]">
                            {effectiveFns.length} Allowed
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            id={`limit-access-btn-${u.id}`}
                            onClick={() => handleOpenUserLimiting(u)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-[#123B5D] inline-flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5 text-teal-700" />
                            <span>Limit Access</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* USER ACCESS LIMITATION MODAL */}
      {/* ========================================================================= */}
      {selectedUserForLimiting && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300 uppercase tracking-wider">
                    Access Limitation Policy
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-600">
                    {selectedUserForLimiting.loginId}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#172B3A] mt-1">
                  Enforce Access Limits for {selectedUserForLimiting.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assigned Role:{' '}
                  <strong>{ROLE_METADATA[selectedUserForLimiting.role]?.name}</strong>. Toggle any function below to restrict this specific user from executing it.
                </p>
              </div>

              <button
                onClick={() => setSelectedUserForLimiting(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: List of Inherited Role Functions */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Explicit Function Blocking:</span> When a function is marked as{' '}
                  <span className="text-rose-700 font-bold">RESTRICTED</span>, the user will be strictly barred from opening that view or triggering that action, even if their system role ordinarily permits it.
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {VMS_FUNCTION_DEFINITIONS.map((fn) => {
                  const rolePermits = storageService.getRolePermissions(selectedUserForLimiting.role).includes(fn.id);
                  const isBlocked = userRestrictions.includes(fn.id);

                  return (
                    <div
                      key={fn.id}
                      onClick={() => handleToggleUserRestriction(fn.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isBlocked
                          ? 'border-rose-300 bg-rose-50/50'
                          : rolePermits
                          ? 'border-slate-200 bg-white hover:bg-slate-50'
                          : 'border-slate-100 bg-slate-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border transition shrink-0 ${
                            isBlocked
                              ? 'bg-rose-600 border-rose-600 text-white'
                              : 'border-slate-300 bg-white text-slate-400'
                          }`}
                        >
                          {isBlocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#172B3A]">{fn.name}</span>
                            {!rolePermits && (
                              <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                                Not in baseline role
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{fn.description}</p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            isBlocked
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isBlocked ? 'BLOCKED / RESTRICTED' : 'ALLOWED'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setUserRestrictions([])}
                className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer"
              >
                Clear All Restrictions
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForLimiting(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="save-user-access-limits-btn"
                  type="button"
                  onClick={handleSaveUserLimits}
                  disabled={isSavingUserLimit}
                  className="px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#0d655e] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingUserLimit ? 'Applying...' : 'Enforce Access Limits'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
