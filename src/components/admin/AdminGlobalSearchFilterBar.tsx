import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Filter,
  X,
  Users,
  Building2,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { AppUser, Tenant, AuditEvent, UserRole } from '../../types';
import { AdminAuditLogModal } from './AdminAuditLogModal';

interface AdminGlobalSearchFilterBarProps {
  onNavigateToTab: (tab: 'users' | 'tenants' | 'roles_workflow' | 'pass_designer' | 'customization' | 'sheets') => void;
  onFilterUsersTab?: (query: string) => void;
  onNotifySuccess?: (msg: string) => void;
}

type EntityScope = 'ALL' | 'USERS' | 'TENANTS' | 'AUDIT_LOGS';
type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUCCESS' | 'DENIED' | 'FAILURE';

export const AdminGlobalSearchFilterBar: React.FC<AdminGlobalSearchFilterBarProps> = ({
  onNavigateToTab,
  onFilterUsersTab,
  onNotifySuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState<EntityScope>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditEvent | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const state = storageService.getState();
  const users = state.users || [];
  const tenants = state.tenants || [];
  const auditLogs = state.auditEvents || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter matching Users
  const filteredUsers = useMemo(() => {
    if (selectedScope === 'TENANTS' || selectedScope === 'AUDIT_LOGS') return [];

    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      // Role filter
      if (selectedRole !== 'ALL' && u.role !== selectedRole) return false;
      // Status filter
      if (selectedStatus === 'ACTIVE' && u.status !== 'ACTIVE') return false;
      if (selectedStatus === 'INACTIVE' && u.status === 'ACTIVE') return false;
      if (selectedStatus === 'SUCCESS' || selectedStatus === 'DENIED' || selectedStatus === 'FAILURE') {
        // These are audit statuses, exclude users if specifically selected
        return false;
      }

      if (!q) return selectedRole !== 'ALL' || selectedStatus !== 'ALL';

      const matchName = u.name.toLowerCase().includes(q);
      const matchLogin = u.loginId.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchDept = (u.departmentName || '').toLowerCase().includes(q);
      const matchRole = u.role.toLowerCase().includes(q);

      return matchName || matchLogin || matchEmail || matchDept || matchRole;
    });
  }, [users, searchQuery, selectedScope, selectedRole, selectedStatus]);

  // Filter matching Tenants
  const filteredTenants = useMemo(() => {
    if (selectedScope === 'USERS' || selectedScope === 'AUDIT_LOGS') return [];
    if (selectedRole !== 'ALL') return []; // Role filter applies to users/audit actors

    const q = searchQuery.toLowerCase().trim();
    return tenants.filter((t) => {
      // Status filter (databaseHealth or tier)
      if (selectedStatus === 'ACTIVE' && t.databaseHealth !== 'HEALTHY') return false;
      if (selectedStatus === 'INACTIVE' && t.databaseHealth === 'HEALTHY') return false;
      if (selectedStatus === 'SUCCESS' || selectedStatus === 'DENIED' || selectedStatus === 'FAILURE') {
        return false;
      }

      if (!q) return selectedStatus !== 'ALL';

      const matchName = t.name.toLowerCase().includes(q);
      const matchCode = t.code.toLowerCase().includes(q);
      const matchTier = t.tier.toLowerCase().includes(q);
      const matchHealth = (t.databaseHealth || '').toLowerCase().includes(q);

      return matchName || matchCode || matchTier || matchHealth;
    });
  }, [tenants, searchQuery, selectedScope, selectedRole, selectedStatus]);

  // Filter matching System Audit Logs
  const filteredAuditLogs = useMemo(() => {
    if (selectedScope === 'USERS' || selectedScope === 'TENANTS') return [];

    const q = searchQuery.toLowerCase().trim();
    return auditLogs.filter((log) => {
      // Role filter
      if (selectedRole !== 'ALL' && log.actorRole !== selectedRole) return false;
      // Status filter
      if (selectedStatus === 'SUCCESS' && log.status !== 'SUCCESS') return false;
      if (selectedStatus === 'DENIED' && log.status !== 'DENIED') return false;
      if (selectedStatus === 'FAILURE' && log.status !== 'FAILURE') return false;
      if (selectedStatus === 'ACTIVE' || selectedStatus === 'INACTIVE') {
        // Active/inactive applies to users/tenants
        return false;
      }

      if (!q) return selectedRole !== 'ALL' || selectedStatus !== 'ALL';

      const matchActor = log.actorName.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      const matchEventType = log.eventType.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchStatus = log.status.toLowerCase().includes(q);
      const matchRole = (log.actorRole || '').toLowerCase().includes(q);
      const matchIp = (log.ipAddress || '').toLowerCase().includes(q);

      return matchActor || matchAction || matchEventType || matchDetails || matchStatus || matchRole || matchIp;
    });
  }, [auditLogs, searchQuery, selectedScope, selectedRole, selectedStatus]);

  const totalMatches = filteredUsers.length + filteredTenants.length + filteredAuditLogs.length;
  const hasActiveFilters = searchQuery.trim() !== '' || selectedScope !== 'ALL' || selectedRole !== 'ALL' || selectedStatus !== 'ALL';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedScope('ALL');
    setSelectedRole('ALL');
    setSelectedStatus('ALL');
    setIsDropdownOpen(false);
  };

  const handleSelectTenant = (tenant: Tenant) => {
    storageService.setActiveContext({ tenantId: tenant.id });
    if (onNotifySuccess) {
      onNotifySuccess(`Switched Active Context to Enterprise Tenant: ${tenant.name} (${tenant.code})`);
    }
    setIsDropdownOpen(false);
  };

  const handleSelectUser = (user: AppUser) => {
    if (onFilterUsersTab) {
      onFilterUsersTab(user.loginId);
    }
    onNavigateToTab('users');
    setIsDropdownOpen(false);
  };

  const handleOpenAuditLog = (log: AuditEvent) => {
    setSelectedAuditLog(log);
    setIsDropdownOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search & Filter Bar Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs hover:border-[#123B5D]/40 transition-colors">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => {
                if (hasActiveFilters) setIsDropdownOpen(true);
              }}
              placeholder="Global Search: Search tenants, user accounts, roles, or system audit logs by name, status, action..."
              className="w-full pl-10 pr-24 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-[#172B3A] placeholder:text-slate-400 focus:outline-none focus:border-[#123B5D] focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-semibold">
                Ctrl+K
              </span>
            </div>
          </div>

          {/* Filter Controls Row */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            {/* Scope Filter */}
            <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-xl border border-slate-200 text-[11px] font-bold">
              {(['ALL', 'USERS', 'TENANTS', 'AUDIT_LOGS'] as EntityScope[]).map((scope) => (
                <button
                  key={scope}
                  onClick={() => {
                    setSelectedScope(scope);
                    setIsDropdownOpen(true);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg transition capitalize cursor-pointer ${
                    selectedScope === scope
                      ? 'bg-white text-[#123B5D] shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-[#123B5D]'
                  }`}
                >
                  {scope === 'ALL' ? 'All' : scope === 'USERS' ? 'Users' : scope === 'TENANTS' ? 'Tenants' : 'Audit Logs'}
                </button>
              ))}
            </div>

            {/* Role Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="bg-[#F8FAFC] text-slate-700 font-semibold text-xs border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-[#123B5D] cursor-pointer hover:bg-white transition"
              >
                <option value="ALL">Role: All Roles</option>
                <option value="PLATFORM_SUPER_ADMIN">Super Admin</option>
                <option value="TENANT_ADMIN">Tenant Admin</option>
                <option value="TENANT_SECURITY_ADMIN">Security Admin</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="SECURITY_GUARD">Security Guard</option>
                <option value="HOST_EMPLOYEE">Host Employee</option>
                <option value="COMPLIANCE_AUDITOR">Auditor</option>
                <option value="SITE_ADMIN">Site Admin</option>
              </select>
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as StatusFilter);
                  setIsDropdownOpen(true);
                }}
                className="bg-[#F8FAFC] text-slate-700 font-semibold text-xs border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-[#123B5D] cursor-pointer hover:bg-white transition"
              >
                <option value="ALL">Status: All</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUCCESS">Success (Audit)</option>
                <option value="DENIED">Denied (Audit)</option>
                <option value="FAILURE">Failure (Audit)</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Reset all search queries and filters"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Badges Bar (shown when filters applied) */}
        {hasActiveFilters && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Filter className="w-3 h-3 text-teal-600" />
                <span>Active Matches:</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-bold text-[11px]">
                {totalMatches} Found
              </span>

              {filteredUsers.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedScope('USERS');
                    setIsDropdownOpen(true);
                  }}
                  className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold hover:bg-blue-100 cursor-pointer"
                >
                  {filteredUsers.length} Users
                </button>
              )}

              {filteredTenants.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedScope('TENANTS');
                    setIsDropdownOpen(true);
                  }}
                  className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold hover:bg-emerald-100 cursor-pointer"
                >
                  {filteredTenants.length} Tenants
                </button>
              )}

              {filteredAuditLogs.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedScope('AUDIT_LOGS');
                    setIsDropdownOpen(true);
                  }}
                  className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-semibold hover:bg-purple-100 cursor-pointer"
                >
                  {filteredAuditLogs.length} Audit Logs
                </button>
              )}
            </div>

            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="text-xs font-bold text-[#123B5D] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{isDropdownOpen ? 'Hide Results' : 'View Results'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Live Search & Filter Results Panel */}
      {isDropdownOpen && hasActiveFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[520px] flex flex-col animate-fadeIn">
          {/* Panel Header */}
          <div className="bg-[#123B5D] text-white px-4 py-2.5 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span className="font-bold">
                Admin Global Search Results ({totalMatches} matches found)
              </span>
            </div>
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="text-slate-300 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Scrollable Body */}
          <div className="p-4 space-y-5 overflow-y-auto">
            {totalMatches === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-[#172B3A]">No matching administrative entities found</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No users, enterprise tenants, or system audit logs matched "{searchQuery}" with the current filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#123B5D] transition cursor-pointer"
                >
                  Clear Search & Filters
                </button>
              </div>
            ) : (
              <>
                {/* 1. USERS SECTION */}
                {filteredUsers.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wide">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>User Accounts ({filteredUsers.length})</span>
                      </div>
                      <button
                        onClick={() => {
                          if (onFilterUsersTab) onFilterUsersTab(searchQuery);
                          onNavigateToTab('users');
                          setIsDropdownOpen(false);
                        }}
                        className="text-[11px] font-bold text-[#123B5D] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Open in User Accounts Tab</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {filteredUsers.slice(0, 6).map((u) => (
                        <div
                          key={u.id}
                          onClick={() => handleSelectUser(u)}
                          className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#123B5D] text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {u.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-[#172B3A] truncate group-hover:text-blue-900">
                                {u.name}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono truncate">
                                ID: <strong className="text-slate-700">{u.loginId}</strong> • {u.departmentName}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                              {u.role.replace(/_/g, ' ')}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                u.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {u.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. TENANTS SECTION */}
                {filteredTenants.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wide">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span>Enterprise Tenants ({filteredTenants.length})</span>
                      </div>
                      <button
                        onClick={() => {
                          onNavigateToTab('tenants');
                          setIsDropdownOpen(false);
                        }}
                        className="text-[11px] font-bold text-[#123B5D] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Open in Tenants Tab</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {filteredTenants.map((t) => (
                        <div
                          key={t.id}
                          className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0"
                              style={{ backgroundColor: t.branding.primaryColor || '#123B5D' }}
                            >
                              {t.code.slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-[#172B3A] truncate">
                                {t.name}{' '}
                                <span className="font-mono text-[10px] text-slate-400">[{t.code}]</span>
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                Tier: <strong className="text-slate-700">{t.tier.replace(/_/g, ' ')}</strong>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {state.activeTenantId === t.id ? (
                              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Active</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSelectTenant(t)}
                                className="px-2.5 py-1 rounded-md bg-[#123B5D] hover:bg-[#0F766E] text-white text-[10px] font-bold transition cursor-pointer"
                              >
                                Switch Context
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. AUDIT LOGS SECTION */}
                {filteredAuditLogs.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 uppercase tracking-wide">
                        <ShieldAlert className="w-4 h-4 text-purple-600" />
                        <span>Security & System Audit Logs ({filteredAuditLogs.length})</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Click any event to inspect full forensic metadata
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {filteredAuditLogs.slice(0, 6).map((log) => (
                        <div
                          key={log.id}
                          onClick={() => handleOpenAuditLog(log)}
                          className="p-2.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                                log.status === 'SUCCESS'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.status === 'DENIED'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {log.status}
                            </span>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-[#172B3A] truncate group-hover:text-purple-900">
                                {log.details}
                              </div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-2">
                                <span className="font-bold text-slate-700">{log.actorName}</span>
                                <span>•</span>
                                <span className="font-mono text-slate-600">{log.action}</span>
                                <span>•</span>
                                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 ml-2">
                            <span className="text-[10px] font-bold text-purple-700 flex items-center gap-0.5 group-hover:underline">
                              <span>Inspect</span>
                              <ExternalLink className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Forensic Audit Log Details Modal */}
      {selectedAuditLog && (
        <AdminAuditLogModal
          log={selectedAuditLog}
          onClose={() => setSelectedAuditLog(null)}
        />
      )}
    </div>
  );
};
