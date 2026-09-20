import React, { useState } from 'react';
import {
  QrCode,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Printer,
  Mail,
  Shield,
  Download
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Visit, VisitorProfile } from '../../types';
import { VisitorQrPassModal } from '../common/VisitorQrPassModal';

interface InvitationsViewProps {
  initialVisitor?: VisitorProfile | null;
  onSelectVisitForBadge: (visit: Visit) => void;
}

export const InvitationsView: React.FC<InvitationsViewProps> = ({
  initialVisitor,
  onSelectVisitForBadge,
}) => {
  const state = storageService.getState();
  const activeSite = storageService.getActiveSite();
  const activeGate = storageService.getActiveGate();
  const activeUser = storageService.getActiveUser();

  const [isModalOpen, setIsModalOpen] = useState(!!initialVisitor);
  const [selectedPassVisit, setSelectedPassVisit] = useState<Visit | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Form state
  const [name, setName] = useState(initialVisitor?.fullName || '');
  const [email, setEmail] = useState(initialVisitor?.email || '');
  const [company, setCompany] = useState(initialVisitor?.company || '');
  const [phone, setPhone] = useState(initialVisitor?.phoneNumber || '');
  const [category, setCategory] = useState(initialVisitor?.category || 'BUSINESS_GUEST');
  const [hostId, setHostId] = useState(activeUser.id);
  const [purpose, setPurpose] = useState('');
  const [scheduledDate, setScheduledDate] = useState('2026-09-21');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const siteVisits = state.visits.filter((v) => v.siteId === state.activeSiteId);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !company || !purpose) {
      alert('Please fill out all required fields');
      return;
    }

    const scheduledStart = `${scheduledDate}T${startTime}:00Z`;
    const scheduledEnd = `${scheduledDate}T${endTime}:00Z`;

    const res = storageService.createInvitation({
      visitorName: name,
      visitorEmail: email,
      visitorPhone: phone || '+1 (555) 000-0000',
      visitorCompany: company,
      visitorCategory: category as any,
      documentType: 'DRIVERS_LICENSE',
      documentNumber: 'DOC-8812',
      hostUserId: hostId,
      siteId: activeSite.id,
      gateId: activeGate.id,
      purpose,
      scheduledStart,
      scheduledEnd,
      requiresSecurityEscort: false,
    });

    setIsModalOpen(false);
    setSelectedPassVisit(res.visit);
  };

  const handleCopyPassLink = (token: string) => {
    navigator.clipboard.writeText(`https://vms.acme-corp.com/pass/${token}`);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#D8E1E8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#0F766E]" />
            <h1 className="text-lg font-bold text-[#172B3A]">Visitor Invitations & Digital Passes</h1>
          </div>
          <p className="text-xs text-[#526575] mt-1">
            Generate cryptographic, time-limited digital QR visitor passes for pre-scheduled corporate visits.
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setEmail('');
            setCompany('');
            setPurpose('');
            setIsModalOpen(true);
          }}
          className="bg-[#123B5D] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#0e2f4a] flex items-center gap-1.5 transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create New Invitation
        </button>
      </div>

      {/* Invitations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {siteVisits.map((v) => (
          <div
            key={v.id}
            className="bg-white rounded-xl border border-[#D8E1E8] p-4 shadow-xs hover:border-slate-400 transition space-y-3 text-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-[#172B3A] text-sm">{v.visitorName}</h3>
                  <p className="text-[11px] text-[#526575]">{v.visitorCompany}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    v.state === 'CHECKED_IN'
                      ? 'bg-teal-50 text-teal-800 border-teal-200'
                      : v.state === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : v.state === 'PENDING_APPROVAL'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {v.state}
                </span>
              </div>

              <div className="mt-3 bg-[#F4F7FA] p-2.5 rounded-lg border border-[#D8E1E8] space-y-1 text-[11px]">
                <div><span className="text-[#526575]">Pass Token:</span> <span className="font-mono font-bold text-teal-900">{v.passToken}</span></div>
                <div><span className="text-[#526575]">Host:</span> {v.hostName} ({v.departmentName})</div>
                <div><span className="text-[#526575]">Date:</span> {new Date(v.scheduledStart).toLocaleDateString()}</div>
                <div><span className="text-[#526575]">Window:</span> {new Date(v.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(v.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <button
                onClick={() => setSelectedPassVisit(v)}
                className="flex-1 bg-[#0F766E] text-white py-1.5 rounded font-semibold hover:bg-[#0c5e58] flex items-center justify-center gap-1"
              >
                <QrCode className="w-3.5 h-3.5" />
                View QR Pass
              </button>
              <button
                onClick={() => onSelectVisitForBadge(v)}
                title="Print Badge"
                className="p-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmed Visitor Digital Pass & Quick Exit QR Modal */}
      <VisitorQrPassModal
        isOpen={Boolean(selectedPassVisit)}
        onClose={() => setSelectedPassVisit(null)}
        visit={selectedPassVisit}
        onCheckOutComplete={() => setSelectedPassVisit(null)}
      />

      {/* Create Invitation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#D8E1E8] shadow-xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-sm font-bold text-[#172B3A]">Create Visitor Invitation</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#172B3A] font-semibold mb-1">Visitor Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F4F7FA] border border-[#D8E1E8] rounded focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="block text-[#172B3A] font-semibold mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F4F7FA] border border-[#D8E1E8] rounded focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#172B3A] font-semibold mb-1">Visitor Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F4F7FA] border border-[#D8E1E8] rounded focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="block text-[#172B3A] font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-[#F4F7FA] border border-[#D8E1E8] rounded focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="BUSINESS_GUEST">Business Guest</option>
                    <option value="CONTRACTOR">Contractor</option>
                    <option value="VIP_EXECUTIVE">VIP Executive</option>
                    <option value="REGULATORY_AUDITOR">Regulatory Auditor</option>
                    <option value="INTERVIEW_CANDIDATE">Interview Candidate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#172B3A] font-semibold mb-1">Host Employee</label>
                <select
                  value={hostId}
                  onChange={(e) => setHostId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#F4F7FA] border border-[#D8E1E8] rounded focus:outline-none focus:border-[#0F766E]"
                >
                  {state.users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.departmentName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#172B3A] font-semibold mb-1">Purpose of Visit *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Executive Board Meeting"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#F4F7FA] border border-[#D8E1E8] rounded focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#172B3A] font-semibold mb-1">Visit Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-2 py-1 bg-[#F4F7FA] border border-[#D8E1E8] rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#172B3A] font-semibold mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2 py-1 bg-[#F4F7FA] border border-[#D8E1E8] rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#172B3A] font-semibold mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2 py-1 bg-[#F4F7FA] border border-[#D8E1E8] rounded text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#123B5D] text-white px-4 py-1.5 rounded font-bold hover:bg-[#0e2f4a]"
                >
                  Generate Invitation & Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
