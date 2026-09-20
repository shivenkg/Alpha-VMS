import React, { useState } from 'react';
import {
  UserPlus,
  Camera,
  CheckCircle2,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Printer,
  Sparkles,
  Trash2,
  Check,
  Zap,
  Share2
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { VisitorCategory, Visit } from '../../types';
import { CameraCaptureModal } from './CameraCaptureModal';

interface WalkInViewProps {
  onCheckInComplete: (visit: Visit) => void;
  onOpenSharePreRegModal?: () => void;
}

export const WalkInView: React.FC<WalkInViewProps> = ({
  onCheckInComplete,
  onOpenSharePreRegModal,
}) => {
  const state = storageService.getState();
  const activeTenant = storageService.getActiveTenant();
  const activeSite = storageService.getActiveSite();
  const activeGate = storageService.getActiveGate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState<VisitorCategory>('BUSINESS_GUEST');
  const [documentType, setDocumentType] = useState<'DRIVERS_LICENSE' | 'PASSPORT' | 'NATIONAL_ID' | 'GOVERNMENT_BADGE'>('DRIVERS_LICENSE');
  const [documentNumber, setDocumentNumber] = useState('');
  const [hostUserId, setHostUserId] = useState(state.users[0]?.id || '');
  const [purpose, setPurpose] = useState('');
  const [hasNdaConsent, setHasNdaConsent] = useState(true);
  const [hasPrivacyConsent, setHasPrivacyConsent] = useState(true);
  const [instantCheckIn, setInstantCheckIn] = useState(true);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    visit: Visit;
    badgeNumber: string;
    autoPrinted: boolean;
  } | null>(null);

  const handleOpenLiveCamera = () => {
    setIsCameraOpen(true);
  };

  const handleFillDemo = () => {
    setFullName('Ananya Sharma');
    setEmail('ananya.sharma@tcs-digital.in');
    setPhoneNumber('+91 98201 88412');
    setCompany('TCS Digital Systems & Cyber Lab');
    setCategory('BUSINESS_GUEST');
    setDocumentType('NATIONAL_ID');
    setDocumentNumber('AADHAAR-8819-2048');
    setPurpose('Quarterly Autonomous Navigation Systems & Edge AI Review');
    setCapturedPhoto('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !company || !purpose) {
      alert('Please complete all mandatory visitor fields.');
      return;
    }

    setIsSubmitting(true);

    const scheduledStart = new Date().toISOString();
    const scheduledEnd = new Date(Date.now() + 28800000).toISOString(); // 8 hrs

    const result = storageService.createInvitation({
      visitorName: fullName,
      visitorEmail: email,
      visitorPhone: phoneNumber || '+1 (555) 000-0000',
      visitorCompany: company,
      visitorCategory: category,
      documentType,
      documentNumber: documentNumber || 'DOC-9999',
      hostUserId,
      siteId: activeSite.id,
      gateId: activeGate.id,
      purpose,
      scheduledStart,
      scheduledEnd,
      requiresSecurityEscort: category === 'CONTRACTOR',
      photoUrl: capturedPhoto || undefined,
    });

    let finalVisit = result.visit;
    let autoPrinted = false;

    // If instant check-in requested, perform check-in directly
    if (instantCheckIn) {
      // Auto-approve walk-in at reception desk
      finalVisit.approvalStatus.hostApproved = true;
      finalVisit.approvalStatus.securityApproved = true;
      finalVisit.state = 'APPROVED';

      const checkInRes = storageService.checkInVisit(finalVisit.id, activeGate.id);
      if (checkInRes.visit) {
        finalVisit = checkInRes.visit;
      }
      autoPrinted = !!checkInRes.autoPrinted;
    }

    setIsSubmitting(false);
    setSuccessResult({
      visit: finalVisit,
      badgeNumber: finalVisit.badgeNumber || 'ACME-2026-WLK1',
      autoPrinted,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-[#D8E1E8] shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#0F766E]" />
            <h1 className="text-lg font-bold text-[#172B3A]">Walk-In Visitor Registration</h1>
          </div>
          <p className="text-xs text-[#526575] mt-1">
            Capture guest details, document verification, NDA agreement, and print physical badge instantly at {activeGate.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSharePreRegModal && (
            <button
              id="walkin-share-prereg-btn"
              type="button"
              onClick={onOpenSharePreRegModal}
              className="bg-teal-50 text-teal-800 border border-teal-300 hover:bg-teal-100 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              title="Share self-registration link or show counter QR code to walk-in guest"
            >
              <Share2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Share Self-Reg Link / QR</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleFillDemo}
            className="bg-[#F4F7FA] text-[#123B5D] border border-[#D8E1E8] hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Prefill Demo Data
          </button>
        </div>
      </div>

      {successResult ? (
        <div className="bg-white p-6 rounded-xl border border-emerald-300 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-base font-bold text-[#172B3A]">Walk-In Registration & Check-In Complete!</h2>
            <p className="text-xs text-[#526575] mt-1">
              Visitor <span className="font-semibold text-[#172B3A]">{successResult.visit.visitorName}</span> is now recorded in system status <span className="font-bold text-teal-700">{successResult.visit.state}</span>.
            </p>
          </div>

          {/* Photo & Badge Summary */}
          <div className="bg-[#F4F7FA] p-4 rounded-xl border border-[#D8E1E8] max-w-md mx-auto text-xs space-y-3 text-left">
            <div className="flex items-center gap-4 pb-3 border-b border-[#D8E1E8]">
              <div className="w-14 h-14 rounded-xl bg-slate-200 border-2 border-teal-600/60 overflow-hidden flex-shrink-0 shadow-xs">
                {successResult.visit.photoUrl ? (
                  <img
                    src={successResult.visit.photoUrl}
                    alt={successResult.visit.visitorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 font-bold text-xs">
                    NO PHOTO
                  </div>
                )}
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-sm text-[#172B3A]">{successResult.visit.visitorName}</div>
                <div className="text-[#526575] text-[11px]">{successResult.visit.visitorCompany} • {successResult.visit.visitorCategory.replace(/_/g, ' ')}</div>
                <div className="text-[10px] text-teal-700 font-medium">Verified Identity Document</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div><span className="text-[#526575]">Assigned Badge:</span> <span className="font-mono font-bold text-[#123B5D] ml-1">{successResult.badgeNumber}</span></div>
              <div><span className="text-[#526575]">Pass Token:</span> <span className="font-mono text-teal-800 ml-1">{successResult.visit.passToken}</span></div>
              <div><span className="text-[#526575]">Assigned Zone:</span> <span className="text-slate-800 ml-1">{successResult.visit.assignedZone}</span></div>
              <div><span className="text-[#526575]">Station / Gate:</span> <span className="text-slate-800 ml-1">{activeGate.name}</span></div>
            </div>

            {/* Auto-Print Status Banner */}
            {successResult.autoPrinted ? (
              <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-[11px]">
                <Zap className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Auto-Print Executed:</strong> Badge pattern was automatically sent to the gate thermal printer!
                </span>
              </div>
            ) : (
              <div className="mt-2 p-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[10px]">
                Badge ready for manual physical printing or digital pass export.
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onCheckInComplete(successResult.visit)}
              className="bg-[#123B5D] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#0e2f4a] flex items-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>{successResult.autoPrinted ? 'View Printed Badge' : 'Print Badge & View Pass'}</span>
            </button>
            <button
              onClick={() => {
                setSuccessResult(null);
                setFullName('');
                setEmail('');
                setCompany('');
                setPurpose('');
                setCapturedPhoto(null);
              }}
              className="bg-[#F4F7FA] text-[#172B3A] border border-[#D8E1E8] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-100 transition"
            >
              Register Another Guest
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-[#D8E1E8] shadow-xs space-y-6 text-xs">
          {/* Section 1: Guest Personal Information */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-[#172B3A] uppercase tracking-wider border-b pb-1.5">
              1. Visitor Profile & Contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#172B3A] font-semibold mb-1">
                  Full Legal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[#172B3A] font-semibold mb-1">
                  Company / Organization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TCS Digital Systems"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[#172B3A] font-semibold mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="ananya.sharma@tcs-digital.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[#172B3A] font-semibold mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  placeholder="+91 98201 88412"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Identification & Category */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-[#172B3A] uppercase tracking-wider border-b pb-1.5">
              2. Classification & Government ID Verification
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[#172B3A] font-semibold mb-1">Visitor Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as VisitorCategory)}
                  className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="BUSINESS_GUEST">Business Guest</option>
                  <option value="CONTRACTOR">Contractor / Vendor</option>
                  <option value="INTERVIEW_CANDIDATE">Interview Candidate</option>
                  <option value="VIP_EXECUTIVE">VIP Executive</option>
                  <option value="REGULATORY_AUDITOR">Regulatory Auditor</option>
                  <option value="FACILITY_MAINTENANCE">Facility Maintenance</option>
                  <option value="DELIVERY_DISPATCH">Delivery Dispatch</option>
                </select>
              </div>

              <div>
                <label className="block text-[#172B3A] font-semibold mb-1">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="DRIVERS_LICENSE">Driver's License</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="NATIONAL_ID">National Identity Card</option>
                  <option value="GOVERNMENT_BADGE">Official Government Badge</option>
                </select>
              </div>

              <div>
                <label className="block text-[#172B3A] font-semibold mb-1">Document ID Number</label>
                <input
                  type="text"
                  placeholder="e.g. D8891240"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E]"
                />
                <p className="text-[10px] text-[#526575] mt-1">Will be masked as ••••-••••-XXXX</p>
              </div>
            </div>

            {/* Photo Capture Device Integration */}
            <div className="p-3.5 bg-[#F4F7FA] rounded-xl border border-[#D8E1E8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-200 border-2 border-[#D8E1E8] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs relative group">
                  {capturedPhoto ? (
                    <>
                      <img src={capturedPhoto} alt="Visitor capture" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    </>
                  ) : (
                    <Camera className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs text-[#172B3A] flex items-center gap-1.5">
                    <span>Visitor Photo ID Badge</span>
                    {capturedPhoto ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Check className="w-3 h-3" /> Attached
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Optional / Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#526575] mt-0.5">
                    Captured via live device camera; embedded onto printed thermal badge & digital turnstile gate verification.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {capturedPhoto && (
                  <button
                    type="button"
                    onClick={() => setCapturedPhoto(null)}
                    title="Remove Photo"
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 transition text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleOpenLiveCamera}
                  className="bg-[#0F766E] text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-[#0c5e58] flex items-center gap-1.5 transition shadow-xs"
                >
                  <Camera className="w-4 h-4" />
                  <span>{capturedPhoto ? 'Retake Photo' : 'Capture Live Photo'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Host & Purpose */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-[#172B3A] uppercase tracking-wider border-b pb-1.5">
              3. Host Employee & Visit Purpose
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#172B3A] font-semibold mb-1">Host Employee</label>
                <select
                  value={hostUserId}
                  onChange={(e) => setHostUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E]"
                >
                  {state.users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.departmentName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#172B3A] font-semibold mb-1">
                  Purpose of Visit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infrastructure audit and server rack repair"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Consents & Instant Check-In */}
          <div className="space-y-3 pt-2 border-t border-[#D8E1E8]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPrivacyConsent}
                onChange={(e) => setHasPrivacyConsent(e.target.checked)}
                className="rounded border-slate-300 text-[#0F766E] focus:ring-0"
              />
              <span className="text-slate-700">
                Visitor has reviewed and accepted the <strong>Facility Safety Notice & Privacy Policy</strong>.
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasNdaConsent}
                onChange={(e) => setHasNdaConsent(e.target.checked)}
                className="rounded border-slate-300 text-[#0F766E] focus:ring-0"
              />
              <span className="text-slate-700">
                Visitor has signed the <strong>Enterprise Non-Disclosure Agreement (NDA)</strong>.
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-[#123B5D]">
              <input
                type="checkbox"
                checked={instantCheckIn}
                onChange={(e) => setInstantCheckIn(e.target.checked)}
                className="rounded border-slate-300 text-[#0F766E] focus:ring-0"
              />
              <span>Check in immediately at {activeGate.name} & issue badge</span>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#123B5D] text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-[#0e2f4a] transition shadow-xs flex items-center gap-2"
            >
              <span>{instantCheckIn ? 'Register & Check In Visitor' : 'Register Walk-In Invitation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Live Device Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={(photo) => setCapturedPhoto(photo)}
      />
    </div>
  );
};
