import React, { useState } from 'react';
import {
  Lock,
  User,
  ShieldCheck,
  Building2,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  Share2,
  ScanLine,
  Sliders,
  Users,
  AlertCircle,
  Clock
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { JSAlphaSoftLogo } from '../common/JSAlphaSoftLogo';
import { AppUser } from '../../types';
import { getInactivityLogoutNotice } from '../../hooks/useInactivityTimeout';

interface LoginViewProps {
  onLoginSuccess: (user: AppUser) => void;
  onNavigateToPublicPreRegister?: () => void;
  inactivityNotice?: string | null;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onNavigateToPublicPreRegister,
  inactivityNotice: initialInactivityNotice,
}) => {
  const state = storageService.getState();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inactivityNotice, setInactivityNotice] = useState<string | null>(
    () => initialInactivityNotice || getInactivityLogoutNotice()
  );

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = storageService.login(loginId, password);
      setIsSubmitting(false);

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please check your credentials.');
      }
    }, 250);
  };

  const handleQuickLogin = (quickLoginId: string, quickPass: string) => {
    setLoginId(quickLoginId);
    setPassword(quickPass);
    setErrorMessage(null);

    const res = storageService.login(quickLoginId, quickPass);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2942] via-[#123B5D] to-[#0A1927] text-white flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Bar Branding */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <JSAlphaSoftLogo darkTheme size="lg" />
        </div>

        {onNavigateToPublicPreRegister && (
          <button
            onClick={onNavigateToPublicPreRegister}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-teal-300 transition"
          >
            <Share2 className="w-3.5 h-3.5 text-teal-300" />
            <span>Visitor Self Pre-Registration Portal</span>
          </button>
        )}
      </div>

      {/* Main Authentication Grid */}
      <div className="max-w-5xl mx-auto w-full my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Explanatory & Role Context */}
        <div className="lg:col-span-5 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Trust Facility Access Control</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Enterprise Visitor Management System
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Role-tailored workspace views automatically adapt to your assigned credentials — equipping Front Desk Receptionists, Security Officers, Facility Admins, and Hosts with specialized security tools.
          </p>

          {/* Role Feature Highlights */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-teal-600/30 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
                <ScanLine className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Front Desk & Reception Desk</div>
                <div className="text-slate-300 text-[11px] mt-0.5">
                  Walk-In Registration, Visitor Directory, Approval Queue, and 1-Click Pre-Registration link sharing.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-orange-600/30 border border-orange-400/30 flex items-center justify-center text-orange-300 shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Enterprise Administration</div>
                <div className="text-slate-300 text-[11px] mt-0.5">
                  Tenant addition, customization (branding, colors & policies), and new user Login ID provisioning.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Login Form & 1-Click Role Logins */}
        <div className="lg:col-span-7 bg-white text-[#172B3A] rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-[#123B5D]">Sign In to VMS Terminal</h2>
            <p className="text-xs text-[#526575] mt-1">
              Enter your assigned Login ID or organizational email
            </p>
          </div>

          {/* Instant Auto-Render Main Portal Trigger */}
          <div className="mb-5 p-3 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="text-xs">
                <span className="font-bold text-teal-950 block">Auto-Render Main Portal</span>
                <span className="text-[11px] text-teal-800">Launch into operational front desk with live feed</span>
              </div>
            </div>
            <button
              type="button"
              id="auto-render-instant-portal-btn"
              onClick={() => handleQuickLogin('priya', 'reception123')}
              className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <span>Auto-Render</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Enterprise Inactivity Logout Notice */}
          {inactivityNotice && (
            <div
              id="enterprise-inactivity-notice-banner"
              className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-xs text-amber-900 animate-fadeIn shadow-2xs"
            >
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <div className="flex-1">
                <span className="font-bold block text-amber-950">Enterprise Session Timed Out</span>
                <span className="text-amber-800 text-[11px] leading-relaxed">{inactivityNotice}</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#172B3A] mb-1">
                Login ID or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="login-id-input"
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. reception, priya, admin, or arun"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F4F7FA] border border-[#CBD5E1] rounded-xl text-xs font-medium focus:outline-none focus:border-[#123B5D] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#172B3A]">
                  Password / Access PIN
                </label>
                <span className="text-[10px] text-slate-400">Default: password123</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security password"
                  className="w-full pl-9 pr-10 py-2.5 bg-[#F4F7FA] border border-[#CBD5E1] rounded-xl text-xs font-medium focus:outline-none focus:border-[#123B5D] focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#526575]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#CBD5E1] text-[#123B5D] focus:ring-0"
                />
                <span>Remember session</span>
              </label>
              <span className="text-[11px] text-teal-700 font-medium">Zero-Trust Secured</span>
            </div>

            <button
              id="submit-login-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#123B5D] hover:bg-[#0F766E] text-white font-bold rounded-xl transition duration-150 shadow-md flex items-center justify-center gap-2 text-xs"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Role Logins for testing */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#526575] uppercase tracking-wider">
                1-Click Demo Profiles (Testing Shortcuts)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Instant Persona Switch</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Front Desk / Reception */}
              <button
                id="demo-login-receptionist"
                type="button"
                onClick={() => handleQuickLogin('priya', 'reception123')}
                className="p-2.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100 text-left transition flex items-center gap-2.5 group"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  P
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-teal-950 flex items-center gap-1">
                    <span>Priya Nair</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-teal-200 text-teal-800 font-semibold">
                      Front Desk
                    </span>
                  </div>
                  <div className="text-[10px] text-teal-700 truncate">
                    Login ID: <span className="font-mono font-bold">reception</span>
                  </div>
                </div>
              </button>

              {/* Enterprise Admin */}
              <button
                id="demo-login-admin"
                type="button"
                onClick={() => handleQuickLogin('arun', 'admin123')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-left transition flex items-center gap-2.5 group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#123B5D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  A
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-blue-950 flex items-center gap-1">
                    <span>Arun Mehra</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-blue-200 text-blue-800 font-semibold">
                      Admin
                    </span>
                  </div>
                  <div className="text-[10px] text-blue-700 truncate">
                    Login ID: <span className="font-mono font-bold">admin</span>
                  </div>
                </div>
              </button>

              {/* Super Admin */}
              <button
                id="demo-login-superadmin"
                type="button"
                onClick={() => handleQuickLogin('ananya', 'superadmin123')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-left transition flex items-center gap-2.5 group"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  A
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-purple-950 flex items-center gap-1">
                    <span>Ananya Sharma</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-purple-200 text-purple-800 font-semibold">
                      Super Admin
                    </span>
                  </div>
                  <div className="text-[10px] text-purple-700 truncate">
                    Login ID: <span className="font-mono font-bold">superadmin</span>
                  </div>
                </div>
              </button>

              {/* Host Employee */}
              <button
                id="demo-login-host"
                type="button"
                onClick={() => handleQuickLogin('rajesh', 'host123')}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-left transition flex items-center gap-2.5 group"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  R
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-amber-950 flex items-center gap-1">
                    <span>Dr. Rajesh Sengupta</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-200 text-amber-800 font-semibold">
                      Host
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-700 truncate">
                    Login ID: <span className="font-mono font-bold">host</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="max-w-6xl mx-auto w-full pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span>JS AlphaSoft VMS Enterprise v2026.09</span>
          <span>•</span>
          <span>Zero-Trust PostgreSQL DB: <span className="text-emerald-400">HEALTHY</span></span>
        </div>
        <div>
          ISO 27001 & DPDP Act Compliant Multi-Tenant Access Governance
        </div>
      </div>
    </div>
  );
};
