import React, { useState } from 'react';
import {
  CreditCard,
  Palette,
  Sparkles,
  Printer,
  Save,
  CheckCircle2,
  RefreshCw,
  Eye,
  RotateCw,
  QrCode,
  User,
  Shield,
  Clock,
  AlertTriangle,
  Building,
  FileText,
  Sliders,
  Check,
  Smartphone,
  Flame,
  Scissors,
  Layers,
  FileCode,
  Zap,
  Gauge
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { BadgeTemplate } from '../../types';
import { ThermalLabelCustomiserPanel } from './ThermalLabelCustomiserPanel';
import { ZplCodeStreamModal } from './ZplCodeStreamModal';

interface VisitorPassDesignerTabProps {
  onSuccessToast?: (msg: string) => void;
}

const PRESET_TEMPLATES: Partial<BadgeTemplate>[] = [
  {
    name: 'Executive Boardroom VIP Pass (CR-80 PVC)',
    type: 'CR80_CARD',
    widthMm: 85.6,
    heightMm: 53.98,
    badgeLayoutOrientation: 'LANDSCAPE',
    showPhoto: true,
    showQrCode: true,
    showBarcode: true,
    showHost: true,
    showCategoryColor: true,
    showHeaderLogo: true,
    showMusterPoint: true,
    showExpiryTime: true,
    headerBackground: '#0F766E',
    headerTextColor: '#FFFFFF',
    watermarkText: 'VIP EXECUTIVE CLEARANCE',
    instructions: 'Priority escort & executive lounge access. Return to front reception upon exit.',
    backsideDisclaimer: 'TATA ENTERPRISE SECURITY POLICY: This credential remains corporate property and must be surrendered upon departure. Non-transferable.',
  },
  {
    name: 'Standard Facility Day Pass (Adhesive Thermal)',
    type: 'ADHESIVE_LABEL',
    widthMm: 101.6,
    heightMm: 76.2,
    badgeLayoutOrientation: 'PORTRAIT',
    showPhoto: true,
    showQrCode: true,
    showBarcode: true,
    showHost: true,
    showCategoryColor: true,
    showHeaderLogo: true,
    showMusterPoint: true,
    showExpiryTime: true,
    headerBackground: '#123B5D',
    headerTextColor: '#FFFFFF',
    watermarkText: 'DAY VISITOR',
    instructions: 'Must be visibly affixed above the waist at all times while on premises.',
    backsideDisclaimer: 'Self-voiding badge expires at 23:59 on the day of issuance.',
  },
  {
    name: 'Contractor & Vendor Safety Pass (High-Vis)',
    type: 'ADHESIVE_LABEL',
    widthMm: 101.6,
    heightMm: 76.2,
    badgeLayoutOrientation: 'PORTRAIT',
    showPhoto: true,
    showQrCode: true,
    showBarcode: true,
    showHost: true,
    showCategoryColor: true,
    showHeaderLogo: true,
    showMusterPoint: true,
    showExpiryTime: true,
    headerBackground: '#B45309',
    headerTextColor: '#FFFFFF',
    watermarkText: 'ESCORT MANDATORY',
    instructions: 'HARD HAT & SAFETY GLASSES MANDATORY. Not permitted in unauthorized sub-zones.',
    backsideDisclaimer: 'Contractor must be accompanied by authorized site escort in all yellow-tier zones.',
  },
  {
    name: 'Conference & Event Lanyard Badge',
    type: 'CONFERENCE_PASS',
    widthMm: 90,
    heightMm: 130,
    badgeLayoutOrientation: 'PORTRAIT',
    showPhoto: true,
    showQrCode: true,
    showBarcode: false,
    showHost: true,
    showCategoryColor: true,
    showHeaderLogo: true,
    showMusterPoint: false,
    showExpiryTime: true,
    headerBackground: '#4338CA',
    headerTextColor: '#FFFFFF',
    watermarkText: 'EVENT ACCESS',
    instructions: 'Valid for all keynote auditoriums, breakout sessions, and designated networking dining halls.',
    backsideDisclaimer: 'Please scan QR code at workshop doors for attendance tracking and lunch entry.',
  },
];

const COLOR_PRESETS = [
  { label: 'Tata Navy', hex: '#123B5D' },
  { label: 'Enterprise Teal', hex: '#0F766E' },
  { label: 'Hazard Amber', hex: '#B45309' },
  { label: 'Security Crimson', hex: '#991B1B' },
  { label: 'Executive Slate', hex: '#1E293B' },
  { label: 'Keynote Indigo', hex: '#4338CA' },
  { label: 'Emerald Green', hex: '#065F46' },
];

export const VisitorPassDesignerTab: React.FC<VisitorPassDesignerTabProps> = ({ onSuccessToast }) => {
  const templates = storageService.getBadgeTemplates();
  const activeTenant = storageService.getActiveTenant();
  const activeSite = storageService.getActiveSite();

  // Mode Switcher: Pass Format Designer vs Thermal Label Customiser
  const [studioMode, setStudioMode] = useState<'PASS_FORMAT' | 'THERMAL_LABEL'>('PASS_FORMAT');

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || 'tmpl-cr80-01');
  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Current editing state
  const [templateName, setTemplateName] = useState(activeTemplate?.name || 'Standard Pass');
  const [passType, setPassType] = useState<BadgeTemplate['type']>(activeTemplate?.type || 'CR80_CARD');
  const [widthMm, setWidthMm] = useState(activeTemplate?.widthMm || 85.6);
  const [heightMm, setHeightMm] = useState(activeTemplate?.heightMm || 53.98);
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>(
    activeTemplate?.badgeLayoutOrientation || (activeTemplate?.widthMm > activeTemplate?.heightMm ? 'LANDSCAPE' : 'PORTRAIT')
  );
  const [headerBackground, setHeaderBackground] = useState(activeTemplate?.headerBackground || '#123B5D');
  const [headerTextColor, setHeaderTextColor] = useState(activeTemplate?.headerTextColor || '#FFFFFF');
  const [watermarkText, setWatermarkText] = useState(activeTemplate?.watermarkText || 'OFFICIAL VISITOR');
  const [instructions, setInstructions] = useState(
    activeTemplate?.instructions || 'Must be visibly worn at all times above the waist.'
  );
  const [backsideDisclaimer, setBacksideDisclaimer] = useState(
    activeTemplate?.backsideDisclaimer ||
      'Property of enterprise facilities. Return to turnstile desk upon departure. Call security at ext. 4400 for assistance.'
  );

  // Feature Toggles
  const [showPhoto, setShowPhoto] = useState(activeTemplate?.showPhoto ?? true);
  const [showQrCode, setShowQrCode] = useState(activeTemplate?.showQrCode ?? true);
  const [showBarcode, setShowBarcode] = useState(activeTemplate?.showBarcode ?? true);
  const [showHost, setShowHost] = useState(activeTemplate?.showHost ?? true);
  const [showCategoryColor, setShowCategoryColor] = useState(activeTemplate?.showCategoryColor ?? true);
  const [showHeaderLogo, setShowHeaderLogo] = useState(activeTemplate?.showHeaderLogo ?? true);
  const [showMusterPoint, setShowMusterPoint] = useState(activeTemplate?.showMusterPoint ?? true);
  const [showExpiryTime, setShowExpiryTime] = useState(activeTemplate?.showExpiryTime ?? true);

  // Thermal Label Customiser Specific State
  const [thermalPrinterBrand, setThermalPrinterBrand] = useState<'ZEBRA' | 'BROTHER' | 'DYMO' | 'TSC'>(
    activeTemplate?.thermalSettings?.printerBrand || 'ZEBRA'
  );
  const [thermalDarkness, setThermalDarkness] = useState<number>(
    activeTemplate?.thermalSettings?.darknessLevel ?? 10
  );
  const [thermalSpeedIps, setThermalSpeedIps] = useState<number>(
    activeTemplate?.thermalSettings?.printSpeedIps ?? 4
  );
  const [thermalCutterMode, setThermalCutterMode] = useState<'TEAR_OFF' | 'AUTO_CUT' | 'PEEL_SENSOR'>(
    activeTemplate?.thermalSettings?.cutterMode || 'TEAR_OFF'
  );
  const [thermalResolutionDpi, setThermalResolutionDpi] = useState<203 | 300>(
    activeTemplate?.thermalSettings?.resolutionDpi || 203
  );
  const [monochromeDither, setMonochromeDither] = useState<boolean>(
    activeTemplate?.thermalSettings?.monochromeDither ?? false
  );
  const [selfExpiringVoidPreview, setSelfExpiringVoidPreview] = useState<boolean>(
    activeTemplate?.thermalSettings?.selfExpiringVoidPreview ?? false
  );

  // Modals & Async Print States
  const [showZplModal, setShowZplModal] = useState(false);
  const [isTestPrinting, setIsTestPrinting] = useState(false);

  // Preview interactive state
  const [isFlippedToBack, setIsFlippedToBack] = useState(false);
  const [sampleVisitorType, setSampleVisitorType] = useState<'VIP' | 'CONTRACTOR' | 'STANDARD'>('STANDARD');
  const [isSaving, setIsSaving] = useState(false);

  // When switching selected template
  const handleSelectTemplate = (id: string) => {
    const t = templates.find((item) => item.id === id);
    if (!t) return;
    setSelectedTemplateId(id);
    setTemplateName(t.name);
    setPassType(t.type);
    setWidthMm(t.widthMm);
    setHeightMm(t.heightMm);
    setOrientation(t.badgeLayoutOrientation || (t.widthMm > t.heightMm ? 'LANDSCAPE' : 'PORTRAIT'));
    setHeaderBackground(t.headerBackground || '#123B5D');
    setHeaderTextColor(t.headerTextColor || '#FFFFFF');
    setWatermarkText(t.watermarkText || 'OFFICIAL VISITOR');
    setInstructions(t.instructions || '');
    setBacksideDisclaimer(t.backsideDisclaimer || '');
    setShowPhoto(t.showPhoto ?? true);
    setShowQrCode(t.showQrCode ?? true);
    setShowBarcode(t.showBarcode ?? true);
    setShowHost(t.showHost ?? true);
    setShowCategoryColor(t.showCategoryColor ?? true);
    setShowHeaderLogo(t.showHeaderLogo ?? true);
    setShowMusterPoint(t.showMusterPoint ?? true);
    setShowExpiryTime(t.showExpiryTime ?? true);

    // Sync thermal settings if present
    if (t.thermalSettings) {
      if (t.thermalSettings.printerBrand) setThermalPrinterBrand(t.thermalSettings.printerBrand);
      if (t.thermalSettings.darknessLevel !== undefined) setThermalDarkness(t.thermalSettings.darknessLevel);
      if (t.thermalSettings.printSpeedIps !== undefined) setThermalSpeedIps(t.thermalSettings.printSpeedIps);
      if (t.thermalSettings.cutterMode) setThermalCutterMode(t.thermalSettings.cutterMode);
      if (t.thermalSettings.resolutionDpi) setThermalResolutionDpi(t.thermalSettings.resolutionDpi);
      if (t.thermalSettings.monochromeDither !== undefined) setMonochromeDither(t.thermalSettings.monochromeDither);
      if (t.thermalSettings.selfExpiringVoidPreview !== undefined) setSelfExpiringVoidPreview(t.thermalSettings.selfExpiringVoidPreview);
    }
    setIsFlippedToBack(false);
  };

  const handleApplyPreset = (preset: Partial<BadgeTemplate>) => {
    if (preset.name) setTemplateName(preset.name);
    if (preset.type) setPassType(preset.type);
    if (preset.widthMm) setWidthMm(preset.widthMm);
    if (preset.heightMm) setHeightMm(preset.heightMm);
    if (preset.badgeLayoutOrientation) setOrientation(preset.badgeLayoutOrientation);
    if (preset.headerBackground) setHeaderBackground(preset.headerBackground);
    if (preset.headerTextColor) setHeaderTextColor(preset.headerTextColor);
    if (preset.watermarkText) setWatermarkText(preset.watermarkText);
    if (preset.instructions) setInstructions(preset.instructions);
    if (preset.backsideDisclaimer) setBacksideDisclaimer(preset.backsideDisclaimer);
    if (preset.showPhoto !== undefined) setShowPhoto(preset.showPhoto);
    if (preset.showQrCode !== undefined) setShowQrCode(preset.showQrCode);
    if (preset.showBarcode !== undefined) setShowBarcode(preset.showBarcode);
    if (preset.showHost !== undefined) setShowHost(preset.showHost);
    if (preset.showCategoryColor !== undefined) setShowCategoryColor(preset.showCategoryColor);
    if (preset.showHeaderLogo !== undefined) setShowHeaderLogo(preset.showHeaderLogo);
    if (preset.showMusterPoint !== undefined) setShowMusterPoint(preset.showMusterPoint);
    if (preset.showExpiryTime !== undefined) setShowExpiryTime(preset.showExpiryTime);
  };

  const handleApplyThermalPreset = (preset: {
    brand: 'ZEBRA' | 'BROTHER' | 'DYMO' | 'TSC';
    widthMm: number;
    heightMm: number;
    darkness: number;
    speed: number;
    cutter: 'TEAR_OFF' | 'AUTO_CUT' | 'PEEL_SENSOR';
    dpi: 203 | 300;
    label: string;
  }) => {
    setThermalPrinterBrand(preset.brand);
    setWidthMm(preset.widthMm);
    setHeightMm(preset.heightMm);
    setOrientation(preset.widthMm > preset.heightMm ? 'LANDSCAPE' : 'PORTRAIT');
    setThermalDarkness(preset.darkness);
    setThermalSpeedIps(preset.speed);
    setThermalCutterMode(preset.cutter);
    setThermalResolutionDpi(preset.dpi);
    setPassType('ADHESIVE_LABEL');
    setMonochromeDither(true);
    if (onSuccessToast) {
      onSuccessToast(`Loaded thermal media profile: ${preset.label}`);
    }
  };

  const handleSaveTemplate = () => {
    setIsSaving(true);
    const updated: BadgeTemplate = {
      id: selectedTemplateId,
      tenantId: activeTenant.id,
      name: templateName,
      type: passType,
      widthMm,
      heightMm,
      badgeLayoutOrientation: orientation,
      headerBackground,
      headerTextColor,
      watermarkText,
      instructions,
      backsideDisclaimer,
      showPhoto,
      showQrCode,
      showBarcode,
      showHost,
      showCategoryColor,
      showHeaderLogo,
      showMusterPoint,
      showExpiryTime,
      thermalSettings: {
        printerBrand: thermalPrinterBrand,
        darknessLevel: thermalDarkness,
        printSpeedIps: thermalSpeedIps,
        cutterMode: thermalCutterMode,
        resolutionDpi: thermalResolutionDpi,
        monochromeDither,
        selfExpiringVoidPreview,
      },
    };

    const res = storageService.saveBadgeTemplate(updated);
    setTimeout(() => {
      setIsSaving(false);
      if (res.success && onSuccessToast) {
        onSuccessToast(
          `Visitor Pass & Thermal Profile "${templateName}" saved and activated successfully for ${activeTenant.name}.`
        );
      }
    }, 400);
  };

  const handleCreateNewTemplate = () => {
    const newId = `tmpl-custom-${Date.now()}`;
    const newTemplate: BadgeTemplate = {
      id: newId,
      tenantId: activeTenant.id,
      name: `Custom Pass Design (${new Date().toLocaleDateString()})`,
      type: 'CR80_CARD',
      widthMm: 85.6,
      heightMm: 53.98,
      badgeLayoutOrientation: 'LANDSCAPE',
      headerBackground: '#123B5D',
      headerTextColor: '#FFFFFF',
      watermarkText: 'VISITOR CLEARANCE',
      instructions: 'Must be visibly worn at all times above the waist.',
      backsideDisclaimer: 'Return to reception upon check-out.',
      showPhoto: true,
      showQrCode: true,
      showBarcode: true,
      showHost: true,
      showCategoryColor: true,
      showHeaderLogo: true,
      showMusterPoint: true,
      showExpiryTime: true,
      thermalSettings: {
        printerBrand: 'ZEBRA',
        darknessLevel: 10,
        printSpeedIps: 4,
        cutterMode: 'TEAR_OFF',
        resolutionDpi: 203,
        monochromeDither: false,
        selfExpiringVoidPreview: false,
      },
    };
    storageService.saveBadgeTemplate(newTemplate);
    setSelectedTemplateId(newId);
    handleSelectTemplate(newId);
    if (onSuccessToast) {
      onSuccessToast('New custom visitor pass design initialized.');
    }
  };

  const handleTestThermalPrint = () => {
    setIsTestPrinting(true);
    setTimeout(() => {
      setIsTestPrinting(false);
      const appState = storageService.getState();
      const targetVisitId = appState.visits[0]?.id || 'vst-sample';
      const printer = appState.devices.find((d) => d.type === 'BADGE_PRINTER') || appState.devices[0];
      const targetPrinterId = printer?.id || 'dev-ptr-01';

      const res = storageService.createPrintJob({
        visitId: targetVisitId,
        printerId: targetPrinterId,
        idempotencyKey: `test-thermal-${Date.now()}`,
      });
      if (onSuccessToast) {
        onSuccessToast(
          `Test Thermal Pass dispatched to ${thermalPrinterBrand} (${activeSite.name}) • Job #${(
            res.job?.id || 'job-01'
          ).substring(0, 8)} • Spooled at ${thermalSpeedIps} ips`
        );
      }
    }, 850);
  };

  // Sample data mock
  const sampleVisitor = {
    VIP: {
      name: 'Dr. Arvind Swaminathan',
      company: 'IISc Executive Council',
      category: 'VIP Executive',
      categoryColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badgeNumber: 'TATA-VIP-0901',
      host: 'Arun Mehra (Exec Board)',
      zone: 'Zone A - Boardroom & Lounge',
      muster: 'Assembly Point 1 (Central Green)',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    CONTRACTOR: {
      name: 'Sneha Kulkarni',
      company: 'Voltas Facility HVAC Engineering',
      category: 'Contractor (Escort Req)',
      categoryColor: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeNumber: 'TATA-CONTR-0199',
      host: 'Priya Nair (Facilities)',
      zone: 'Zone C - Chiller Mechanical Floor',
      muster: 'Assembly Point 3 (West Gate 4)',
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
    STANDARD: {
      name: 'Rajesh Kumar',
      company: 'Infosys BPM Solutions',
      category: 'Business Guest',
      categoryColor: 'bg-blue-100 text-blue-900 border-blue-300',
      badgeNumber: 'TATA-VIS-4482',
      host: 'Vikramaditya Chauhan (SOC)',
      zone: 'Zone B - Conference Room 4',
      muster: 'Assembly Point 2 (North Plaza)',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  }[sampleVisitorType];

  const isThermalMonochromeActive = studioMode === 'THERMAL_LABEL' || monochromeDither;

  // Compute thermal contrast & brightness from darkness slider
  const thermalContrast = 100 + (thermalDarkness - 7) * 8;
  const thermalBrightness = 100 - (thermalDarkness - 7) * 3;

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-900 text-[11px] font-black uppercase tracking-wider border border-purple-200">
              Super Admin Clearance
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Enterprise: <strong className="text-[#172B3A]">{activeTenant.name}</strong>
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#172B3A] mt-1">
            Visitor Pass Format Designer & Thermal Label Customiser
          </h2>
          <p className="text-xs text-[#526575] mt-0.5">
            Configure dynamic physical card geometry, Zebra/Brother direct thermal burn densities, holographic watermarks, and verification QR tokens.
          </p>
        </div>

        {/* Mode Switcher Tabs + Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Dual Studio Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setStudioMode('PASS_FORMAT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                studioMode === 'PASS_FORMAT'
                  ? 'bg-white text-[#123B5D] shadow-xs'
                  : 'text-slate-600 hover:text-[#172B3A]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-teal-700" />
              <span>Pass Format Designer</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStudioMode('THERMAL_LABEL');
                setMonochromeDither(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                studioMode === 'THERMAL_LABEL'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:text-purple-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Thermal Label Customiser</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="pass-designer-create-new-btn"
              onClick={handleCreateNewTemplate}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-[#123B5D] flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>New Design</span>
            </button>
            <button
              id="pass-designer-save-btn"
              onClick={handleSaveTemplate}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#0d655e] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Design...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Activate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Preset Selector (Only in Pass Format Mode) */}
      {studioMode === 'PASS_FORMAT' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#172B3A]">
            <Palette className="w-4 h-4 text-teal-700" />
            <span>Load Standard Enterprise Pass Presets:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_TEMPLATES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 text-[11px] font-semibold text-[#123B5D] transition cursor-pointer shadow-2xs"
              >
                {preset.name?.split('(')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Studio Workspace: Left Controls (7 cols) + Right Live Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {studioMode === 'PASS_FORMAT' ? (
            /* ======================================================== */
            /* MODE 1: VISITOR PASS FORMAT DESIGNER CONTROLS */
            /* ======================================================== */
            <>
              {/* Section 1: Template Selection & Dimensions */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-teal-600" />
                  <span>1. Credential Form Factor & Geometry</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#172B3A] mb-1">Active Design Name</label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#172B3A] mb-1">Pass Media Type</label>
                    <select
                      value={passType}
                      onChange={(e) => {
                        const t = e.target.value as BadgeTemplate['type'];
                        setPassType(t);
                        if (t === 'CR80_CARD') {
                          setWidthMm(85.6);
                          setHeightMm(53.98);
                          setOrientation('LANDSCAPE');
                        } else if (t === 'ADHESIVE_LABEL') {
                          setWidthMm(101.6);
                          setHeightMm(76.2);
                          setOrientation('PORTRAIT');
                        } else if (t === 'CONFERENCE_PASS') {
                          setWidthMm(90);
                          setHeightMm(130);
                          setOrientation('PORTRAIT');
                        }
                      }}
                      className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                    >
                      <option value="CR80_CARD">CR-80 PVC Rigid Card (85.6 × 54 mm)</option>
                      <option value="ADHESIVE_LABEL">Thermal Adhesive Label (101.6 × 76.2 mm)</option>
                      <option value="CONFERENCE_PASS">Conference Lanyard Badge (90 × 130 mm)</option>
                      <option value="MOBILE_WALLET_PASS">Mobile Digital Wallet Pass (Apple/Google Wallet)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Width (mm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={widthMm}
                      onChange={(e) => setWidthMm(parseFloat(e.target.value) || 50)}
                      className="w-full text-xs font-medium px-2.5 py-1.5 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Height (mm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={heightMm}
                      onChange={(e) => setHeightMm(parseFloat(e.target.value) || 50)}
                      className="w-full text-xs font-medium px-2.5 py-1.5 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Layout</label>
                    <select
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value as any)}
                      className="w-full text-xs font-medium px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                    >
                      <option value="LANDSCAPE">Landscape (Horizontal)</option>
                      <option value="PORTRAIT">Portrait (Vertical)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Branding, Colors & Watermark */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-teal-600" />
                  <span>2. Visual Identity & Security Watermark</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-[#172B3A] mb-1.5">Header Banner Accent Color</label>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setHeaderBackground(c.hex)}
                        className={`h-7 px-2.5 rounded-md flex items-center gap-1.5 text-[11px] font-bold border transition cursor-pointer ${
                          headerBackground === c.hex
                            ? 'ring-2 ring-teal-600 ring-offset-1 border-slate-400'
                            : 'border-slate-200 hover:scale-103'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.hex }} />
                        <span className="text-slate-700">{c.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={headerBackground}
                      onChange={(e) => setHeaderBackground(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={headerBackground}
                      onChange={(e) => setHeaderBackground(e.target.value)}
                      className="w-28 text-xs font-mono px-2.5 py-1.5 border border-slate-300 rounded-md"
                      placeholder="#123B5D"
                    />
                    <span className="text-[11px] text-slate-500">Custom Hex Code</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-[#172B3A] mb-1">Security Watermark Banner Text</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                      placeholder="e.g. OFFICIAL VISITOR"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#172B3A] mb-1">Header Text / Icon Color</label>
                    <select
                      value={headerTextColor}
                      onChange={(e) => setHeaderTextColor(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="#FFFFFF">Crisp White (#FFFFFF)</option>
                      <option value="#F8FAFC">Off-White (#F8FAFC)</option>
                      <option value="#FEF08A">High-Visibility Yellow (#FEF08A)</option>
                      <option value="#172B3A">Dark Charcoal (#172B3A)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Data Elements & Security Toggles */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-teal-600" />
                  <span>3. Data Fields & Hardware Verification Elements</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showPhoto}
                      onChange={(e) => setShowPhoto(e.target.checked)}
                      className="rounded text-teal-700 focus:ring-teal-600 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-[#172B3A]">Visitor Photo</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showQrCode}
                      onChange={(e) => setShowQrCode(e.target.checked)}
                      className="rounded text-teal-700 focus:ring-teal-600 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-[#172B3A]">HMAC QR Code</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showBarcode}
                      onChange={(e) => setShowBarcode(e.target.checked)}
                      className="rounded text-teal-700 focus:ring-teal-600 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-[#172B3A]">Code-128 Barcode</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showHost}
                      onChange={(e) => setShowHost(e.target.checked)}
                      className="rounded text-teal-700 focus:ring-teal-600 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-[#172B3A]">Host Employee</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showCategoryColor}
                      onChange={(e) => setShowCategoryColor(e.target.checked)}
                      className="rounded text-teal-700 focus:ring-teal-600 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-[#172B3A]">Category Badge</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showHeaderLogo}
                      onChange={(e) => setShowHeaderLogo(e.target.checked)}
                      className="rounded text-teal-700 focus:ring-teal-600 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-[#172B3A]">Corporate Logo</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showMusterPoint}
                      onChange={(e) => setShowMusterPoint(e.target.checked)}
                      className="rounded text-teal-700 focus:ring-teal-600 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-[#172B3A]">Muster Zone</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showExpiryTime}
                      onChange={(e) => setShowExpiryTime(e.target.checked)}
                      className="rounded text-teal-700 focus:ring-teal-600 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-[#172B3A]">Valid Expiry</span>
                  </label>
                </div>
              </div>

              {/* Section 4: Instructions & Reverse Side Disclaimer */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  <span>4. Front Notice & Reverse Side NDA Policy</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-[#172B3A] mb-1">Front Badge Instructions (1-2 lines)</label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                    placeholder="Must be visibly worn at all times above the waist."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172B3A] mb-1">
                    Reverse Side Disclaimer & Corporate NDA Notice
                  </label>
                  <textarea
                    rows={2}
                    value={backsideDisclaimer}
                    onChange={(e) => setBacksideDisclaimer(e.target.value)}
                    className="w-full text-xs font-medium p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                    placeholder="Legal non-disclosure and safety instructions printed on the back of double-sided cards."
                  />
                </div>
              </div>
            </>
          ) : (
            /* ======================================================== */
            /* MODE 2: THERMAL LABEL CUSTOMISER CONTROLS */
            /* ======================================================== */
            <ThermalLabelCustomiserPanel
              printerBrand={thermalPrinterBrand}
              onChangePrinterBrand={setThermalPrinterBrand}
              darknessLevel={thermalDarkness}
              onChangeDarknessLevel={setThermalDarkness}
              printSpeedIps={thermalSpeedIps}
              onChangePrintSpeedIps={setThermalSpeedIps}
              cutterMode={thermalCutterMode}
              onChangeCutterMode={setThermalCutterMode}
              resolutionDpi={thermalResolutionDpi}
              onChangeResolutionDpi={setThermalResolutionDpi}
              monochromeDither={monochromeDither}
              onToggleMonochromeDither={setMonochromeDither}
              selfExpiringVoidPreview={selfExpiringVoidPreview}
              onToggleSelfExpiringVoidPreview={setSelfExpiringVoidPreview}
              onApplyThermalPreset={handleApplyThermalPreset}
              onOpenZplModal={() => setShowZplModal(true)}
              onTestThermalPrint={handleTestThermalPrint}
              isTestPrinting={isTestPrinting}
            />
          )}
        </div>

        {/* Right Column: Live Interactive WYSIWYG Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20 space-y-4">
            {/* Preview Toolbar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-[#172B3A]">
                  {isThermalMonochromeActive ? 'Thermal Head Emulation' : 'Live Pass Rendering'}
                </span>
                {isThermalMonochromeActive && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                    {thermalDarkness}/15 BURN
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFlippedToBack(!isFlippedToBack)}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[#123B5D] text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Flip pass between front and back"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isFlippedToBack ? 'Show Front' : 'Flip to Back'}</span>
                </button>
              </div>
            </div>

            {/* Visitor Persona Switcher */}
            <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-lg text-xs">
              <span className="text-[11px] font-semibold text-slate-500 px-2">Sample Guest:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSampleVisitorType('STANDARD')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                    sampleVisitorType === 'STANDARD' ? 'bg-white text-[#123B5D] shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setSampleVisitorType('VIP')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                    sampleVisitorType === 'VIP' ? 'bg-white text-[#123B5D] shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  VIP Executive
                </button>
                <button
                  onClick={() => setSampleVisitorType('CONTRACTOR')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                    sampleVisitorType === 'CONTRACTOR' ? 'bg-white text-[#123B5D] shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Contractor
                </button>
              </div>
            </div>

            {/* The Rendered Badge Component with Realistic Aspect Ratio and Thermal Shading */}
            <div className="bg-slate-200/80 p-6 rounded-2xl border border-slate-300 flex items-center justify-center min-h-[380px] overflow-hidden relative">
              {/* Optional Cutter Line Guide when in Thermal mode */}
              {studioMode === 'THERMAL_LABEL' && thermalCutterMode === 'AUTO_CUT' && (
                <div className="absolute top-2 left-6 right-6 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                  <Scissors className="w-3.5 h-3.5 text-slate-600" />
                  <span className="border-b border-dashed border-slate-400 flex-1"></span>
                  <span>AUTO-CUTTER GUILLOTINE BLADE LINE</span>
                  <span className="border-b border-dashed border-slate-400 flex-1"></span>
                </div>
              )}

              <div
                className={`bg-white rounded-xl shadow-2xl border border-slate-300 relative flex flex-col overflow-hidden transition-all duration-300 ${
                  orientation === 'LANDSCAPE' ? 'w-full max-w-[390px] aspect-[85.6/54]' : 'w-full max-w-[320px] aspect-[54/85.6]'
                }`}
                style={{
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  filter: isThermalMonochromeActive
                    ? `grayscale(100%) contrast(${thermalContrast}%) brightness(${thermalBrightness}%)`
                    : 'none',
                }}
              >
                {!isFlippedToBack ? (
                  /* FRONT OF PASS */
                  <div className="flex-1 flex flex-col h-full relative">
                    {/* Header Strip */}
                    <div
                      className="px-4 py-2.5 flex items-center justify-between shrink-0"
                      style={{ backgroundColor: headerBackground, color: headerTextColor }}
                    >
                      <div className="flex items-center gap-1.5">
                        {showHeaderLogo && (
                          <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center font-black text-[10px] tracking-tighter">
                            JS
                          </div>
                        )}
                        <div>
                          <div className="text-[11px] font-black tracking-tight leading-none uppercase">
                            {activeTenant.name}
                          </div>
                          <div className="text-[9px] opacity-85 font-medium leading-none mt-0.5">
                            {activeSite.name}
                          </div>
                        </div>
                      </div>

                      {watermarkText && (
                        <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs">
                          {watermarkText}
                        </span>
                      )}
                    </div>

                    {/* Main Badge Body */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between gap-2 relative">
                      {/* Self-Expiring VOID Grid Simulation Overlay */}
                      {selfExpiringVoidPreview && (
                        <div
                          className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-around overflow-hidden select-none opacity-45"
                          style={{
                            backgroundImage:
                              'repeating-linear-gradient(45deg, rgba(220, 38, 38, 0.25), rgba(220, 38, 38, 0.25) 12px, transparent 12px, transparent 24px)',
                          }}
                        >
                          <div className="text-red-700 font-black text-center text-xs tracking-[0.3em] uppercase rotate-[-15deg]">
                            VOID • EXPIRED • VOID • EXPIRED
                          </div>
                          <div className="text-red-700 font-black text-center text-xs tracking-[0.3em] uppercase rotate-[-15deg]">
                            VOID • EXPIRED • VOID • EXPIRED
                          </div>
                        </div>
                      )}

                      {/* Top Row: Photo + Name + Company */}
                      <div className="flex items-start gap-3">
                        {showPhoto && (
                          <div className="relative shrink-0">
                            <img
                              src={sampleVisitor.photo}
                              alt="Visitor"
                              referrerPolicy="no-referrer"
                              className="w-14 h-16 rounded-lg object-cover border-2 border-slate-200 shadow-xs"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-teal-600 text-white p-0.5 rounded-full ring-2 ring-white">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          {showCategoryColor && (
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border mb-1 ${sampleVisitor.categoryColor}`}
                            >
                              {sampleVisitor.category}
                            </span>
                          )}

                          <h4 className="text-sm font-black text-[#172B3A] leading-tight truncate">
                            {sampleVisitor.name}
                          </h4>
                          <p className="text-[11px] font-medium text-slate-600 truncate">{sampleVisitor.company}</p>

                          <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                            <span className="font-bold text-[#123B5D]">{sampleVisitor.badgeNumber}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle Row: Host, Zone, and QR Code */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        <div className="space-y-0.5 text-[10px] text-slate-600 min-w-0">
                          {showHost && (
                            <div>
                              <span className="font-bold text-slate-800">Host:</span> {sampleVisitor.host}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-800">Zone:</span> {sampleVisitor.zone}
                          </div>
                          {showMusterPoint && (
                            <div className="text-[9px] text-amber-800 font-semibold truncate">
                              🚨 {sampleVisitor.muster}
                            </div>
                          )}
                          {showExpiryTime && (
                            <div className="text-[9px] text-slate-500 font-medium">
                              Valid Today until <strong>23:59 IST</strong>
                            </div>
                          )}
                        </div>

                        {showQrCode && (
                          <div className="shrink-0 flex flex-col items-center bg-slate-50 p-1 rounded-lg border border-slate-200">
                            <QrCode className="w-11 h-11 text-slate-800" />
                            <span className="text-[7px] font-mono text-slate-500 mt-0.5">SCAN VERIFY</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Row: Barcode & Instructions */}
                      <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-500">
                        <span className="truncate max-w-[200px]">{instructions}</span>
                        {showBarcode && (
                          <div className="font-mono text-[7px] tracking-widest text-slate-700 font-bold">
                            ||| | |||| | |||
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* BACK OF PASS */
                  <div className="flex-1 flex flex-col justify-between p-4 bg-slate-50 text-[10px] leading-relaxed text-slate-700 select-none">
                    <div className="space-y-2">
                      <div className="font-bold text-[#172B3A] uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                        Official Security Protocol & Terms of Admission
                      </div>

                      <p className="text-[9.5px] text-slate-600">{backsideDisclaimer}</p>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 text-[9px]">
                        <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>EMERGENCY DISPATCH PROTOCOL</span>
                        </div>
                        <p className="text-slate-600">
                          In case of evacuation or security alert, assemble immediately at designated muster zones. Dial{' '}
                          <strong className="text-teal-900">+91 80 6789 4400</strong> for Security Operations Center (SOC).
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-400 font-mono">
                      <span>FORM: {passType}</span>
                      <span>SHA-256 HMAC VERIFIED</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thermal Print Job & Dispatch Status Card */}
            <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-4 text-xs text-teal-900 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-teal-700" />
                  <strong className="font-bold text-teal-950">Thermal Print Engine Ready</strong>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">
                  {thermalPrinterBrand} ({thermalResolutionDpi} DPI)
                </span>
              </div>
              <p className="text-[11px] text-teal-800 leading-normal">
                Configured with <strong>{thermalCutterMode.replace(/_/g, ' ')}</strong> mode and heat energy index <strong>{thermalDarkness}/15</strong>. Check-in kiosks and security desks will generate crisp barcode tokens directly to network thermal hardware.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestThermalPrint}
                  disabled={isTestPrinting}
                  className="px-3 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0c5c56] text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isTestPrinting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Printing Pass...</span>
                    </>
                  ) : (
                    <>
                      <Printer className="w-3.5 h-3.5" />
                      <span>Test Thermal Print</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowZplModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-teal-300 hover:bg-teal-50 text-teal-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-teal-700" />
                  <span>Inspect ZPL Stream</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Raw ZPL / ESC-P Code Stream Modal */}
      <ZplCodeStreamModal
        isOpen={showZplModal}
        onClose={() => setShowZplModal(false)}
        template={{
          id: selectedTemplateId,
          tenantId: activeTenant.id,
          name: templateName,
          type: passType,
          widthMm,
          heightMm,
          badgeLayoutOrientation: orientation,
          headerBackground,
          headerTextColor,
          watermarkText,
          instructions,
          backsideDisclaimer,
          showPhoto,
          showQrCode,
          showBarcode,
          showHost,
          showCategoryColor,
          showHeaderLogo,
          showMusterPoint,
          showExpiryTime,
          thermalSettings: {
            printerBrand: thermalPrinterBrand,
            darknessLevel: thermalDarkness,
            printSpeedIps: thermalSpeedIps,
            cutterMode: thermalCutterMode,
            resolutionDpi: thermalResolutionDpi,
            monochromeDither,
            selfExpiringVoidPreview,
          },
        }}
        activeTenant={activeTenant}
        activeSite={activeSite}
      />
    </div>
  );
};
