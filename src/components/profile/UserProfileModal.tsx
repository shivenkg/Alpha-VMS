import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Bell,
  MessageSquare,
  Mail,
  Smartphone,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Shield,
  Save,
  Send,
  Building,
  Sliders
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { HostNotificationSettings, AppUser } from '../../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const activeUser = storageService.getActiveUser();
  const activeTenant = storageService.getActiveTenant();

  const [activeTab, setActiveTab] = useState<'notifications' | 'profile'>('notifications');

  // Form states for notification settings
  const [enableSms, setEnableSms] = useState(false);
  const [smsPhoneNumber, setSmsPhoneNumber] = useState('');
  const [enableEmail, setEnableEmail] = useState(true);
  const [alertEmail, setAlertEmail] = useState('');
  const [enableSlack, setEnableSlack] = useState(false);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [slackChannel, setSlackChannel] = useState('#visitor-alerts');

  // Trigger toggles
  const [alertOnArrival, setAlertOnArrival] = useState(true);
  const [alertOnCheckOut, setAlertOnCheckOut] = useState(false);
  const [alertOnPendingApproval, setAlertOnPendingApproval] = useState(true);

  // Profile fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Feedbacks
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    channelsTriggered: string[];
    previews: {
      sms?: string;
      email?: { subject: string; body: string };
      slack?: { channel: string; message: string };
    };
  } | null>(null);

  useEffect(() => {
    if (isOpen && activeUser) {
      const notif = activeUser.notificationSettings || {
        enableSms: true,
        smsPhoneNumber: activeUser.phoneNumber || '+91 98206 66006',
        enableEmail: true,
        alertEmail: activeUser.email,
        enableSlack: true,
        slackWebhookUrl: 'https://hooks.slack.com/services/T00/B00/visitor-alerts',
        slackChannel: '#engineering-visitor-alerts',
        alertOnArrival: true,
        alertOnCheckOut: false,
        alertOnPendingApproval: true,
      };

      setEnableSms(notif.enableSms ?? true);
      setSmsPhoneNumber(notif.smsPhoneNumber || activeUser.phoneNumber || '+91 98206 66006');
      setEnableEmail(notif.enableEmail ?? true);
      setAlertEmail(notif.alertEmail || activeUser.email);
      setEnableSlack(notif.enableSlack ?? false);
      setSlackWebhookUrl(notif.slackWebhookUrl || '');
      setSlackChannel(notif.slackChannel || '#visitor-alerts');
      setAlertOnArrival(notif.alertOnArrival ?? true);
      setAlertOnCheckOut(notif.alertOnCheckOut ?? false);
      setAlertOnPendingApproval(notif.alertOnPendingApproval ?? true);

      setFullName(activeUser.name);
      setEmail(activeUser.email);
      setPhoneNumber(activeUser.phoneNumber || '+91 98206 66006');
      setSaveFeedback(null);
      setTestResult(null);
    }
  }, [isOpen, activeUser]);

  if (!isOpen) return null;

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: HostNotificationSettings = {
      enableSms,
      smsPhoneNumber: smsPhoneNumber.trim(),
      enableEmail,
      alertEmail: alertEmail.trim(),
      enableSlack,
      slackWebhookUrl: slackWebhookUrl.trim(),
      slackChannel: slackChannel.trim(),
      alertOnArrival,
      alertOnCheckOut,
      alertOnPendingApproval,
    };

    // Also update phone number on user profile
    storageService.updateUser(activeUser.id, {
      name: fullName.trim(),
      email: email.trim(),
      phoneNumber: smsPhoneNumber.trim() || phoneNumber.trim(),
    });

    const res = storageService.updateUserNotificationSettings(activeUser.id, updatedSettings);
    if (res.success) {
      setSaveFeedback('Notification settings saved and active!');
      setTimeout(() => setSaveFeedback(null), 3500);
    }
  };

  const handleRunSimulation = () => {
    const res = storageService.simulateHostArrivalNotification(activeUser.id, 'Sneha Kulkarni');
    setTestResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#123B5D] px-6 py-4 flex items-center justify-between text-white border-b border-[#0f304c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/30 text-teal-300 border border-teal-500/40 flex items-center justify-center font-bold text-sm">
              {activeUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">{activeUser.name}</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#0F766E] text-white">
                  {activeUser.role.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Host Profile & Instant Arrival Notification Channels (SMS, Email, Slack)
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

        {/* Tab Selector */}
        <div className="flex items-center border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'notifications'
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-[#526575] hover:text-[#172B3A]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Visitor Arrival Alerts</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 font-bold">
              SMS • Email • Slack
            </span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'profile'
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-[#526575] hover:text-[#172B3A]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Account Details</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#172B3A]">
          {saveFeedback && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-xs">{saveFeedback}</span>
            </div>
          )}

          {activeTab === 'notifications' && (
            <form onSubmit={handleSaveNotifications} className="space-y-5">
              {/* Notification Channel Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#526575] font-mono">
                    Host Notification Alert Channels
                  </h3>
                  <span className="text-[11px] text-teal-700 font-medium">
                    Triggered when guest checks in at reception
                  </span>
                </div>

                {/* Channel 1: SMS Alerts */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    enableSms
                      ? 'bg-white border-teal-500/60 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          enableSms ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#172B3A]">SMS Mobile Alert</span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                              enableSms ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {enableSms ? 'ENABLED' : 'MUTED'}
                          </span>
                        </div>
                        <p className="text-xs text-[#526575] mt-0.5">
                          Sends instant transactional text message to your mobile phone as soon as your visitor arrives.
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={enableSms}
                        onChange={(e) => setEnableSms(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F766E]"></div>
                    </label>
                  </div>

                  {enableSms && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <label className="text-xs font-semibold text-[#172B3A] shrink-0">
                        Recipient Mobile (India +91):
                      </label>
                      <input
                        type="tel"
                        value={smsPhoneNumber}
                        onChange={(e) => setSmsPhoneNumber(e.target.value)}
                        placeholder="+91 98206 66006"
                        className="w-full sm:w-64 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500">
                        SMS Gateway: Jio / Airtel Telecom DLT Approved
                      </span>
                    </div>
                  )}
                </div>

                {/* Channel 2: Email Alerts */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    enableEmail
                      ? 'bg-white border-blue-500/60 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          enableEmail ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#172B3A]">Corporate Email Alert</span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                              enableEmail ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {enableEmail ? 'ENABLED' : 'MUTED'}
                          </span>
                        </div>
                        <p className="text-xs text-[#526575] mt-0.5">
                          Dispatches formatted email with visitor details, badge ID, photo, and host receipt buttons.
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={enableEmail}
                        onChange={(e) => setEnableEmail(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                    </label>
                  </div>

                  {enableEmail && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <label className="text-xs font-semibold text-[#172B3A] shrink-0">
                        Recipient Email Address:
                      </label>
                      <input
                        type="email"
                        value={alertEmail}
                        onChange={(e) => setAlertEmail(e.target.value)}
                        placeholder="rajesh.sengupta@tata-enterprise.com"
                        className="w-full sm:w-72 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500">
                        Enterprise SMTP (TLS 1.3)
                      </span>
                    </div>
                  )}
                </div>

                {/* Channel 3: Slack Alerts */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    enableSlack
                      ? 'bg-white border-purple-500/60 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          enableSlack ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#172B3A]">Slack Channel & Direct Alert</span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                              enableSlack ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {enableSlack ? 'ENABLED' : 'MUTED'}
                          </span>
                        </div>
                        <p className="text-xs text-[#526575] mt-0.5">
                          Posts rich interactive message blocks with quick actions to your team Slack channel or DM bot.
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={enableSlack}
                        onChange={(e) => setEnableSlack(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7C3AED]"></div>
                    </label>
                  </div>

                  {enableSlack && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <label className="text-xs font-semibold text-[#172B3A] sm:w-36 shrink-0">
                          Slack Channel:
                        </label>
                        <input
                          type="text"
                          value={slackChannel}
                          onChange={(e) => setSlackChannel(e.target.value)}
                          placeholder="#visitor-alerts"
                          className="w-full sm:w-64 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <label className="text-xs font-semibold text-[#172B3A] sm:w-36 shrink-0">
                          Webhook URL:
                        </label>
                        <input
                          type="url"
                          value={slackWebhookUrl}
                          onChange={(e) => setSlackWebhookUrl(e.target.value)}
                          placeholder="https://hooks.slack.com/services/T00/B00/XXXXX"
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Triggers */}
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#D8E1E8] space-y-3">
                <h4 className="font-bold text-xs text-[#172B3A]">Dispatch Alerts On These Lifecycle Events:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      checked={alertOnArrival}
                      onChange={(e) => setAlertOnArrival(e.target.checked)}
                      className="rounded text-[#0F766E]"
                    />
                    <div>
                      <div className="font-semibold text-[#172B3A]">Visitor Arrival</div>
                      <div className="text-[10px] text-slate-500">Check-In at Gate</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      checked={alertOnPendingApproval}
                      onChange={(e) => setAlertOnPendingApproval(e.target.checked)}
                      className="rounded text-[#0F766E]"
                    />
                    <div>
                      <div className="font-semibold text-[#172B3A]">Pending Approval</div>
                      <div className="text-[10px] text-slate-500">Invitation Request</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      checked={alertOnCheckOut}
                      onChange={(e) => setAlertOnCheckOut(e.target.checked)}
                      className="rounded text-[#0F766E]"
                    />
                    <div>
                      <div className="font-semibold text-[#172B3A]">Visitor Exit</div>
                      <div className="text-[10px] text-slate-500">Badge Surrendered</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons & Simulator */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  id="simulate-arrival-alert-btn"
                  onClick={handleRunSimulation}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Send Test Visitor Arrival Alert</span>
                </button>

                <button
                  type="submit"
                  id="save-notifications-btn"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#123B5D] hover:bg-[#0e2f4a] text-white font-bold flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Notification Preferences</span>
                </button>
              </div>

              {/* Simulation Output Card */}
              {testResult && (
                <div className="p-4 bg-slate-900 text-white rounded-xl border border-teal-500/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-xs text-white">
                        Simulated Alert Dispatched Successfully
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-teal-300">
                      Channels: {testResult.channelsTriggered.join(' • ')}
                    </span>
                  </div>

                  {testResult.previews.sms && (
                    <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-xs">
                      <div className="font-bold text-amber-300 text-[11px] mb-1">
                        📱 SMS Delivered to {smsPhoneNumber}:
                      </div>
                      <p className="font-mono text-[11px] text-slate-200 bg-slate-950 p-2 rounded">
                        {testResult.previews.sms}
                      </p>
                    </div>
                  )}

                  {testResult.previews.email && (
                    <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-xs">
                      <div className="font-bold text-blue-300 text-[11px] mb-1">
                        📧 Email Sent to {alertEmail}:
                      </div>
                      <div className="font-mono text-[10px] text-slate-200 bg-slate-950 p-2 rounded whitespace-pre-line">
                        <strong>Subject:</strong> {testResult.previews.email.subject}
                        {'\n\n'}
                        {testResult.previews.email.body}
                      </div>
                    </div>
                  )}

                  {testResult.previews.slack && (
                    <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-xs">
                      <div className="font-bold text-purple-300 text-[11px] mb-1">
                        💬 Slack Message Posted to {testResult.previews.slack.channel}:
                      </div>
                      <p className="font-mono text-[11px] text-emerald-300 bg-slate-950 p-2 rounded">
                        {testResult.previews.slack.message}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </form>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#D8E1E8] flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#123B5D] text-white flex items-center justify-center font-bold text-xl shadow-inner">
                  {activeUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#172B3A]">{activeUser.name}</h3>
                  <p className="text-xs text-[#526575]">
                    Login ID: <strong className="font-mono text-[#123B5D]">{activeUser.loginId}</strong> • {activeUser.departmentName}
                  </p>
                  <p className="text-[11px] text-teal-700 font-medium mt-0.5">
                    Tenant: {activeTenant.name} ({activeTenant.code})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#172B3A] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172B3A] mb-1">Login ID (Username)</label>
                  <input
                    type="text"
                    disabled
                    value={activeUser.loginId}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172B3A] mb-1">Corporate Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172B3A] mb-1">Direct Phone / Mobile</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveNotifications}
                  className="px-5 py-2 rounded-lg bg-[#123B5D] hover:bg-[#0e2f4a] text-white font-bold flex items-center gap-1.5 transition text-xs shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Profile Info</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
