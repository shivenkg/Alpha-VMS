import React, { useState } from 'react';
import {
  Code2,
  Database,
  BookOpen,
  FileCode,
  Check,
  Copy,
  Play,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { ADR_RECORDS, POSTGRESQL_DDL_SCHEMA, ADR } from '../../data/architectureDocs';
import { API_CATALOG, executeMockApiCall, ApiEndpointDef } from '../../services/apiClient';

export const ArchitectureDocsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'adrs' | 'api' | 'ddl'>('adrs');
  const [copiedDdl, setCopiedDdl] = useState(false);
  const [apiRunnerResult, setApiRunnerResult] = useState<any | null>(null);
  const [executingEndpoint, setExecutingEndpoint] = useState<string | null>(null);

  const handleCopyDdl = () => {
    navigator.clipboard.writeText(POSTGRESQL_DDL_SCHEMA);
    setCopiedDdl(true);
    setTimeout(() => setCopiedDdl(false), 2000);
  };

  const handleExecuteApi = async (endpoint: ApiEndpointDef) => {
    setExecutingEndpoint(endpoint.path);
    setApiRunnerResult({ status: 'calling', message: `Dispatching ${endpoint.method} ${endpoint.path}...` });

    const result = await executeMockApiCall(endpoint);
    setExecutingEndpoint(null);
    setApiRunnerResult(result);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#D8E1E8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#0F766E]" />
            <h1 className="text-lg font-bold text-[#172B3A]">Architecture Documentation & API Catalog</h1>
          </div>
          <p className="text-xs text-[#526575] mt-1">
            Enterprise Architecture Decision Records (ADRs), OpenAPI 3.1 REST specifications, and PostgreSQL DDL schema.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#F4F7FA] p-1 rounded-lg border border-[#D8E1E8] text-xs">
          <button
            onClick={() => setActiveTab('adrs')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'adrs'
                ? 'bg-[#123B5D] text-white shadow-xs'
                : 'text-[#526575] hover:text-[#172B3A]'
            }`}
          >
            ADRs (Decisions)
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'api'
                ? 'bg-[#123B5D] text-white shadow-xs'
                : 'text-[#526575] hover:text-[#172B3A]'
            }`}
          >
            OpenAPI 3.1 Catalog
          </button>
          <button
            onClick={() => setActiveTab('ddl')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'ddl'
                ? 'bg-[#123B5D] text-white shadow-xs'
                : 'text-[#526575] hover:text-[#172B3A]'
            }`}
          >
            PostgreSQL DDL
          </button>
        </div>
      </div>

      {/* Tab 1: ADRs */}
      {activeTab === 'adrs' && (
        <div className="space-y-4">
          {ADR_RECORDS.map((adr: ADR) => (
            <div
              key={adr.id}
              className="bg-white rounded-xl border border-[#D8E1E8] shadow-xs p-6 space-y-4 text-xs"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {adr.id}
                    </span>
                    <h2 className="font-bold text-sm text-[#172B3A]">{adr.title}</h2>
                  </div>
                  <p className="text-[11px] text-[#526575] mt-1">Date: {adr.date}</p>
                </div>

                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded border border-emerald-300">
                  {adr.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-[#172B3A] mb-1">Context:</h3>
                <p className="text-[#526575] leading-relaxed">{adr.context}</p>
              </div>

              <div className="bg-[#F4F7FA] p-3 rounded-lg border border-[#D8E1E8]">
                <h3 className="font-bold text-[#123B5D] mb-1">Architecture Decision:</h3>
                <p className="text-slate-800 leading-relaxed">{adr.decision}</p>
              </div>

              <div>
                <h3 className="font-bold text-[#172B3A] mb-1.5">Consequences & Operational Tradeoffs:</h3>
                <ul className="list-disc pl-5 space-y-1 text-[#526575]">
                  {adr.consequences.map((c: string, i: number) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: OpenAPI 3.1 Interactive Runner */}
      {activeTab === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          {/* Endpoints List (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <h2 className="font-bold text-[#172B3A] text-sm">OpenAPI 3.1 Specifications</h2>
            {API_CATALOG.map((ep: ApiEndpointDef, idx: number) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-[#D8E1E8] shadow-xs p-4 space-y-3 hover:border-slate-400 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded ${
                        ep.method === 'GET'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono font-semibold text-slate-800">{ep.path}</span>
                  </div>

                  <button
                    onClick={() => handleExecuteApi(ep)}
                    className="bg-[#123B5D] text-white px-3 py-1 rounded text-xs font-semibold hover:bg-[#0e2f4a] flex items-center gap-1 transition"
                  >
                    <Play className="w-3 h-3" />
                    Try Out
                  </button>
                </div>

                <p className="text-[#526575]">{ep.description}</p>

                <div className="text-[11px] text-slate-600 bg-[#F4F7FA] p-2 rounded">
                  <span className="font-bold text-slate-800">RBAC Role Required:</span>{' '}
                  <span className="font-mono">{ep.requiredRole}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Live API Runner Output (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="font-bold text-[#172B3A] text-sm">Live Response Inspector</h2>
            <div className="bg-[#172B3A] text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto min-h-[350px] shadow-inner">
              {apiRunnerResult ? (
                <div>
                  <div className="text-slate-400 mb-2 border-b border-slate-700 pb-1">
                    HTTP/1.1 {apiRunnerResult.status || 200} OK • Content-Type: application/json
                  </div>
                  <pre>{JSON.stringify(apiRunnerResult, null, 2)}</pre>
                </div>
              ) : (
                <div className="text-slate-400 italic py-16 text-center">
                  Click "Try Out" on any endpoint on the left to execute in-memory OpenAPI contract.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: PostgreSQL Schema DDL */}
      {activeTab === 'ddl' && (
        <div className="bg-white rounded-xl border border-[#D8E1E8] shadow-xs p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="font-bold text-[#172B3A] text-sm">PostgreSQL Production DDL Schema</h2>
              <p className="text-[11px] text-[#526575]">
                Includes Multi-Tenant RLS policies, indexed foreign keys, audit logs, and UUID PKs.
              </p>
            </div>

            <button
              onClick={handleCopyDdl}
              className="bg-[#123B5D] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#0e2f4a] flex items-center gap-1.5 transition shadow-xs"
            >
              {copiedDdl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedDdl ? 'Copied DDL!' : 'Copy Schema SQL'}
            </button>
          </div>

          <div className="bg-[#172B3A] text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[500px]">
            <pre>{POSTGRESQL_DDL_SCHEMA}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
