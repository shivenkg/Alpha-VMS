import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Building2,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Share2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  Send,
  Lock,
  QrCode
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { VisitorCategory, NavViewId } from '../../types';

interface PublicPreRegistrationViewProps {
  onNavigateToApprovals?: () => void;
  onNavigateToDashboard?: () => void;
}

export const PublicPreRegistrationView: React.FC<PublicPreRegistrationViewProps> = ({
  onNavigateToApprovals,
  onNavigateToDashboard,
}) => {
  const state = storageService.getState();
  const activeTenant = storageService.getActiveTenant();
  const activeSite = storageService.getActiveSite();

  // Form State
  const [selectedTenantId, setSelectedTenantId] = useState(state.activeTenantId);
  const [selectedSiteId, setSelectedSiteId] = useState(state.activeSiteId);
  const [hostName, setHostName] = useState('Dr. Aris Thorne');
  const [hostDepartment, setHostDepartment] = useState('Engineering & R&D');
  const [hostEmail, setHostEmail] = useState('aris.thorne@jsalphasoft.enterprise');
  
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorCompany, setVisitorCompany] = useState('');
  const [visitorCategory, setVisitorCategory] = useState<VisitorCategory>('BUSINESS_GUEST');
  const [documentType, setDocumentType] = useState<'PASSPORT' | 'DRIVERS_LICENSE' | 'NATIONAL_ID'>('DRIVERS_LICENSE');
  const [documentNumber, setDocumentNumber] = useState('');

  // Date & Time
  const today = new Date().toISOString().split('T')[0];
  const [visitDate, setVisitDate] = useState(today);
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('17:00');
  const [purpose, setPurpose] = useState('');
  const [requiresEscort, setRequiresEscort] = useState(true);
  const [specialAccessNotes, setSpecialAccessNotes] = useState('');
  const [ndaAccepted, setNdaAccepted] = useState(true);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedVisit, setSubmittedVisit] = useState<{
    id: string;
    visitorName: string;
    passToken: string;
    scheduledDate: string;
    referenceCode: string;
  } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareQrDataUrl, setShareQrDataUrl] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);

  // Derive shareable URL
  const shareableUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?view=pre-register`
    : 'https://ais-vms.enterprise/?view=pre-register';

  // Generate QR code for mobile host pre-registration access
  useEffect(() => {
    QRCode.toDataURL(shareableUrl, {
      width: 220,
      margin: 2,
      color: { dark: '#123B5D', light: '#FFFFF0' },
    })
      .then((url) => setShareQrDataUrl(url))
      .catch((err) => console.error('Failed to generate share QR code', err));
  }, [shareableUrl]);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareableUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  const handleAutoFillDemo = () => {
    setVisitorName('Sneha Kulkarni');
    setVisitorEmail('sneha.kulkarni@wipro-solutions.com');
    setVisitorPhone('+91 98201 55420');
    setVisitorCompany('Wipro Digital Systems');
    setVisitorCategory('BUSINESS_GUEST');
    setDocumentType('NATIONAL_ID');
    setDocumentNumber('AADHAAR-8819-2048');
    setPurpose('Quarterly Architecture Review for Semiconductor Edge Controllers');
    setSpecialAccessNotes('Requires temporary guest high-speed Wi-Fi & Executive Conference Room badge clearance.');
    setRequiresEscort(true);
    setNdaAccepted(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!visitorName.trim() || !visitorEmail.trim() || !visitorCompany.trim() || !purpose.trim()) {
      alert('Please provide all mandatory fields: Visitor Name, Email, Organization, and Purpose of Visit.');
      return;
    }

    if (!ndaAccepted) {
      alert('Visitor must agree to the Enterprise NDA & Physical Security Regulations.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const scheduledStart = `${visitDate}T${startTime}:00Z`;
      const scheduledEnd = `${visitDate}T${endTime}:00Z`;

      const result = storageService.submitHostPreRegistration({
        tenantId: selectedTenantId,
        siteId: selectedSiteId,
        hostName: hostName.trim(),
        hostDepartment,
        hostEmail,
        visitorName: visitorName.trim(),
        visitorEmail: visitorEmail.trim(),
        visitorPhone: visitorPhone.trim(),
        visitorCompany: visitorCompany.trim(),
        visitorCategory,
        documentType,
        documentNumber: documentNumber.trim(),
        purpose: purpose.trim(),
        scheduledStart,
        scheduledEnd,
        requiresSecurityEscort: requiresEscort,
        specialAccessNotes: specialAccessNotes.trim(),
      });

      setIsSubmitting(false);

      if (result.success) {
        setSubmittedVisit({
          id: result.visit.id,
          visitorName: result.visit.visitorName,
          passToken: result.visit.passToken,
          scheduledDate: visitDate,
          referenceCode: `PREREG-${result.visit.id.slice(-6).toUpperCase()}`,
        });
      }
    }, 700);
  };

  const handleResetForm = () => {
    setSubmittedVisit(null);
    setVisitorName('');
    setVisitorEmail('');
    setVisitorPhone('');
    setVisitorCompany('');
    setPurpose('');
    setDocumentNumber('');
    setSpecialAccessNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Public Portal Banner & Sharing Bar */}
      <div className="bg-white rounded-2xl border border-[#D8E1E8] shadow-xs p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Share2 className="w-3 h-3 text-[#0F766E]" />
                Public-Facing Host View
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Endpoint: <code className="text-slate-700 font-semibold">?view=pre-register</code>
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#172B3A] mt-1.5 flex items-center gap-2">
              Enterprise Host Visitor Pre-Registration Portal
            </h1>
            <p className="text-xs text-[#526575] mt-1 max-w-3xl">
              Shared public portal allowing authorized company hosts, project sponsors, and business partners
              to submit guest pre-registrations directly into the site security approval queue.
            </p>
          </div>

          {/* Quick Actions / Shareable Link Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              id="copy-public-pre-registration-link-btn"
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#F4F7FA] hover:bg-slate-100 text-[#123B5D] border border-[#D8E1E8] flex items-center justify-center gap-2 transition"
              title="Copy shareable URL to clipboard"
            >
              {copySuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#526575]" />
                  <span>Copy Public URL</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0F766E] hover:bg-[#0c5e58] text-white flex items-center gap-2 transition shadow-xs"
              title="View mobile QR code for this pre-registration form"
            >
              <QrCode className="w-4 h-4 text-white" />
              <span>Mobile QR Link</span>
            </button>

            {onNavigateToDashboard && (
              <button
                onClick={onNavigateToDashboard}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 transition"
              >
                Back to Staff Console
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submission Success Confirmation Screen */}
      {submittedVisit ? (
        <div className="bg-white rounded-2xl border-2 border-teal-500 shadow-md p-8 max-w-2xl mx-auto text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-teal-50 border-2 border-teal-300 rounded-2xl flex items-center justify-center mx-auto text-[#0F766E]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 mb-2">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              STATUS: QUEUED FOR SECURITY APPROVAL
            </span>
            <h2 className="text-2xl font-bold text-[#172B3A]">
              Visitor Pre-Registration Submitted!
            </h2>
            <p className="text-xs text-[#526575] mt-1 max-w-md mx-auto">
              Pre-registration for <strong className="text-slate-900">{submittedVisit.visitorName}</strong> has been received
              and automatically populated in the Security & Department Approval Queue.
            </p>
          </div>

          {/* Reference Info Card */}
          <div className="bg-[#F4F7FA] border border-[#D8E1E8] rounded-xl p-4 text-left text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Pre-Registration Reference:</span>
              <span className="font-mono font-bold text-[#123B5D]">{submittedVisit.referenceCode}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Pass Token (Pre-Assigned):</span>
              <span className="font-mono font-bold text-teal-800">{submittedVisit.passToken}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Destination Site:</span>
              <span className="font-semibold text-slate-800">{activeSite.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Expected Arrival Date:</span>
              <span className="font-semibold text-slate-800">{submittedVisit.scheduledDate}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Once security clearance is approved, the visitor will receive an encrypted QR digital pass via email and SMS for fast touchless turnstile check-in.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onNavigateToApprovals && (
              <button
                id="view-in-approvals-queue-btn"
                onClick={onNavigateToApprovals}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#123B5D] text-white hover:bg-[#0e2f4a] flex items-center justify-center gap-2 transition shadow-sm"
              >
                <span>View in Approval Queue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleResetForm}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition"
            >
              Submit Another Visitor
            </button>
          </div>
        </div>
      ) : (
        /* Pre-Registration Form Grid */
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Form Body: 8 Columns */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#D8E1E8] shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-base font-bold text-[#172B3A]">Visitor & Visit Logistics</h2>
                <p className="text-xs text-[#526575]">
                  Please complete the visitor details accurately for facility badging and physical security verification.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAutoFillDemo}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 flex items-center gap-1.5 transition cursor-pointer"
                title="Populate realistic enterprise consultant details"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Auto-Fill Demo Guest</span>
              </button>
            </div>

            {/* Section 1: Host Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[#123B5D]" />
                1. Sponsoring Host Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[#526575] font-semibold mb-1">Host Employee Name *</label>
                  <input
                    type="text"
                    required
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Sengupta"
                    className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#123B5D]"
                  />
                </div>

                <div>
                  <label className="block text-[#526575] font-semibold mb-1">Host Department *</label>
                  <select
                    value={hostDepartment}
                    onChange={(e) => setHostDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#123B5D]"
                  >
                    <option value="Engineering & R&D">Engineering & R&D</option>
                    <option value="Physical Security">Physical Security</option>
                    <option value="Executive Management">Executive Management</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Facilities & Operations">Facilities & Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#526575] font-semibold mb-1">Host Work Email *</label>
                  <input
                    type="email"
                    required
                    value={hostEmail}
                    onChange={(e) => setHostEmail(e.target.value)}
                    placeholder="rajesh.sengupta@tata-eng.in"
                    className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#123B5D]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Visitor Profile */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#0F766E]" />
                2. Visitor Identity & Contact
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[#526575] font-semibold mb-1">Visitor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="e.g. Sneha Kulkarni"
                    className="w-full px-3 py-2 bg-white border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#123B5D]"
                  />
                </div>

                <div>
                  <label className="block text-[#526575] font-semibold mb-1">Organization / Company *</label>
                  <input
                    type="text"
                    required
                    value={visitorCompany}
                    onChange={(e) => setVisitorCompany(e.target.value)}
                    placeholder="e.g. Wipro Digital Systems"
                    className="w-full px-3 py-2 bg-white border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#123B5D]"
                  />
                </div>

                <div>
                  <label className="block text-[#526575] font-semibold mb-1">Visitor Email Address *</label>
                  <input
                    type="email"
                    required
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    placeholder="visitor@wipro-solutions.com"
                    className="w-full px-3 py-2 bg-white border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#123B5D]"
                  />
                </div>

                <div>
                  <label className="block text-[#526575] font-semibold mb-1">Mobile Phone (For Pass SMS/WhatsApp)</label>
                  <input
                    type="tel"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    placeholder="+91 98201 55420"
                    className="w-full px-3 py-2 bg-white border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#123B5D]"
                  />
                </div>

                <div>
                  <label className="block text-[#526575] font-semibold mb-1">Visitor Category *</label>
                  <select
                    value={visitorCategory}
                    onChange={(e) => setVisitorCategory(e.target.value as VisitorCategory)}
                    className="w-full px-3 py-2 bg-white border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#123B5D]"
                  >
                    <option value="BUSINESS_GUEST">Business Guest / Partner</option>
                    <option value="CONTRACTOR">Contractor / Specialist</option>
                    <option value="VIP_EXECUTIVE">VIP Executive</option>
                    <option value="REGULATORY_AUDITOR">Regulatory / Compliance Auditor</option>
                    <option value="VENDOR">Vendor / Supplier</option>
                    <option value="INTERVIEW_CANDIDATE">Interview Candidate</option>
                    <option value="FACILITY_MAINTENANCE">Facility Maintenance</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#526575] font-semibold mb-1">ID Document Type</label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#123B5D]"
                    >
                      <option value="NATIONAL_ID">Aadhaar / National ID</option>
                      <option value="DRIVERS_LICENSE">Driver's License</option>
                      <option value="PASSPORT">Passport</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#526575] font-semibold mb-1">ID Number (Masked)</label>
                    <input
                      type="text"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      placeholder="e.g. AADHAAR / DL-KA01"
                      className="w-full px-3 py-2 bg-white border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#123B5D]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Schedule & Purpose */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#123B5D]" />
                3. Visit Date, Window & Purpose
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[#526575] font-semibold mb-1">Visit Date *</label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#123B5D]"
                  />
                </div>

                <div>
                  <label className="block text-[#526575] font-semibold mb-1">Arrival Window (Start) *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#123B5D]"
                  />
                </div>

                <div>
                  <label className="block text-[#526575] font-semibold mb-1">Expected Departure (End) *</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#123B5D]"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-[#526575] font-semibold mb-1">Detailed Purpose of Visit *</label>
                <textarea
                  rows={2}
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="State the commercial or technical business objective of this visit..."
                  className="w-full px-3 py-2 bg-white border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#123B5D]"
                />
              </div>

              <div className="text-xs">
                <label className="block text-[#526575] font-semibold mb-1">Special Facility Access Notes</label>
                <input
                  type="text"
                  value={specialAccessNotes}
                  onChange={(e) => setSpecialAccessNotes(e.target.value)}
                  placeholder="e.g. Loading dock vehicle entry, Server Room B escort clearance, Wheelchair access"
                  className="w-full px-3 py-2 bg-white border border-[#D8E1E8] rounded-lg focus:outline-none focus:border-[#123B5D]"
                />
              </div>
            </div>

            {/* Section 4: Physical Security & Legal Pre-Consent */}
            <div className="pt-2 border-t border-slate-100 space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="escort-required-checkbox"
                  checked={requiresEscort}
                  onChange={(e) => setRequiresEscort(e.target.checked)}
                  className="rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E] w-4 h-4"
                />
                <label htmlFor="escort-required-checkbox" className="font-semibold text-slate-800 cursor-pointer">
                  Mandatory Security/Host Escort Required while inside building premises
                </label>
              </div>

              <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="nda-accepted-checkbox"
                  required
                  checked={ndaAccepted}
                  onChange={(e) => setNdaAccepted(e.target.checked)}
                  className="rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E] w-4 h-4 mt-0.5"
                />
                <label htmlFor="nda-accepted-checkbox" className="text-slate-700 leading-relaxed cursor-pointer text-[11px]">
                  <strong>Compliance & NDA Affirmation:</strong> I certify that this guest has a legitimate business need
                  to access {activeSite.name} and agrees to comply with the Zero-Trust Facility Security Policy, proprietary information confidentiality agreement, and designated emergency evacuation procedures.
                </label>
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-3">
              <button
                id="submit-pre-registration-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#123B5D] hover:bg-[#0e2f4a] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Submitting to Approval Queue...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-teal-300" />
                    <span>Submit Pre-Registration to Approval Queue</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Sidebar Info Card: 4 Columns */}
          <div className="lg:col-span-4 space-y-4">
            {/* Facility Context Card */}
            <div className="bg-white rounded-2xl border border-[#D8E1E8] shadow-xs p-5 space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0F766E]" />
                Facility & Tenant Scope
              </h3>

              <div className="space-y-2 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px]">Enterprise Organization</span>
                  <strong className="text-slate-900">{activeTenant.name} ({activeTenant.code})</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Target Site / Campus</span>
                  <strong className="text-slate-900">{activeSite.name}</strong>
                  <div className="text-[11px] text-slate-500">{activeSite.address}</div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Security Approval Level</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <ShieldCheck className="w-3 h-3 text-amber-600" />
                    Physical Security Review Mandatory
                  </span>
                </div>
              </div>
            </div>

            {/* Workflow Step Guide */}
            <div className="bg-[#F4F7FA] rounded-2xl border border-[#D8E1E8] p-5 space-y-3 text-xs">
              <h4 className="font-bold text-[#172B3A] text-xs uppercase tracking-wider">
                Pre-Registration Lifecycle
              </h4>

              <ol className="space-y-2.5 text-slate-600 text-[11px]">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#123B5D] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900">Host Submission:</strong> Host completes this form with verified visitor details.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900">Security Approval Queue:</strong> Security officers review watchlist and approve zone clearance.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900">Digital Pass QR Delivery:</strong> Confirmed visitor receives pass token for touchless check-in and quick exit scan.
                  </div>
                </li>
              </ol>
            </div>

            {/* Mobile Scan Card */}
            <div className="bg-white rounded-2xl border border-[#D8E1E8] shadow-xs p-5 text-center space-y-3">
              <div className="text-xs font-bold text-slate-900">Open on Mobile Device</div>
              <p className="text-[11px] text-slate-500">
                Scan this QR code with any smartphone camera to open this pre-registration portal on the go:
              </p>
              {shareQrDataUrl ? (
                <div className="p-2 bg-white inline-block rounded-xl border border-slate-200 shadow-inner">
                  <img src={shareQrDataUrl} alt="Public Portal QR" className="w-36 h-36 mx-auto" />
                </div>
              ) : (
                <div className="w-36 h-36 bg-slate-100 mx-auto rounded-xl flex items-center justify-center text-slate-400">
                  <QrCode className="w-8 h-8 animate-pulse" />
                </div>
              )}
              <div className="text-[10px] font-mono text-slate-400 break-all">
                {shareableUrl}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 p-6 space-y-4 text-center">
            <div className="w-12 h-12 bg-teal-50 text-[#0F766E] rounded-xl flex items-center justify-center mx-auto">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#172B3A]">
              Shareable Host Pre-Registration Portal
            </h3>
            <p className="text-xs text-[#526575]">
              Provide this public URL or QR code to company hosts, project managers, and partners to submit pre-registrations directly.
            </p>

            {shareQrDataUrl && (
              <div className="p-3 bg-white inline-block rounded-xl border border-slate-200 shadow-sm mx-auto">
                <img src={shareQrDataUrl} alt="Pre-Reg QR" className="w-44 h-44 mx-auto" />
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-left text-xs font-mono text-slate-700 break-all select-all">
              {shareableUrl}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2 rounded-xl bg-[#123B5D] text-white text-xs font-bold hover:bg-[#0e2f4a] transition flex items-center justify-center gap-1.5"
              >
                {copySuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
