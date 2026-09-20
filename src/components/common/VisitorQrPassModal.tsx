import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  CheckCircle2,
  Shield,
  Download,
  Printer,
  Copy,
  X,
  DoorOpen,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  Clock,
  Building,
  User,
  Check
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Visit } from '../../types';

interface VisitorQrPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Visit | null;
  onCheckOutComplete?: (visit: Visit) => void;
}

export const VisitorQrPassModal: React.FC<VisitorQrPassModalProps> = ({
  isOpen,
  onClose,
  visit,
  onCheckOutComplete,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isScanningExit, setIsScanningExit] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    checkedOutAt?: string;
  } | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const activeTenant = storageService.getActiveTenant();
  const activeGate = storageService.getActiveGate();
  const activeSite = storageService.getActiveSite();

  // Generate high-resolution QR code whenever visit changes
  useEffect(() => {
    if (!visit) return;

    const payload = JSON.stringify({
      vms: 'ENTERPRISE_PASS_V1',
      token: visit.passToken,
      visitId: visit.id,
      visitor: visit.visitorName,
      company: visit.visitorCompany,
      badge: visit.badgeNumber || 'UNASSIGNED',
      siteId: visit.siteId,
      state: visit.state,
      expiresAt: visit.passTokenExpiresAt,
      checksum: `sha256:${visit.id.slice(-6)}-${visit.passToken.slice(-6)}`,
    });

    QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#123B5D',
        light: '#FFFFF0',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate pass QR code', err));
  }, [visit]);

  if (!isOpen || !visit) return null;

  const handleSimulateExitScan = () => {
    setIsScanningExit(true);
    setScanResult(null);

    setTimeout(() => {
      // Find suitable exit gate or use active gate
      const exitGate =
        storageService.getState().gates.find(
          (g) => g.siteId === visit.siteId && (g.type === 'EXIT_ONLY' || g.type === 'BIDIRECTIONAL')
        ) || activeGate;

      const res = storageService.checkOutVisit(visit.id, exitGate.id);
      setIsScanningExit(false);

      if (res.success) {
        setScanResult({
          success: true,
          message: `Exit turnstile barrier retracted! ${visit.visitorName} successfully checked out at ${exitGate.name}. Badge recorded as surrendered.`,
          checkedOutAt: new Date().toLocaleTimeString(),
        });
        if (onCheckOutComplete && res.visit) {
          onCheckOutComplete(res.visit);
        }
      } else {
        setScanResult({
          success: false,
          message: res.message,
        });
      }
    }, 850);
  };

  const handleCopyToken = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(visit.passToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `VMS-Exit-Pass-${visit.visitorName.replace(/\s+/g, '_')}-${visit.passToken}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  const isCheckedIn = visit.state === 'CHECKED_IN';
  const isCheckedOut = visit.state === 'CHECKED_OUT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 my-auto">
        {/* Top Header */}
        <div className="bg-[#123B5D] text-white px-6 py-4 flex items-center justify-between border-b border-[#0f304c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Confirmed Visitor Digital Pass & Exit QR</h2>
              <p className="text-[11px] text-teal-200">High-entropy optical token for turnstile fast exit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Exit Scan Live Feedback */}
          {scanResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in ${
                scanResult.success
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border-rose-300'
              }`}
            >
              {scanResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">
                  {scanResult.success ? 'Exit Gate Clearance Approved!' : 'Scan Validation Notice'}
                </div>
                <p className="mt-0.5 leading-relaxed">{scanResult.message}</p>
                {scanResult.checkedOutAt && (
                  <div className="text-[10px] text-emerald-700 mt-1 font-mono">
                    Timestamp: {scanResult.checkedOutAt} • Exit Gateway: {activeGate.name}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Digital Pass Credential Card */}
          <div
            id="printable-exit-pass"
            className="bg-gradient-to-b from-white to-slate-50 rounded-2xl border-2 border-slate-300 shadow-md p-5 relative overflow-hidden"
          >
            {/* Top Pass Strip */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0F766E]" />
                <span className="font-bold text-xs uppercase tracking-wider text-[#123B5D]">
                  {activeTenant.name}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  isCheckedIn
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : isCheckedOut
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-blue-100 text-blue-800 border-blue-300'
                }`}
              >
                {visit.state.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Visitor Details & Avatar */}
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                {visit.photoUrl ? (
                  <img src={visit.photoUrl} alt={visit.visitorName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-slate-700">
                    {visit.visitorName.charAt(0)}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base text-slate-900 leading-tight truncate">
                  {visit.visitorName}
                </h3>
                <p className="text-xs font-semibold text-teal-800 truncate">{visit.visitorCompany}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono text-slate-500">
                    Badge: <strong className="text-slate-800">{visit.badgeNumber || 'PENDING'}</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Zone: <strong className="text-slate-800">{visit.assignedZone || 'Main Lobby'}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Optical QR Code Box with Crosshairs */}
            <div className="bg-white rounded-xl border border-slate-300 p-4 flex flex-col items-center justify-center relative shadow-inner">
              {/* Corner crosshairs to indicate optical scanning area */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#0F766E]" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#0F766E]" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#0F766E]" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#0F766E]" />

              {qrDataUrl ? (
                <img
                  id="visitor-exit-pass-qr-image"
                  src={qrDataUrl}
                  alt={`QR Pass for ${visit.visitorName}`}
                  className="w-48 h-48 object-contain"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                  <QrCode className="w-12 h-12 animate-pulse" />
                </div>
              )}

              <div className="mt-2 text-center">
                <div className="font-mono text-xs font-bold text-[#123B5D] tracking-wider select-all">
                  {visit.passToken}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Scan at Exit Gate Turnstile optical reader for 1-second touchless departure.
                </div>
              </div>
            </div>

            {/* Metadata Footer */}
            <div className="mt-3 pt-2.5 border-t border-slate-200 grid grid-cols-2 gap-2 text-[10px] text-slate-600">
              <div>
                <span className="text-slate-400">Host Sponsor:</span>{' '}
                <strong className="text-slate-800">{visit.hostName}</strong>
              </div>
              <div>
                <span className="text-slate-400">Physical Site:</span>{' '}
                <strong className="text-slate-800">{visit.siteName}</strong>
              </div>
              <div>
                <span className="text-slate-400">Valid Start:</span>{' '}
                <span className="font-mono">{new Date(visit.scheduledStart).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-400">Valid End:</span>{' '}
                <span className="font-mono">{new Date(visit.scheduledEnd).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Quick Check-Out at Exit Gates Section */}
          <div className="bg-[#123B5D]/5 border border-[#123B5D]/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-[#0F766E]" />
                <h4 className="font-bold text-slate-900 text-xs">Exit Gate Turnstile Quick Scanner</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Gate: {activeGate.name}
              </span>
            </div>

            <p className="text-[11px] text-slate-600">
              {isCheckedIn
                ? 'Visitor is currently inside facility. Click below to simulate optical sensor scanning at exit turnstiles for immediate check-out.'
                : isCheckedOut
                ? 'Visitor has already checked out. Pass token has expired.'
                : 'Visitor is approved. Upon arrival, check in first at reception.'}
            </p>

            <button
              id="simulate-quick-checkout-scan-btn"
              onClick={handleSimulateExitScan}
              disabled={isScanningExit || !isCheckedIn}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer ${
                isCheckedIn
                  ? 'bg-[#0F766E] hover:bg-[#0c5e58] text-white'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isScanningExit ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Scanning Optical Sensor at {activeGate.name}...</span>
                </>
              ) : isCheckedIn ? (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Simulate Exit Gate Optical Scan (Quick Check-Out)</span>
                </>
              ) : isCheckedOut ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Visitor Already Checked Out</span>
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  <span>Check In Required Before Exit</span>
                </>
              )}
            </button>
          </div>

          {/* Pass Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyToken}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
                title="Copy raw pass token string"
              >
                {copiedToken ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>Copy Token</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadQr}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
                title="Download QR code image PNG"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Save PNG</span>
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-[#123B5D] hover:bg-[#0e2f4a] text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Pass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
