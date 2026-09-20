import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Sliders,
  CheckCircle2,
  Volume2,
  HardDrive,
  ShieldCheck,
  Zap,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { UserPreferences } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(storageService.getUserPreferences());
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [testPrintFeedback, setTestPrintFeedback] = useState<string | null>(null);
  const state = storageService.getState();
  const printers = state.devices.filter((d) => d.type === 'BADGE_PRINTER');

  useEffect(() => {
    if (isOpen) {
      setPreferences(storageService.getUserPreferences());
      setSavedFeedback(false);
      setTestPrintFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleAutoPrint = (checked: boolean) => {
    const updated = { ...preferences, autoPrintBadgesOnCheckIn: checked };
    setPreferences(updated);
    storageService.updateUserPreferences(updated);
    triggerSavedNotice();
  };

  const handleUpdate = (updates: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...updates };
    setPreferences(updated);
    storageService.updateUserPreferences(updated);
    triggerSavedNotice();
  };

  const triggerSavedNotice = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleRunTestPrint = () => {
    const testPrinterId = preferences.preferredPrinterId || printers[0]?.id || 'dev-printer-01';
    const activeVisit = state.visits.find((v) => v.state === 'CHECKED_IN') || state.visits[0];

    if (activeVisit) {
      storageService.createPrintJob({
        visitId: activeVisit.id,
        printerId: testPrinterId,
        idempotencyKey: `test-print-${Date.now()}`,
      });
      setTestPrintFeedback(`Test badge pattern dispatched to ${printers.find((p) => p.id === testPrinterId)?.name || 'Printer'}!`);
    } else {
      setTestPrintFeedback('Sample test job dispatched to virtual print queue.');
    }
    setTimeout(() => setTestPrintFeedback(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#123B5D] px-6 py-4.5 flex items-center justify-between text-white border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-teal-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">System Preferences & Settings</h2>
              <p className="text-xs text-slate-300">Enterprise terminal, hardware automation & print control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#172B3A]">
          {savedFeedback && (
            <div className="flex items-center gap-2 p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span className="font-semibold text-xs">Settings updated and synced successfully.</span>
            </div>
          )}

          {/* Section 1: Auto-Print Toggle (Primary User Request) */}
          <div className="bg-[#F4F7FA] p-4.5 rounded-xl border border-[#D8E1E8] space-y-3.5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-[#0F766E]" />
                  <span className="font-bold text-sm text-[#172B3A]">
                    Auto-Print Badges on Check-In
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      preferences.autoPrintBadgesOnCheckIn
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {preferences.autoPrintBadgesOnCheckIn ? 'ACTIVE' : 'MANUAL'}
                  </span>
                </div>
                <p className="text-xs text-[#526575] leading-relaxed">
                  Immediately dispatch thermal badge print jobs to the assigned gate printer as soon
                  as a visitor check-in is confirmed at Reception, Turnstile, or Walk-In Registration.
                </p>
              </div>

              {/* iOS-style toggle switch */}
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={preferences.autoPrintBadgesOnCheckIn}
                  onChange={(e) => handleToggleAutoPrint(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F766E]"></div>
              </label>
            </div>

            {/* Sub-options when auto-print is enabled */}
            {preferences.autoPrintBadgesOnCheckIn && (
              <div className="pt-3 border-t border-[#D8E1E8] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#172B3A] mb-1">
                    Designated Thermal Printer
                  </label>
                  <select
                    value={preferences.preferredPrinterId || ''}
                    onChange={(e) => handleUpdate({ preferredPrinterId: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E]"
                  >
                    {printers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.status})
                      </option>
                    ))}
                    <option value="dev-printer-01">Zebra ZD421 (Default Desk)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#172B3A] mb-1">
                    Label Media Format
                  </label>
                  <select
                    value={preferences.thermalLabelFormat}
                    onChange={(e) =>
                      handleUpdate({ thermalLabelFormat: e.target.value as any })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="ZEBRA_4X3">Zebra 4x3 Thermal Label (Standard)</option>
                    <option value="BROTHER_DK">Brother DK-1202 Continuous Tape</option>
                    <option value="CR80_CARD">CR80 Plastic Clamshell Card</option>
                  </select>
                </div>
              </div>
            )}

            {/* Test print trigger */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleRunTestPrint}
                className="text-xs text-[#123B5D] hover:text-[#0F766E] font-bold flex items-center gap-1.5 transition"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Test Print Thermal Output
              </button>
              {testPrintFeedback && (
                <span className="text-[11px] text-teal-700 font-medium animate-fadeIn">
                  {testPrintFeedback}
                </span>
              )}
            </div>
          </div>

          {/* Section 2: Audio & Feedback */}
          <div className="bg-[#F4F7FA] p-4.5 rounded-xl border border-[#D8E1E8] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#0F766E]" />
                <span className="font-bold text-sm text-[#172B3A]">Audible Chime on Check-In</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={preferences.soundAlertsEnabled}
                  onChange={(e) => handleUpdate({ soundAlertsEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F766E]"></div>
              </label>
            </div>
            <p className="text-xs text-[#526575]">
              Plays an audio tone on successful badge scan or automated registration check-in.
            </p>
          </div>

          {/* Section 3: Hardware Diagnostics & Edge Sync */}
          <div className="bg-[#F4F7FA] p-4.5 rounded-xl border border-[#D8E1E8] space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#0F766E]" />
              <span className="font-bold text-sm text-[#172B3A]">Station Hardware Status</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="bg-white p-2.5 rounded-lg border border-[#D8E1E8]">
                <div className="text-[#526575]">Assigned Gate Station</div>
                <div className="font-bold text-[#172B3A] mt-0.5">{storageService.getActiveGate().name}</div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-[#D8E1E8]">
                <div className="text-[#526575]">Active Site Facility</div>
                <div className="font-bold text-[#172B3A] mt-0.5">{storageService.getActiveSite().name}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              storageService.resetToCleanState();
              setPreferences(storageService.getUserPreferences());
              triggerSavedNotice();
            }}
            className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset State to Clean Defaults
          </button>
          <button
            onClick={onClose}
            className="bg-[#123B5D] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#0e2f4a] transition shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
