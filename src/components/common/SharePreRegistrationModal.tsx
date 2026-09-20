import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  MessageSquare,
  Mail,
  Building,
  User,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { JSAlphaSoftLogo } from './JSAlphaSoftLogo';

interface SharePreRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPublicPreRegister?: () => void;
}

export const SharePreRegistrationModal: React.FC<SharePreRegistrationModalProps> = ({
  isOpen,
  onClose,
  onNavigateToPublicPreRegister,
}) => {
  const state = storageService.getState();
  const activeTenant = storageService.getActiveTenant();
  const activeSite = storageService.getActiveSite();
  const activeUser = storageService.getActiveUser();

  const [selectedHostId, setSelectedHostId] = useState<string>(
    activeUser.role === 'HOST_EMPLOYEE' ? activeUser.id : 'usr-rajesh'
  );
  const [copied, setCopied] = useState(false);
  const [qrZoom, setQrZoom] = useState(false);

  if (!isOpen) return null;

  const hostUser = state.users.find((u) => u.id === selectedHostId) || state.users[0];

  // Construct shareable pre-registration URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vms.jsalphasoft.com';
  const preRegUrl = `${origin}/?view=pre-register&tenant=${activeTenant.id}&site=${activeSite.id}&host=${encodeURIComponent(
    hostUser.name
  )}&hostEmail=${encodeURIComponent(hostUser.email)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(preRegUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappMessage = encodeURIComponent(
    `Dear Guest, welcome to ${activeTenant.name} at ${activeSite.name}.\n\nPlease complete your mandatory visitor pre-registration before arriving to fast-track security clearance and receive your digital badge:\n${preRegUrl}\n\nHost Contact: ${hostUser.name} (${hostUser.email})`
  );

  const emailSubject = encodeURIComponent(
    `Visitor Pre-Registration Invitation | ${activeTenant.name} - ${activeSite.name}`
  );
  const emailBody = encodeURIComponent(
    `Dear Guest,\n\nYou are invited to visit ${activeTenant.name} at ${activeSite.name}.\n\nTo ensure a seamless, zero-trust arrival and fast-track entry badge issuance, please self-register using our secure visitor portal link below:\n\n${preRegUrl}\n\nHost: ${hostUser.name} (${hostUser.departmentName})\nLocation: ${activeSite.address}\n\nSecurity Notice: Please carry a valid Government Photo ID (Aadhaar / Passport / Driver's License) for on-site verification.\n\nWarm regards,\n${activeTenant.name} Reception & Facility Security`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#123B5D] px-6 py-4 flex items-center justify-between text-white border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-300">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Share Visitor Pre-Registration Link
              </h2>
              <p className="text-xs text-slate-300">
                Provide self-service link for guest pre-clearance and fast-track badge issuance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#172B3A]">
          {/* Target Host Selection */}
          <div className="bg-[#F4F7FA] p-3.5 rounded-xl border border-[#D8E1E8] space-y-2">
            <label className="block text-[11px] font-bold text-[#172B3A] uppercase tracking-wider">
              Assigned Host Employee
            </label>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600 shrink-0" />
              <select
                value={selectedHostId}
                onChange={(e) => setSelectedHostId(e.target.value)}
                className="w-full bg-white border border-[#D8E1E8] rounded-lg px-3 py-2 text-xs font-medium text-[#172B3A] focus:outline-none focus:border-[#123B5D]"
              >
                {state.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.departmentName} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#526575]">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Target Facility: <strong>{activeSite.name}</strong> ({activeTenant.name})
              </span>
            </div>
          </div>

          {/* Link Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-[#172B3A] uppercase tracking-wider">
                Public Self-Registration Link
              </label>
              {copied && (
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Copied to clipboard!
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-2.5">
              <input
                type="text"
                readOnly
                value={preRegUrl}
                className="w-full bg-transparent font-mono text-[11px] text-[#1E293B] focus:outline-none select-all"
              />
              <button
                id="copy-prereg-link-btn"
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#123B5D] text-white hover:bg-[#0F766E]'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Sharing Channels Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* WhatsApp Share */}
            <a
              href={`https://api.whatsapp.com/send?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 transition text-[#172B3A]"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-emerald-950 text-xs flex items-center gap-1">
                  <span>Share via WhatsApp</span>
                  <ExternalLink className="w-3 h-3 text-emerald-700" />
                </div>
                <div className="text-[11px] text-emerald-800 truncate">
                  Send pre-composed invite message
                </div>
              </div>
            </a>

            {/* Email Share */}
            <a
              href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
              className="flex items-center gap-3 p-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 transition text-[#172B3A]"
            >
              <div className="w-9 h-9 rounded-lg bg-[#123B5D] text-white flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-blue-950 text-xs flex items-center gap-1">
                  <span>Share via Email</span>
                  <ExternalLink className="w-3 h-3 text-blue-700" />
                </div>
                <div className="text-[11px] text-blue-800 truncate">
                  Launch mail client with details
                </div>
              </div>
            </a>
          </div>

          {/* Reception Counter QR Code (Scan to Self-Register) */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row items-center gap-4">
            <div
              onClick={() => setQrZoom(!qrZoom)}
              className="w-28 h-28 bg-white p-2 rounded-xl border border-amber-300 shadow-xs flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition"
              title="Click to zoom QR code for visitor counter scanning"
            >
              {/* Responsive SVG QR Code Simulation */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect width="100" height="100" fill="white" />
                {/* Corner markers */}
                <rect x="5" y="5" width="28" height="28" fill="#123B5D" rx="2" />
                <rect x="9" y="9" width="20" height="20" fill="white" />
                <rect x="13" y="13" width="12" height="12" fill="#123B5D" />

                <rect x="67" y="5" width="28" height="28" fill="#123B5D" rx="2" />
                <rect x="71" y="9" width="20" height="20" fill="white" />
                <rect x="75" y="13" width="12" height="12" fill="#123B5D" />

                <rect x="5" y="67" width="28" height="28" fill="#123B5D" rx="2" />
                <rect x="9" y="71" width="20" height="20" fill="white" />
                <rect x="13" y="75" width="12" height="12" fill="#123B5D" />

                {/* Inner simulated data clusters */}
                <rect x="38" y="10" width="8" height="8" fill="#123B5D" />
                <rect x="50" y="15" width="10" height="6" fill="#123B5D" />
                <rect x="38" y="24" width="6" height="12" fill="#123B5D" />
                <rect x="48" y="36" width="14" height="6" fill="#EA580C" />
                <rect x="10" y="42" width="6" height="16" fill="#123B5D" />
                <rect x="22" y="48" width="12" height="8" fill="#123B5D" />
                <rect x="40" y="52" width="12" height="12" fill="#123B5D" />
                <rect x="68" y="42" width="14" height="8" fill="#123B5D" />
                <rect x="84" y="54" width="8" height="14" fill="#EA580C" />
                <rect x="68" y="68" width="10" height="10" fill="#123B5D" />
                <rect x="82" y="72" width="10" height="8" fill="#123B5D" />
                <rect x="40" y="74" width="18" height="6" fill="#123B5D" />
                <rect x="52" y="84" width="12" height="8" fill="#123B5D" />
              </svg>
            </div>
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                <Smartphone className="w-4 h-4 text-amber-700" />
                <span>On-Site Guest Counter QR Code</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Front desk staff can present this screen to walk-in visitors. Guests can scan with any camera phone to complete pre-registration instantly without touching the counter keyboard.
              </p>
              <div className="text-[10px] text-amber-700 font-mono">
                Self-Registration URL pre-configured with active facility context
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-[#F4F7FA] px-6 py-3.5 border-t border-[#D8E1E8] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <JSAlphaSoftLogo variant="icon" size="sm" />
            <span className="text-[11px] text-slate-500 font-medium">
              JS AlphaSoft Secure Link Dispatcher
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onNavigateToPublicPreRegister && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToPublicPreRegister();
                }}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#172B3A] font-semibold hover:bg-slate-50 transition text-xs flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#526575]" />
                <span>Test / Open Public Form</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-[#123B5D] text-white font-semibold hover:bg-[#0F766E] transition text-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
