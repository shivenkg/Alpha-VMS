import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Layers,
  Columns,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { storageService } from '../../services/storageService';

export const AnalyticsView: React.FC = () => {
  const state = storageService.getState();
  const [purgeFeedback, setPurgeFeedback] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<'grouped' | 'stacked'>('grouped');
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>('ALL');

  const totalVisits = state.visits.length;
  const ndaSignedCount = state.visitors.filter((v) => v.ndaSigned).length;
  const ndaPercentage = Math.round((ndaSignedCount / (state.visitors.length || 1)) * 100);

  const categoryBreakdown = [
    { label: 'Business Guests', count: state.visits.filter((v) => v.visitorCategory === 'BUSINESS_GUEST').length, color: 'bg-teal-600' },
    { label: 'Contractors', count: state.visits.filter((v) => v.visitorCategory === 'CONTRACTOR').length, color: 'bg-blue-600' },
    { label: 'VIP Executives', count: state.visits.filter((v) => v.visitorCategory === 'VIP_EXECUTIVE').length, color: 'bg-amber-600' },
    { label: 'Auditors & Regulators', count: state.visits.filter((v) => v.visitorCategory === 'REGULATORY_AUDITOR').length, color: 'bg-purple-600' },
    { label: 'Facility Maintenance', count: state.visits.filter((v) => v.visitorCategory === 'FACILITY_MAINTENANCE').length, color: 'bg-emerald-600' },
  ];

  // Tenants info
  const tenantsConfig = [
    { id: 'ten-tata-01', key: 'tata', name: 'Tata Consultancy & Advanced Systems', code: 'TATA', color: '#123B5D' },
    { id: 'ten-reliance-02', key: 'rjio', name: 'Reliance Jio Digital Infocomm', code: 'RJIO', color: '#0F766E' },
    { id: 'ten-infosys-03', key: 'infy', name: 'Infosys NextGen Digital Campus', code: 'INFY', color: '#EA580C' },
  ];

  // Monthly trends data across tenants (past 6 months)
  const monthlyTenantData = useMemo(() => {
    // Current live visits in state per tenant
    const liveTata = state.visits.filter((v) => v.tenantId === 'ten-tata-01').length;
    const liveRjio = state.visits.filter((v) => v.tenantId === 'ten-reliance-02').length;
    const liveInfy = state.visits.filter((v) => v.tenantId === 'ten-infosys-03').length;

    return [
      {
        month: 'Apr 2026',
        tata: 135,
        rjio: 78,
        infy: 94,
        total: 307,
      },
      {
        month: 'May 2026',
        tata: 154,
        rjio: 92,
        infy: 118,
        total: 364,
      },
      {
        month: 'Jun 2026',
        tata: 178,
        rjio: 110,
        infy: 136,
        total: 424,
      },
      {
        month: 'Jul 2026',
        tata: 165,
        rjio: 124,
        infy: 148,
        total: 437,
      },
      {
        month: 'Aug 2026',
        tata: 198,
        rjio: 138,
        infy: 162,
        total: 498,
      },
      {
        month: 'Sep 2026 (Current)',
        tata: 215 + liveTata,
        rjio: 142 + liveRjio,
        infy: 180 + liveInfy,
        total: 537 + liveTata + liveRjio + liveInfy,
      },
    ];
  }, [state.visits]);

  // Calculations for quick trend statistics
  const currentMonthData = monthlyTenantData[monthlyTenantData.length - 1];
  const previousMonthData = monthlyTenantData[monthlyTenantData.length - 2];
  const totalVolumeGrowth = Math.round(
    ((currentMonthData.total - previousMonthData.total) / previousMonthData.total) * 100
  );

  const handleSimulatePurge = () => {
    if (window.confirm('Simulate automated 90-day GDPR/CCPA data retention purge on expired temporary visit logs?')) {
      setPurgeFeedback('Purge executed: 0 legacy expired records purged. All current records within valid 90-day retention window.');
      setTimeout(() => setPurgeFeedback(null), 4000);
    }
  };

  // Custom chart tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const monthTotal = payload.reduce((acc: number, curr: any) => acc + (curr.value || 0), 0);
      return (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xl text-xs space-y-2 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 font-bold text-[#172B3A]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              {label}
            </span>
            <span className="text-[#0F766E] font-mono">{monthTotal} Total</span>
          </div>

          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => {
              const share = monthTotal > 0 ? Math.round((entry.value / monthTotal) * 100) : 0;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-700 font-medium truncate max-w-[120px]">
                      {entry.name}
                    </span>
                  </div>
                  <div className="font-mono text-[#172B3A] flex items-center gap-1">
                    <span className="font-bold">{entry.value}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({share}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#D8E1E8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0F766E]" />
            <h1 className="text-lg font-bold text-[#172B3A]">Visitor Analytics & Compliance Intelligence</h1>
          </div>
          <p className="text-xs text-[#526575] mt-1">
            Real-time throughput metrics, cross-tenant monthly volume trends, and statutory retention audits.
          </p>
        </div>

        <button
          onClick={handleSimulatePurge}
          className="bg-[#F4F7FA] text-red-700 border border-red-200 hover:bg-red-50 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Test Retention Purge Job
        </button>
      </div>

      {purgeFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{purgeFeedback}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#D8E1E8] shadow-xs">
          <span className="text-xs text-[#526575] font-medium">Total Registered Visits</span>
          <div className="mt-2 text-2xl font-bold text-[#172B3A]">{totalVisits}</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Across all facilities</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8E1E8] shadow-xs">
          <span className="text-xs text-[#526575] font-medium">NDA Compliance Rate</span>
          <div className="mt-2 text-2xl font-bold text-teal-700">{ndaPercentage}%</div>
          <p className="text-[11px] text-[#526575] mt-1">Legal execution rate</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8E1E8] shadow-xs">
          <span className="text-xs text-[#526575] font-medium">MoM Traffic Growth</span>
          <div className="mt-2 text-2xl font-bold text-emerald-700">+{totalVolumeGrowth}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Month-over-month trajectory</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8E1E8] shadow-xs">
          <span className="text-xs text-[#526575] font-medium">Active Enterprise Tenants</span>
          <div className="mt-2 text-2xl font-bold text-[#123B5D]">3 Tenants</div>
          <p className="text-[11px] text-[#526575] mt-1">Tata, Reliance Jio, Infosys</p>
        </div>
      </div>

      {/* FEATURED: Multi-Tenant Monthly Visitor Volume Bar Chart */}
      <div className="bg-white rounded-xl border border-[#D8E1E8] shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0F766E]" />
              <h2 className="text-sm font-bold text-[#172B3A]">
                Enterprise Tenant Visitor Volume Trends (Monthly)
              </h2>
            </div>
            <p className="text-xs text-[#526575] mt-0.5">
              Monthly guest check-in velocity and capacity consumption across multi-tenant enterprise accounts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tenant Filter Selector */}
            <div className="flex items-center bg-[#F4F7FA] p-0.5 rounded-lg border border-[#D8E1E8] text-xs">
              <button
                onClick={() => setSelectedTenantFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  selectedTenantFilter === 'ALL'
                    ? 'bg-white text-[#123B5D] shadow-2xs'
                    : 'text-slate-600 hover:text-[#172B3A]'
                }`}
              >
                All Tenants
              </button>
              {tenantsConfig.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTenantFilter(t.key)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1.5 ${
                    selectedTenantFilter === t.key
                      ? 'bg-white text-[#123B5D] shadow-2xs'
                      : 'text-slate-600 hover:text-[#172B3A]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  {t.code}
                </button>
              ))}
            </div>

            {/* Grouped vs Stacked Toggle */}
            <div className="flex items-center bg-[#F4F7FA] p-0.5 rounded-lg border border-[#D8E1E8] text-xs">
              <button
                onClick={() => setChartMode('grouped')}
                className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition ${
                  chartMode === 'grouped'
                    ? 'bg-white text-[#123B5D] shadow-2xs'
                    : 'text-slate-600 hover:text-[#172B3A]'
                }`}
                title="Grouped Side-by-Side"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Grouped</span>
              </button>
              <button
                onClick={() => setChartMode('stacked')}
                className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition ${
                  chartMode === 'stacked'
                    ? 'bg-white text-[#123B5D] shadow-2xs'
                    : 'text-slate-600 hover:text-[#172B3A]'
                }`}
                title="Stacked Cumulative"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Stacked</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Bar Chart Container */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyTenantData}
              margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
                tickFormatter={(val) => `${val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />

              {/* Bars per tenant based on filter */}
              {(selectedTenantFilter === 'ALL' || selectedTenantFilter === 'tata') && (
                <Bar
                  dataKey="tata"
                  name="Tata Consultancy & Adv Systems"
                  fill="#123B5D"
                  stackId={chartMode === 'stacked' ? 'a' : undefined}
                  radius={chartMode === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                />
              )}
              {(selectedTenantFilter === 'ALL' || selectedTenantFilter === 'rjio') && (
                <Bar
                  dataKey="rjio"
                  name="Reliance Jio Digital Infocomm"
                  fill="#0F766E"
                  stackId={chartMode === 'stacked' ? 'a' : undefined}
                  radius={chartMode === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                />
              )}
              {(selectedTenantFilter === 'ALL' || selectedTenantFilter === 'infy') && (
                <Bar
                  dataKey="infy"
                  name="Infosys NextGen Digital Campus"
                  fill="#EA580C"
                  stackId={chartMode === 'stacked' ? 'a' : undefined}
                  radius={chartMode === 'stacked' ? [4, 4, 0, 0] : [4, 4, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tenant Performance Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="p-3 bg-[#F4F7FA] rounded-xl border border-[#D8E1E8] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-medium">Tata Consultancy & Adv Systems</span>
              <div className="text-base font-bold text-[#123B5D]">{currentMonthData.tata} visits</div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Leader (39.5%)
            </span>
          </div>

          <div className="p-3 bg-[#F4F7FA] rounded-xl border border-[#D8E1E8] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-medium">Reliance Jio Digital Infocomm</span>
              <div className="text-base font-bold text-[#0F766E]">{currentMonthData.rjio} visits</div>
            </div>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              +12.4% MoM
            </span>
          </div>

          <div className="p-3 bg-[#F4F7FA] rounded-xl border border-[#D8E1E8] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-medium">Infosys NextGen Digital Campus</span>
              <div className="text-base font-bold text-[#EA580C]">{currentMonthData.infy} visits</div>
            </div>
            <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              Fastest (+14.8%)
            </span>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Compliance Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#D8E1E8] shadow-xs p-5 space-y-4 text-xs">
          <h2 className="font-bold text-[#172B3A] text-sm">Visitor Volume by Classification</h2>
          <div className="space-y-3">
            {categoryBreakdown.map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-[#172B3A]">{cat.label}</span>
                  <span className="text-[#526575]">{cat.count} visits</span>
                </div>
                <div className="w-full bg-[#F4F7FA] h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`${cat.color} h-full rounded-full`}
                    style={{ width: `${Math.max(12, (cat.count / (totalVisits || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D8E1E8] shadow-xs p-5 space-y-4 text-xs">
          <h2 className="font-bold text-[#172B3A] text-sm">Statutory Compliance & Security Posture</h2>
          <div className="space-y-3">
            <div className="p-3 bg-[#F4F7FA] rounded-lg border border-[#D8E1E8] flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#172B3A]">GDPR & CCPA Data Retention Rule</div>
                <p className="text-[11px] text-[#526575]">Automatic redaction of PII after 90 days of visit conclusion.</p>
              </div>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ACTIVE
              </span>
            </div>

            <div className="p-3 bg-[#F4F7FA] rounded-lg border border-[#D8E1E8] flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#172B3A]">Government ID Document Masking</div>
                <p className="text-[11px] text-[#526575]">Zero cleartext ID numbers persisted to client logs.</p>
              </div>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ENFORCED
              </span>
            </div>

            <div className="p-3 bg-[#F4F7FA] rounded-lg border border-[#D8E1E8] flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#172B3A]">Offline Gate Buffer Replay</div>
                <p className="text-[11px] text-[#526575]">Idempotent sync events ensure zero loss during outages.</p>
              </div>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                SYNCHRONIZED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
