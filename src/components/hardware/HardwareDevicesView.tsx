import React, { useState } from 'react';
import {
  Server,
  Printer,
  ScanLine,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Activity
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { HardwareDevice } from '../../types';

export const HardwareDevicesView: React.FC = () => {
  const state = storageService.getState();
  const [testingDeviceId, setTestingDeviceId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestDevice = (device: HardwareDevice) => {
    setTestingDeviceId(device.id);
    setTimeout(() => {
      setTestingDeviceId(null);
      setTestResult(`Ping test to ${device.name} (${device.ipAddress}): 2.4ms latency. Hardware handshake ACK.`);
      setTimeout(() => setTestResult(null), 3500);
    }, 1000);
  };

  const handleTestPrint = (device: HardwareDevice) => {
    setTestingDeviceId(device.id);
    setTimeout(() => {
      setTestingDeviceId(null);
      storageService.createPrintJob({
        visitId: state.visits[0]?.id || 'v-demo',
        printerId: device.id,
        idempotencyKey: `hw-test-${device.id}-${Date.now()}`,
      });
      setTestResult(`Test pattern dispatched to ${device.name}.`);
      setTimeout(() => setTestResult(null), 3500);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#D8E1E8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#0F766E]" />
            <h1 className="text-lg font-bold text-[#172B3A]">Edge Hardware & Peripheral Management</h1>
          </div>
          <p className="text-xs text-[#526575] mt-1">
            Zebra thermal printers, Honeywell 2D scanners, and Optical Turnstile Relays at each station.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border ${
              state.isEdgeOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            {state.isEdgeOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            Edge Link: {state.isEdgeOnline ? 'Online (Syncd)' : 'Offline (Buffer Mode)'}
          </span>
        </div>
      </div>

      {testResult && (
        <div className="p-3 bg-teal-50 border border-teal-300 text-teal-900 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>{testResult}</span>
        </div>
      )}

      {/* Hardware Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.devices.map((device) => (
          <div
            key={device.id}
            className="bg-white rounded-xl border border-[#D8E1E8] p-5 shadow-xs hover:border-slate-400 transition space-y-4 text-xs"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#F4F7FA] border border-[#D8E1E8] flex items-center justify-center text-[#123B5D]">
                  {device.type === 'BADGE_PRINTER' && <Printer className="w-5 h-5" />}
                  {device.type === 'QR_SCANNER' && <ScanLine className="w-5 h-5" />}
                  {device.type === 'EDGE_CONTROLLER' && <Server className="w-5 h-5" />}
                  {device.type === 'RECEPTION_KIOSK' && <Activity className="w-5 h-5" />}
                  {device.type === 'SECURITY_TERMINAL' && <Server className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#172B3A]">{device.name}</h3>
                  <p className="text-[11px] text-[#526575]">{device.model}</p>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  device.status === 'ONLINE'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                {device.status}
              </span>
            </div>

            <div className="bg-[#F4F7FA] p-3 rounded-lg border border-[#D8E1E8] space-y-1 text-[11px]">
              <div><span className="text-[#526575]">IP Address:</span> <span className="font-mono text-slate-900">{device.ipAddress}</span></div>
              <div><span className="text-[#526575]">Assigned Gate:</span> {state.gates.find((g) => g.id === device.gateId)?.name || 'Central'}</div>
              <div><span className="text-[#526575]">Last Heartbeat:</span> {new Date(device.lastHeartbeat).toLocaleTimeString()}</div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <button
                onClick={() => handleTestDevice(device)}
                disabled={testingDeviceId === device.id}
                className="flex-1 bg-[#F4F7FA] text-[#123B5D] border border-[#D8E1E8] py-1.5 rounded font-semibold hover:bg-slate-100 flex items-center justify-center gap-1"
              >
                <Activity className="w-3.5 h-3.5" />
                {testingDeviceId === device.id ? 'Testing...' : 'Test Connection'}
              </button>

              {device.type === 'BADGE_PRINTER' && (
                <button
                  onClick={() => handleTestPrint(device)}
                  className="bg-[#123B5D] text-white px-3 py-1.5 rounded font-semibold hover:bg-[#0e2f4a]"
                >
                  Print Test Label
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edge Sync Buffer Section */}
      <div className="bg-white rounded-xl border border-[#D8E1E8] shadow-xs p-5 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#172B3A]">Offline Edge Sync Queue</h2>
            <p className="text-xs text-[#526575]">
              Local SQLite / browser-persisted sync events queued during facility internet outages.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-800 px-2.5 py-1 rounded">
            {state.edgeSyncEvents.length} Buffered Events
          </span>
        </div>

        {state.edgeSyncEvents.length === 0 ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All edge gates are synchronized with cloud multi-tenant database. No pending items.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {state.edgeSyncEvents.map((evt) => (
              <div key={evt.id} className="p-2.5 rounded bg-[#F4F7FA] border border-[#D8E1E8] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#172B3A]">{evt.eventType}</span>
                  <span className="text-[11px] text-[#526575] ml-2">ID: {evt.id}</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                  {evt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
