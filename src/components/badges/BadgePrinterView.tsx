import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  CreditCard,
  QrCode,
  Shield,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Send,
  Sparkles,
  ExternalLink,
  Smartphone,
  Scan,
  Zap,
  Check,
  FileDown,
  Loader2
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Visit, BadgeTemplate, HardwareDevice } from '../../types';
import { VisitorQrPassModal } from '../common/VisitorQrPassModal';
import { ExpressMobileCheckoutModal } from './ExpressMobileCheckoutModal';
import { JSAlphaSoftLogo } from '../common/JSAlphaSoftLogo';
import { generateVisitorPassPdf } from '../../utils/passPdfGenerator';

interface BadgePrinterViewProps {
  initialVisit?: Visit | null;
}

export const BadgePrinterView: React.FC<BadgePrinterViewProps> = ({ initialVisit }) => {
  const state = storageService.getState();
  const activeTenant = storageService.getActiveTenant();
  const activeSite = storageService.getActiveSite();

  const [selectedVisitId, setSelectedVisitId] = useState<string>(
    initialVisit?.id || state.visits[0]?.id || ''
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    state.badgeTemplates[0]?.id || ''
  );
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>(
    state.devices.find((d) => d.type === 'BADGE_PRINTER')?.id || ''
  );
  const [qrFormat, setQrFormat] = useState<'EXPRESS_MOBILE_CHECKOUT' | 'TURNSTILE_BARRIER'>('EXPRESS_MOBILE_CHECKOUT');
  const [isReprint, setIsReprint] = useState(false);
  const [reprintReason, setReprintReason] = useState('Damaged thermal label');
  const [isPrintingAnimation, setIsPrintingAnimation] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [badgeQrDataUrl, setBadgeQrDataUrl] = useState<string>('');
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isMobileScannerOpen, setIsMobileScannerOpen] = useState(false);

  // Auto-render when a new initialVisit is passed down from other views
  useEffect(() => {
    if (initialVisit?.id) {
      setSelectedVisitId(initialVisit.id);
    }
  }, [initialVisit?.id]);

  // Refresh active visit object from state
  const selectedVisit = state.visits.find((v) => v.id === selectedVisitId) || state.visits[0];
  const selectedTemplate = state.badgeTemplates.find((t) => t.id === selectedTemplateId) || state.badgeTemplates[0];
  const selectedPrinter = state.devices.find((d) => d.id === selectedPrinterId);

  // Generate Dynamic QR Code for each visit (Express Mobile Check-Out vs Turnstile)
  useEffect(() => {
    if (!selectedVisit) return;

    let qrPayload = '';

    if (qrFormat === 'EXPRESS_MOBILE_CHECKOUT') {
      // Dynamic mobile express check-out payload with signed cryptographic token & timestamp
      const baseUrl = window.location.origin;
      qrPayload = `${baseUrl}/?action=express-checkout&visitId=${selectedVisit.id}&token=${selectedVisit.passToken}&badge=${selectedVisit.badgeNumber || 'PENDING'}&t=${Date.now()}`;
    } else {
      // Hardware Turnstile barcode token
      qrPayload = JSON.stringify({
        vms: 'JS_ALPHASOFT_VMS_V2',
        action: 'EXPRESS_EXIT',
        token: selectedVisit.passToken,
        badge: selectedVisit.badgeNumber || 'PENDING',
        siteId: selectedVisit.siteId,
        visitor: selectedVisit.visitorName,
        expiresAt: selectedVisit.passTokenExpiresAt,
      });
    }

    QRCode.toDataURL(qrPayload, {
      width: 180,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: qrFormat === 'EXPRESS_MOBILE_CHECKOUT' ? '#0F766E' : '#123B5D',
        light: '#FFFFF0',
      },
    })
      .then((url) => setBadgeQrDataUrl(url))
      .catch((err) => console.error('Failed to generate dynamic badge QR', err));
  }, [selectedVisit, qrFormat]);

  const handlePrint = () => {
    if (!selectedVisit) return;

    setIsPrintingAnimation(true);
    const idempotencyKey = `idmp-${selectedVisit.id}-${isReprint ? Date.now() : 'first-run'}`;

    setTimeout(() => {
      const res = storageService.createPrintJob({
        visitId: selectedVisit.id,
        printerId: selectedPrinterId,
        idempotencyKey,
        isReprint,
        reprintReason: isReprint ? reprintReason : undefined,
      });

      setIsPrintingAnimation(false);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Thermal print job successfully sent to ${res.job.printerName}. Dynamic Express Check-Out QR encoded.`,
        });
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
      setTimeout(() => setFeedback(null), 4000);
    }, 1200);
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!selectedVisit) return;
    try {
      setIsGeneratingPdf(true);
      await generateVisitorPassPdf(selectedVisit, activeTenant, activeSite, { autoDownload: true });
    } catch (err) {
      console.error('Failed to generate pass PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleBrowserNativePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#D8E1E8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#0F766E]" />
            <h1 className="text-lg font-bold text-[#172B3A]">
              Badge Designer & Express Touchless Mobile Spooler
            </h1>
          </div>
          <p className="text-xs text-[#526575] mt-1">
            Dynamic QR codes embedded on thermal badges for instant, touchless smartphone check-out. Generic ZPL/ESC-P hardware abstraction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="badge-printer-download-pdf-btn"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Generate and download printable visitor security pass as PDF"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-700" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-teal-700" />
                <span>Download Pass PDF</span>
              </>
            )}
          </button>

          <button
            id="mobile-scan-simulator-trigger-btn"
            onClick={() => setIsMobileScannerOpen(true)}
            className="bg-gradient-to-r from-teal-600 to-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:opacity-95 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Simulate Mobile Check-Out Scan</span>
          </button>

          <button
            onClick={handleBrowserNativePrint}
            className="bg-[#F4F7FA] text-[#123B5D] border border-[#D8E1E8] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-100 transition"
          >
            Browser Print
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-red-50 text-red-800 border-red-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Two Column Grid: Controls on left, Live Badge Canvas on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Config Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-[#D8E1E8] shadow-xs p-5 space-y-4 text-xs">
            <h2 className="font-bold text-[#172B3A] uppercase tracking-wider text-xs border-b pb-2">
              Badge Print Parameters
            </h2>

            {/* Select Visit */}
            <div>
              <label className="block text-[#172B3A] font-semibold mb-1">Target Visit / Visitor</label>
              <select
                value={selectedVisitId}
                onChange={(e) => setSelectedVisitId(e.target.value)}
                className="w-full p-2 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E]"
              >
                {state.visits.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.visitorName} ({v.visitorCompany}) - {v.state}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic QR Mode Selection */}
            <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-teal-950 flex items-center gap-1.5 text-xs">
                  <Zap className="w-3.5 h-3.5 text-teal-700" />
                  <span>Dynamic QR Code Encoding:</span>
                </label>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-teal-200/80 text-teal-900 font-bold">
                  Touchless
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQrFormat('EXPRESS_MOBILE_CHECKOUT')}
                  className={`p-2 rounded-lg border text-left transition ${
                    qrFormat === 'EXPRESS_MOBILE_CHECKOUT'
                      ? 'bg-white border-teal-600 text-teal-900 font-bold shadow-xs'
                      : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px]">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile Touchless</span>
                  </div>
                  <div className="text-[9px] text-teal-700 mt-0.5">
                    Smartphone camera express exit link
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setQrFormat('TURNSTILE_BARRIER')}
                  className={`p-2 rounded-lg border text-left transition ${
                    qrFormat === 'TURNSTILE_BARRIER'
                      ? 'bg-white border-teal-600 text-teal-900 font-bold shadow-xs'
                      : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px]">
                    <Scan className="w-3.5 h-3.5" />
                    <span>Optical Turnstile</span>
                  </div>
                  <div className="text-[9px] text-teal-700 mt-0.5">
                    Zebra/Honeywell gate barrier token
                  </div>
                </button>
              </div>
            </div>

            {/* Select Template */}
            <div>
              <label className="block text-[#172B3A] font-semibold mb-1">Badge Layout Template</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full p-2 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E]"
              >
                {state.badgeTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Hardware Printer */}
            <div>
              <label className="block text-[#172B3A] font-semibold mb-1">Hardware Printer Device</label>
              <select
                value={selectedPrinterId}
                onChange={(e) => setSelectedPrinterId(e.target.value)}
                className="w-full p-2 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E]"
              >
                {state.devices
                  .filter((d) => d.type === 'BADGE_PRINTER')
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.model}) - {d.status}
                    </option>
                  ))}
              </select>
              <p className="text-[10px] text-[#526575] mt-1">
                Selected: <span className="font-mono">{selectedPrinter?.ipAddress}</span> • Protocol: Raw Socket / ZPL
              </p>
            </div>

            {/* Reprint Mode Switcher */}
            <div className="pt-2 border-t space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#172B3A]">
                <input
                  type="checkbox"
                  checked={isReprint}
                  onChange={(e) => setIsReprint(e.target.checked)}
                  className="rounded text-[#0F766E]"
                />
                <span>Reprint Authorization Mode (Audited)</span>
              </label>

              {isReprint && (
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 space-y-1">
                  <label className="block text-[11px] font-bold text-amber-900">
                    Mandatory Reprint Reason:
                  </label>
                  <input
                    type="text"
                    value={reprintReason}
                    onChange={(e) => setReprintReason(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-amber-300 rounded text-xs"
                  />
                  <p className="text-[10px] text-amber-700">
                    Duplicate prints are logged to audit explorer with actor and justification.
                  </p>
                </div>
              )}
            </div>

            {/* Dispatch Print Job Button */}
            <div className="pt-2">
              <button
                onClick={handlePrint}
                disabled={isPrintingAnimation}
                className="w-full bg-[#123B5D] text-white py-2.5 rounded-lg font-bold hover:bg-[#0e2f4a] flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
              >
                {isPrintingAnimation ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Spooling ZPL to {selectedPrinter?.name}...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span>{isReprint ? 'Authorize & Dispatch Reprint' : 'Dispatch Print Job'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Badge Canvas & Spooler Queue (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-[#D8E1E8] shadow-xs p-6 flex flex-col items-center">
            <div className="text-xs font-semibold text-[#526575] mb-4 flex flex-wrap items-center justify-center gap-2">
              <span>Physical Thermal Badge Preview (Dimensions: {selectedTemplate.widthMm}mm × {selectedTemplate.heightMm}mm)</span>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded">
                Touchless QR Enabled
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                Auto-Rendering: LIVE
              </span>
            </div>

            {/* Printable Badge Area */}
            <div
              id="printable-badge-area"
              className="w-full max-w-[340px] bg-white rounded-xl border-2 border-slate-300 shadow-xl overflow-hidden text-slate-900 font-sans"
            >
              {/* Header Stripe with JS AlphaSoft VMS Emblem & Tenant Name */}
              <div
                className="p-3 text-white flex items-center justify-between"
                style={{ backgroundColor: selectedTemplate.headerBackground || '#123B5D' }}
              >
                <div className="flex items-center gap-2">
                  <JSAlphaSoftLogo variant="icon" size="sm" />
                  <div className="leading-tight">
                    <span className="font-extrabold text-xs tracking-wider uppercase block">
                      {activeTenant.name}
                    </span>
                    <span className="text-[8px] text-slate-300 tracking-wider uppercase">
                      JS AlphaSoft VMS
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded">
                  {selectedVisit.visitorCategory.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Badge Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {/* Visitor Avatar */}
                  <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                    <span className="text-2xl font-bold text-slate-700">
                      {selectedVisit.visitorName.charAt(0)}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-tight">
                      {selectedVisit.visitorName}
                    </h3>
                    <p className="text-xs font-semibold text-teal-800">{selectedVisit.visitorCompany}</p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Badge #{selectedVisit.badgeNumber || 'TATA-BLR-0081'}
                    </span>
                  </div>
                </div>

                {/* Visit Details Box */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-0.5">
                  <div><strong>Host:</strong> {selectedVisit.hostName} ({selectedVisit.departmentName})</div>
                  <div><strong>Site:</strong> {activeSite.name}</div>
                  <div><strong>Valid:</strong> {new Date(selectedVisit.scheduledStart).toLocaleDateString()}</div>
                  <div><strong>Zone Clearance:</strong> {selectedVisit.assignedZone}</div>
                </div>

                {/* Dynamic QR Code specifically for Rapid Express Touchless Check-Out */}
                <div className="p-2.5 bg-teal-50/50 rounded-xl border border-teal-200/80 flex items-center gap-3">
                  <div className="w-20 h-20 bg-white border border-teal-400/80 p-1 rounded-lg flex items-center justify-center shadow-xs shrink-0">
                    {badgeQrDataUrl ? (
                      <img
                        src={badgeQrDataUrl}
                        alt="Dynamic Express Check-Out QR"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <QrCode className="w-12 h-12 text-teal-600" />
                    )}
                  </div>

                  <div className="text-[10px] text-slate-600 space-y-1">
                    <div className="font-bold text-teal-900 flex items-center gap-1 text-[11px]">
                      <Zap className="w-3 h-3 text-orange-600 fill-orange-500" />
                      <span>EXPRESS TOUCHLESS EXIT</span>
                    </div>
                    <p className="leading-snug text-slate-500">
                      Scan with smartphone camera to check out instantly without queuing at reception.
                    </p>
                    <span className="inline-block font-mono text-[9px] text-teal-800 bg-white px-1.5 py-0.2 rounded border border-teal-200">
                      ID: {selectedVisit.id.slice(-6)} • EXP: 20:00 IST
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Interactive Actions */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                id="open-express-mobile-scanner-btn"
                onClick={() => setIsMobileScannerOpen(true)}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 transition shadow-sm cursor-pointer"
                title="Simulate smartphone scanning badge for rapid express touchless checkout"
              >
                <Smartphone className="w-4 h-4" />
                <span>Simulate Smartphone Scan (Touchless Exit)</span>
              </button>

              <button
                id="open-digital-pass-modal-btn"
                onClick={() => setIsPassModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Full Screen Digital Pass</span>
              </button>

              <button
                id="preview-download-pdf-pass-btn"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="px-3.5 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Download this preview pass as PDF"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-teal-700" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 text-teal-700" />
                    <span>Download Pass (PDF)</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-[#526575] mt-3 text-center">
              Hardware Driver: <span className="font-mono font-semibold">Generic ZPL/ESC-P Driver v2.4</span> • Dynamic Mobile Check-Out QR v2.1 Active
            </p>
          </div>

          {/* Recent Spooler Queue */}
          <div className="bg-white rounded-xl border border-[#D8E1E8] shadow-xs p-5 space-y-3 text-xs">
            <h3 className="font-bold text-[#172B3A]">Recent Thermal Print Jobs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-[#526575] font-semibold text-[10px] uppercase">
                    <th className="pb-2">Job ID</th>
                    <th className="pb-2">Visitor</th>
                    <th className="pb-2">Printer</th>
                    <th className="pb-2">Idempotency Key</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8E1E8]">
                  {state.printJobs.slice(0, 5).map((j) => (
                    <tr key={j.id} className="hover:bg-[#F4F7FA]">
                      <td className="py-2 font-mono text-[11px] text-slate-700">{j.id}</td>
                      <td className="py-2 font-semibold text-[#172B3A]">{j.visitorName}</td>
                      <td className="py-2">{j.printerName}</td>
                      <td className="py-2 font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                        {j.idempotencyKey}
                      </td>
                      <td className="py-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {j.status}
                        </span>
                      </td>
                      <td className="py-2 text-[#526575]">
                        {new Date(j.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Express Mobile Check-Out Simulation Modal */}
      <ExpressMobileCheckoutModal
        isOpen={isMobileScannerOpen}
        onClose={() => setIsMobileScannerOpen(false)}
        visit={selectedVisit}
      />

      {/* Confirmed Visitor Digital Pass & Turnstile Exit Modal */}
      <VisitorQrPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        visit={selectedVisit}
      />
    </div>
  );
};
