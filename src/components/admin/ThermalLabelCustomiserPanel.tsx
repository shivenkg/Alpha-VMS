import React from 'react';
import {
  Printer,
  Flame,
  Gauge,
  Scissors,
  Zap,
  FileCode,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface ThermalLabelCustomiserPanelProps {
  printerBrand: 'ZEBRA' | 'BROTHER' | 'DYMO' | 'TSC';
  onChangePrinterBrand: (brand: 'ZEBRA' | 'BROTHER' | 'DYMO' | 'TSC') => void;
  darknessLevel: number;
  onChangeDarknessLevel: (darkness: number) => void;
  printSpeedIps: number;
  onChangePrintSpeedIps: (speed: number) => void;
  cutterMode: 'TEAR_OFF' | 'AUTO_CUT' | 'PEEL_SENSOR';
  onChangeCutterMode: (mode: 'TEAR_OFF' | 'AUTO_CUT' | 'PEEL_SENSOR') => void;
  resolutionDpi: 203 | 300;
  onChangeResolutionDpi: (dpi: 203 | 300) => void;
  monochromeDither: boolean;
  onToggleMonochromeDither: (val: boolean) => void;
  selfExpiringVoidPreview: boolean;
  onToggleSelfExpiringVoidPreview: (val: boolean) => void;
  onApplyThermalPreset: (preset: {
    brand: 'ZEBRA' | 'BROTHER' | 'DYMO' | 'TSC';
    widthMm: number;
    heightMm: number;
    darkness: number;
    speed: number;
    cutter: 'TEAR_OFF' | 'AUTO_CUT' | 'PEEL_SENSOR';
    dpi: 203 | 300;
    label: string;
  }) => void;
  onOpenZplModal: () => void;
  onTestThermalPrint: () => void;
  isTestPrinting: boolean;
}

const THERMAL_ROLL_PRESETS = [
  {
    label: 'Zebra 4" × 3" Die-Cut Adhesive (Z-Select 4000D)',
    brand: 'ZEBRA' as const,
    widthMm: 101.6,
    heightMm: 76.2,
    darkness: 10,
    speed: 4,
    cutter: 'TEAR_OFF' as const,
    dpi: 203 as const,
  },
  {
    label: 'Brother 2.4" Continuous Adhesive (DK-22205)',
    brand: 'BROTHER' as const,
    widthMm: 62.0,
    heightMm: 100.0,
    darkness: 8,
    speed: 6,
    cutter: 'AUTO_CUT' as const,
    dpi: 300 as const,
  },
  {
    label: 'Dymo 2-1/4" × 4" Name Badge Label (30256)',
    brand: 'DYMO' as const,
    widthMm: 101.6,
    heightMm: 57.0,
    darkness: 9,
    speed: 4,
    cutter: 'TEAR_OFF' as const,
    dpi: 300 as const,
  },
  {
    label: 'TSC 4" × 2" Fast Lapel Gate Pass (Direct Thermal)',
    brand: 'TSC' as const,
    widthMm: 101.6,
    heightMm: 50.8,
    darkness: 11,
    speed: 5,
    cutter: 'PEEL_SENSOR' as const,
    dpi: 203 as const,
  },
];

export const ThermalLabelCustomiserPanel: React.FC<ThermalLabelCustomiserPanelProps> = ({
  printerBrand,
  onChangePrinterBrand,
  darknessLevel,
  onChangeDarknessLevel,
  printSpeedIps,
  onChangePrintSpeedIps,
  cutterMode,
  onChangeCutterMode,
  resolutionDpi,
  onChangeResolutionDpi,
  monochromeDither,
  onToggleMonochromeDither,
  selfExpiringVoidPreview,
  onToggleSelfExpiringVoidPreview,
  onApplyThermalPreset,
  onOpenZplModal,
  onTestThermalPrint,
  isTestPrinting,
}) => {
  return (
    <div className="space-y-5">
      {/* Quick Roll Preset Selectors */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#172B3A] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Standard Industrial Thermal Media Profiles:</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">1-Click Auto Config</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {THERMAL_ROLL_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onApplyThermalPreset(preset)}
              className="text-left px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 text-xs transition cursor-pointer shadow-2xs group"
            >
              <div className="font-bold text-[#123B5D] group-hover:text-teal-900 leading-tight">
                {preset.label}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {preset.brand} • {preset.widthMm} × {preset.heightMm} mm • {preset.dpi} DPI
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: Printer Hardware & Communication Protocol */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Printer className="w-3.5 h-3.5 text-teal-600" />
          <span>1. Direct Thermal Hardware Target & Protocol</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(
            [
              { id: 'ZEBRA', name: 'Zebra Technologies', desc: 'ZPL II / CPCL Engine', model: 'ZD421 / ZD620' },
              { id: 'BROTHER', name: 'Brother P-Touch', desc: 'ESC/P Raster Engine', model: 'QL-820NWB' },
              { id: 'DYMO', name: 'Dymo LabelWriter', desc: 'Dymo Direct SDK', model: 'LW 550 / 450' },
              { id: 'TSC', name: 'TSC Auto ID', desc: 'TSPL / EPL Emulation', model: 'TE200 / DA220' },
            ] as const
          ).map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => onChangePrinterBrand(b.id)}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                printerBrand === b.id
                  ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600/30'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-[#172B3A]">{b.name}</div>
              <div className="text-[10px] font-mono text-teal-700 font-semibold mt-0.5">{b.desc}</div>
              <div className="text-[9px] text-slate-400 mt-1">{b.model}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#172B3A] mb-1">Printhead Resolution</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="dpi"
                  checked={resolutionDpi === 203}
                  onChange={() => onChangeResolutionDpi(203)}
                  className="text-teal-700 focus:ring-teal-600"
                />
                <span>203 DPI (8 dots/mm - Standard Turnstile)</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="dpi"
                  checked={resolutionDpi === 300}
                  onChange={() => onChangeResolutionDpi(300)}
                  className="text-teal-700 focus:ring-teal-600"
                />
                <span>300 DPI (11.8 dots/mm - Micro QR)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B3A] mb-1">Cutter & Media Feed Mode</label>
            <select
              value={cutterMode}
              onChange={(e) => onChangeCutterMode(e.target.value as any)}
              className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="TEAR_OFF">Manual Serrated Tear-Off Bar</option>
              <option value="AUTO_CUT">Automatic Guillotine Cutter (After each badge)</option>
              <option value="PEEL_SENSOR">Peel-and-Present Optical Take-Up Sensor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Heat Burn Darkness & Thermal Motor Speed */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-600" />
          <span>2. Thermal Burn Darkness & Printhead Energy Control</span>
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#172B3A]">Heat Burn Density (Burn Time / Energy):</span>
            <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Level {darknessLevel} / 15 {darknessLevel >= 12 ? '(High Energy Burn)' : darknessLevel <= 5 ? '(Eco Light)' : '(Standard Contrast)'}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            step="1"
            value={darknessLevel}
            onChange={(e) => onChangeDarknessLevel(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>1 (Ultra-Light Draft)</span>
            <span>7 (Balanced Direct)</span>
            <span>15 (Deep Heavy Burn)</span>
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-bold text-[#172B3A] mb-1">Print Speed (Inches Per Second):</label>
          <div className="flex items-center gap-2">
            {[2, 3, 4, 5, 6].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => onChangePrintSpeedIps(spd)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  printSpeedIps === spd
                    ? 'bg-[#123B5D] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {spd} IPS
              </button>
            ))}
            <span className="text-[11px] text-slate-500 ml-2">
              (Lower speed produces sharper micro-barcodes)
            </span>
          </div>
        </div>
      </div>

      {/* Section 3: Visual Thermal Emulation & Chemical VOID Simulation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-teal-600" />
          <span>3. Real-Time Hardware Emulation Toggles</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={monochromeDither}
              onChange={(e) => onToggleMonochromeDither(e.target.checked)}
              className="mt-0.5 rounded text-teal-700 focus:ring-teal-600 h-4 w-4"
            />
            <div>
              <span className="text-xs font-bold text-[#172B3A] block">
                1-Bit High-Contrast Monochrome
              </span>
              <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                Simulates exact grayscale thermal burn without colors as printed by direct thermal heads.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={selfExpiringVoidPreview}
              onChange={(e) => onToggleSelfExpiringVoidPreview(e.target.checked)}
              className="mt-0.5 rounded text-red-700 focus:ring-red-600 h-4 w-4"
            />
            <div>
              <span className="text-xs font-bold text-[#172B3A] block">
                Self-Expiring Chemical VOID Bloom
              </span>
              <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                Previews the red crosshatch and VOID watermark that surfaces on thermal paper after 12-24 hours.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Action Strip: Test Thermal Print & Raw Code Inspector */}
      <div className="bg-gradient-to-r from-slate-900 to-[#123B5D] rounded-xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div>
          <div className="text-xs font-bold flex items-center gap-1.5 text-teal-300">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Thermal Edge Print Diagnostics</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Dispatch test job to network print queue or inspect generated printer commands.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenZplModal}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-teal-300" />
            <span>View ZPL / ESC-P</span>
          </button>

          <button
            type="button"
            onClick={onTestThermalPrint}
            disabled={isTestPrinting}
            className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#0b2438] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-60"
          >
            {isTestPrinting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#0b2438] border-t-transparent rounded-full animate-spin" />
                <span>Spooling Job...</span>
              </>
            ) : (
              <>
                <Printer className="w-3.5 h-3.5" />
                <span>Test Thermal Print</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
