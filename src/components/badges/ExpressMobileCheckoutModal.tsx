import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  CheckCircle2,
  X,
  Scan,
  Shield,
  Clock,
  Building,
  User,
  AlertCircle,
  ArrowRight,
  LogOut,
  Sparkles,
  Wifi,
  BatteryMedium,
  Check
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Visit } from '../../types';
import { JSAlphaSoftLogo } from '../common/JSAlphaSoftLogo';

interface ExpressMobileCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Visit | null;
  onSuccess?: () => void;
}

export const ExpressMobileCheckoutModal: React.FC<ExpressMobileCheckoutModalProps> = ({
  isOpen,
  onClose,
  visit,
  onSuccess,
}) => {
  const [scanStep, setScanStep] = useState<'scanning' | 'scanned' | 'completed'>('scanning');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [checkoutMessage, setCheckoutMessage] = useState('');

  const activeTenant = storageService.getActiveTenant();
  const activeSite = storageService.getActiveSite();

  useEffect(() => {
    if (isOpen) {
      setScanStep('scanning');
      setIsProcessing(false);
      setCheckoutMessage('');
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      // Simulate instantaneous mobile camera detection of the dynamic QR code
      const timer = setTimeout(() => {
        setScanStep('scanned');
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [isOpen, visit]);

  if (!isOpen || !visit) return null;

  const handleConfirmCheckout = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const exitGate =
        storageService.getState().gates.find(
          (g) => g.siteId === visit.siteId && (g.type === 'EXIT_ONLY' || g.type === 'BIDIRECTIONAL')
        ) || storageService.getActiveGate();

      const res = storageService.checkOutVisit(visit.id, exitGate.id);
      setIsProcessing(false);

      if (res.success) {
        setScanStep('completed');
        setCheckoutMessage(
          `Express touchless check-out approved! Host (${visit.hostName}) notified of departure. Turnstile Gate [${exitGate.name}] unlatched.`
        );
        if (onSuccess) onSuccess();
      } else {
        setCheckoutMessage(res.message);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-900 rounded-3xl max-w-sm w-full border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col text-white font-sans relative">
        {/* Mobile Phone Status Bar */}
        <div className="bg-slate-950 px-5 py-2.5 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800">
          <span className="font-semibold text-[11px] text-slate-200">{currentTime}</span>
          <div className="w-16 h-3.5 bg-black rounded-full mx-auto border border-slate-800"></div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4" />
          </div>
        </div>

        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="absolute top-11 right-3 z-10 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-slate-300 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mobile Screen Header */}
        <div className="bg-[#123B5D] px-5 py-3 border-b border-teal-500/30 flex items-center gap-2">
          <JSAlphaSoftLogo variant="icon" size="sm" />
          <div>
            <div className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Express Mobile Exit</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 border border-orange-400/30">
                Touchless
              </span>
            </div>
            <p className="text-[10px] text-slate-300">{activeTenant.name}</p>
          </div>
        </div>

        {/* Mobile Screen Content */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4 min-h-[380px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-xs">
          {scanStep === 'scanning' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-8">
              <div className="relative w-36 h-36 border-2 border-dashed border-teal-400/70 rounded-2xl flex items-center justify-center p-4 bg-teal-950/20 animate-pulse">
                <Scan className="w-16 h-16 text-teal-400" />
                <div className="absolute inset-x-2 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-teal-300 to-transparent animate-bounce"></div>
              </div>
              <p className="font-semibold text-sm text-slate-200">
                Aligning Mobile Scanner with Badge QR...
              </p>
              <p className="text-[11px] text-slate-400">
                Reading cryptographic touchless check-out token
              </p>
            </div>
          )}

          {scanStep === 'scanned' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-bold text-[11px]">Badge QR Verified • Touchless Exit Ready</span>
              </div>

              {/* Guest Card */}
              <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 space-y-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-700/40 border border-teal-500/50 flex items-center justify-center text-teal-200 font-bold text-lg">
                    {visit.visitorName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{visit.visitorName}</h3>
                    <p className="text-[11px] text-teal-300 font-medium">{visit.visitorCompany}</p>
                    <span className="text-[10px] font-mono text-slate-400">
                      Badge: {visit.badgeNumber || 'TATA-BLR-0081'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/80 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Host:</span>
                    <span className="font-semibold text-slate-200 truncate block">{visit.hostName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Facility:</span>
                    <span className="font-semibold text-slate-200 truncate block">{activeSite.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Check-In Time:</span>
                    <span className="font-semibold text-slate-200 block font-mono">
                      {new Date(visit.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status:</span>
                    <span className="font-bold text-amber-400 block">{visit.state}</span>
                  </div>
                </div>
              </div>

              {/* Check-Out Action Button */}
              <div className="space-y-2 pt-2">
                <button
                  id="confirm-express-checkout-btn"
                  onClick={handleConfirmCheckout}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition cursor-pointer"
                >
                  {isProcessing ? (
                    <span>Deactivating Badge & Clearing Exit...</span>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Confirm Rapid Touchless Check-Out</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-slate-400">
                  No receptionist required • Turnstile release signal dispatched automatically
                </p>
              </div>
            </div>
          )}

          {scanStep === 'completed' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/30">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <h3 className="font-bold text-base text-white">Exit Clearance Granted!</h3>
                <p className="text-xs text-emerald-300 font-semibold mt-1">
                  Badge #{visit.badgeNumber || 'TATA-BLR-0081'} Successfully Deactivated
                </p>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-[11px] text-slate-300 text-left space-y-1 w-full">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Exit Timestamp:</span>
                  <span className="font-mono text-white font-semibold">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Host Alert:</span>
                  <span className="text-emerald-400 font-semibold">Dispatched (SMS/Email/Slack)</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Audit Trail:</span>
                  <span className="text-teal-400 font-mono">EXPRESS_EXIT_VERIFIED</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Mobile Phone Home Indicator */}
        <div className="bg-slate-950 py-2 flex justify-center border-t border-slate-800">
          <div className="w-28 h-1 bg-slate-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
