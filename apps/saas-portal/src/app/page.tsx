'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin, verifyMfaLogin } from '@/lib/api';
import { saveAdminSession, getAdminAccessToken } from '@/lib/auth';
import { getActiveSchool, setActiveTenantSlug, KNOWN_SCHOOLS, type SchoolTenant } from '@/lib/tenant';
import {
  GraduationCap, Eye, EyeOff, Loader2, AlertCircle, Building2, ShieldCheck,
  ArrowRight, Smartphone, CheckCircle2, UserCheck, Receipt, ShoppingCart,
  Lock, Sparkles, Check, ChevronRight, Globe, Layers, ArrowUpRight, Zap, X
} from 'lucide-react';

function SaaSLandingPageContent() {
  const router = useRouter();
  const [selectedSchool, setSelectedSchool] = useState<SchoolTenant>(KNOWN_SCHOOLS[0]);

  // Login Modal / Drawer state
  const [loginOpen, setLoginOpen] = useState(false);
  const [form, setForm] = useState({ email: 'admin@educore.local', password: 'Password123!' });
  const [showPass, setShowPass] = useState(false);
  const [state, setState] = useState<'login' | 'mfa'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA State
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  // Active module preview tab
  const [activeTab, setActiveTab] = useState<'admissions' | 'fees' | 'procurement'>('admissions');

  useEffect(() => {
    const active = getActiveSchool();
    setSelectedSchool(active);
  }, []);

  function openPortalForSchool(school: SchoolTenant) {
    setSelectedSchool(school);
    setActiveTenantSlug(school.slug);
    if (getAdminAccessToken()) {
      router.push('/portal/dashboard');
    } else {
      setLoginOpen(true);
    }
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      setActiveTenantSlug(selectedSchool.slug);
      const res = await loginAdmin(form.email, form.password);
      if (res.mfaRequired && res.userId) {
        setMfaUserId(res.userId);
        setState('mfa');
        setLoading(false);
        return;
      }

      if (res.accessToken && res.refreshToken && res.user) {
        saveAdminSession(res.accessToken, res.refreshToken, {
          id: res.user.id,
          tenantId: res.user.tenantId,
          email: res.user.email,
          fullName: res.user.fullName,
          permissions: res.user.permissions,
          roleIds: res.user.roleIds,
          mfaEnabled: res.user.mfaEnabled,
        });
        setLoginOpen(false);
        router.push('/portal/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin authentication failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleMfaVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await verifyMfaLogin(mfaUserId, mfaCode);
      if (res.accessToken && res.refreshToken && res.user) {
        saveAdminSession(res.accessToken, res.refreshToken, {
          id: res.user.id,
          tenantId: res.user.tenantId,
          email: res.user.email,
          fullName: res.user.fullName,
          permissions: res.user.permissions,
          roleIds: res.user.roleIds,
          mfaEnabled: res.user.mfaEnabled,
        });
        setLoginOpen(false);
        router.push('/portal/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid Authenticator OTP Code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#040810] text-slate-100 selection:bg-gold selection:text-navy-900 overflow-x-hidden">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#040810]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shadow-lg shadow-yellow-900/20">
              <GraduationCap size={22} style={{ color: '#0a1628' }} />
            </div>
            <div>
              <span className="font-serif text-white font-bold text-xl tracking-tight">EduCore</span>
              <span className="text-[10px] text-gold font-mono uppercase tracking-widest block font-semibold">SaaS Platform</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-white/70">
            <a href="#features" className="hover:text-gold transition-colors">Platform Modules</a>
            <a href="#subdomains" className="hover:text-gold transition-colors">Client Subdomains</a>
            <a href="#security" className="hover:text-gold transition-colors">2FA Security</a>
            <a href="#pricing" className="hover:text-gold transition-colors">Enterprise SLA</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (getAdminAccessToken()) {
                  router.push('/portal/dashboard');
                } else {
                  setLoginOpen(true);
                }
              }}
              className="px-5 py-2.5 rounded-xl font-bold gold-gradient text-xs hover:opacity-90 transition-all shadow-md shadow-yellow-900/20 flex items-center gap-2"
              style={{ color: '#0a1628' }}
            >
              {getAdminAccessToken() ? 'Go to Admin Dashboard →' : 'Staff Sign In →'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl" />
        </div>

        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold">
            <Sparkles size={14} /> Multi-Tenant School Administration & Operating System
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Empowering Modern Schools with Enterprise <span className="text-transparent bg-clip-text gold-gradient">SaaS Intelligence</span>
          </h1>

          <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            A unified, multi-tenant cloud platform connecting **Admissions Evaluation**, **Fees & Billing Revenue**, and **Procurement & Supply Chain** for premier institutions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                const el = document.getElementById('subdomains');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold gold-gradient text-xs hover:opacity-90 transition-all shadow-xl shadow-yellow-900/20 flex items-center justify-center gap-2"
              style={{ color: '#0a1628' }}
            >
              <Building2 size={16} /> Select Client School Portal
            </button>
            <button
              onClick={() => setLoginOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Lock size={15} className="text-gold" /> Authorized Staff Login
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 text-left">
            <div className="bg-navy-800/80 border border-white/5 p-4 rounded-2xl">
              <p className="text-[10px] text-gold font-mono uppercase font-semibold">Multi-Tenant Isolation</p>
              <p className="text-white font-bold text-xl mt-1">Dedicated Subdomains</p>
            </div>
            <div className="bg-navy-800/80 border border-white/5 p-4 rounded-2xl">
              <p className="text-[10px] text-gold font-mono uppercase font-semibold">Security</p>
              <p className="text-white font-bold text-xl mt-1">Google & MS 2FA</p>
            </div>
            <div className="bg-navy-800/80 border border-white/5 p-4 rounded-2xl">
              <p className="text-[10px] text-gold font-mono uppercase font-semibold">Modules Included</p>
              <p className="text-white font-bold text-xl mt-1">3 Full Suites</p>
            </div>
            <div className="bg-navy-800/80 border border-white/5 p-4 rounded-2xl">
              <p className="text-[10px] text-gold font-mono uppercase font-semibold">System SLA</p>
              <p className="text-white font-bold text-xl mt-1">99.95% Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Client School Subdomains Section */}
      <section id="subdomains" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] text-gold font-mono uppercase tracking-widest bg-gold/10 px-3 py-1 rounded-full font-semibold">
            Subdomain Routing
          </span>
          <h2 className="font-serif text-3xl font-bold text-white mt-3">Registered Client School Portals</h2>
          <p className="text-white/40 text-xs mt-2">Every school tenant accesses their isolated EduCore instance via their custom subdomain route.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {KNOWN_SCHOOLS.map((school) => (
            <div
              key={school.slug}
              className="bg-navy-800 border border-white/10 rounded-2xl p-6 hover:border-gold/50 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 size={20} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-semibold uppercase">
                    Active Tenant
                  </span>
                </div>

                <h3 className="font-serif text-white font-bold text-xl group-hover:text-gold transition-colors">{school.name}</h3>
                <p className="text-gold/80 font-mono text-xs mt-1 flex items-center gap-1">
                  <Globe size={13} /> {school.subdomain}
                </p>

                <div className="mt-4 pt-4 border-t border-white/5 space-y-1 text-xs text-white/50">
                  <p className="flex items-center gap-1.5"><Check size={13} className="text-green-400" /> Admissions Board Suite</p>
                  <p className="flex items-center gap-1.5"><Check size={13} className="text-green-400" /> Student Fees & Billing</p>
                  <p className="flex items-center gap-1.5"><Check size={13} className="text-green-400" /> Procurement Control</p>
                </div>
              </div>

              <button
                onClick={() => openPortalForSchool(school)}
                className="w-full mt-6 py-2.5 rounded-xl border border-white/10 text-gold text-xs font-semibold group-hover:bg-gold group-hover:text-navy-900 transition-all flex items-center justify-center gap-2"
              >
                Enter {school.name} Portal <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Modules Showcase */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] text-gold font-mono uppercase tracking-widest bg-gold/10 px-3 py-1 rounded-full font-semibold">
            Integrated Architecture
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-3">Three Enterprise Modules, One Core</h2>
          <p className="text-white/40 text-xs mt-2">Comprehensive school management without separate software silos.</p>
        </div>

        {/* Feature Tabs */}
        <div className="flex justify-center gap-3 mb-10 overflow-x-auto pb-2">
          {[
            { id: 'admissions', label: 'Admissions Evaluation', icon: UserCheck },
            { id: 'fees', label: 'Fees & Revenue Billing', icon: Receipt },
            { id: 'procurement', label: 'Procurement & Vendors', icon: ShoppingCart },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'gold-gradient text-navy-900 shadow-lg shadow-yellow-900/20 font-bold'
                  : 'bg-navy-800 text-white/60 hover:text-white border border-white/5'
              }`}
              style={activeTab === tab.id ? { color: '#0a1628' } : {}}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Feature Tab Content */}
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto">
          {activeTab === 'admissions' && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-navy-900 font-bold" style={{ color: '#0a1628' }}>
                  <UserCheck size={20} />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">Admissions Review Board</h3>
                <p className="text-white/60 text-xs leading-relaxed">
                  Evaluate applicant profiles, verify birth certificates, school reports, and passport photos. Approve applications, issue formal offer letters, and generate official student enrollment IDs.
                </p>
                <div className="space-y-2 text-xs text-white/80">
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-green-400 shrink-0" /> Multi-stage review timeline</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-green-400 shrink-0" /> Interactive document previewer</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-green-400 shrink-0" /> One-click student enrollment generator</div>
                </div>
              </div>
              <div className="bg-navy-900 border border-white/10 rounded-xl p-5 text-xs space-y-3 font-mono">
                <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                  <span>Mary Wambui (Form 1)</span>
                  <span className="text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded text-[10px]">Under Review</span>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                  <span>Brian Otieno (Form 2)</span>
                  <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-[10px]">Offered</span>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                  <span>Amina Mohamed (Form 3)</span>
                  <span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded text-[10px]">Enrolled</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <Receipt size={20} />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">Fees & Revenue Management</h3>
                <p className="text-white/60 text-xs leading-relaxed">
                  Automate term fee invoicing, track real-time revenue collection, record bank deposits and M-Pesa payments, and monitor arrears per student.
                </p>
                <div className="space-y-2 text-xs text-white/80">
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-blue-400 shrink-0" /> Real-time arrears calculation</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-blue-400 shrink-0" /> Offline deposit & M-Pesa receipt verification</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-blue-400 shrink-0" /> Term fee structures configuration</div>
                </div>
              </div>
              <div className="bg-navy-900 border border-white/10 rounded-xl p-5 text-xs space-y-3 font-mono">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <span className="text-white/50">Total Invoiced</span>
                  <span className="text-white font-bold">KES 48,500</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <span className="text-white/50">Collected Revenue</span>
                  <span className="text-green-400 font-bold">KES 35,000</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'procurement' && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <ShoppingCart size={20} />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">Procurement & Supply Chain</h3>
                <p className="text-white/60 text-xs leading-relaxed">
                  Streamline departmental Purchase Requests, issue Purchase Orders, evaluate competitive supplier bids, track SLA contracts, and record Goods Received Notes (GRN).
                </p>
                <div className="space-y-2 text-xs text-white/80">
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-purple-400 shrink-0" /> Purchase Request approval workflow</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-purple-400 shrink-0" /> Verified supplier directory & quotes</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-purple-400 shrink-0" /> Delivery inspection (GRN) audit trail</div>
                </div>
              </div>
              <div className="bg-navy-900 border border-white/10 rounded-xl p-5 text-xs space-y-3 font-mono">
                <div className="p-3 rounded-lg bg-white/5 flex justify-between items-center">
                  <span>PR-2026-001 (Science Dept)</span>
                  <span className="text-green-400">Approved</span>
                </div>
                <div className="p-3 rounded-lg bg-white/5 flex justify-between items-center">
                  <span>PO-2026-001 (Apex Stationers)</span>
                  <span className="text-purple-400">Issued</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="bg-navy-800 border border-white/10 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="text-[10px] text-gold font-mono uppercase tracking-widest bg-gold/10 px-3 py-1 rounded-full font-semibold">
              Bank-Grade Authentication
            </span>
            <h2 className="font-serif text-3xl font-bold text-white">Google & Microsoft Authenticator 2FA Included</h2>
            <p className="text-white/60 text-xs leading-relaxed">
              Every staff login is secured with Time-based One-Time Passwords (TOTP). Scan the QR code with your smartphone and protect student records with industry-standard 2FA.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0 bg-white/5 p-6 rounded-2xl border border-white/10">
            <Smartphone size={40} className="text-gold" />
            <div>
              <p className="text-white font-bold text-sm">Authenticator App 2FA</p>
              <p className="text-white/40 text-xs">Google, Microsoft, Authy & 1Password</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center text-xs text-white/40">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg gold-gradient flex items-center justify-center">
              <GraduationCap size={14} style={{ color: '#0a1628' }} />
            </div>
            <span className="text-white font-serif font-bold">EduCore SaaS Platform</span>
          </div>
          <p>© 2026 EduCore Operating System. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Staff Login Drawer / Modal */}
      {loginOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative space-y-5">
            <button
              onClick={() => setLoginOpen(false)}
              className="absolute right-4 top-4 text-white/40 hover:text-white"
            >
              <X size={20} />
            </button>

            {state !== 'mfa' ? (
              <>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center mx-auto mb-2">
                    <GraduationCap size={24} style={{ color: '#0a1628' }} />
                  </div>
                  <h2 className="font-serif text-white text-xl font-bold">School Staff Portal Login</h2>
                  <p className="text-white/40 text-xs mt-0.5">Sign in to manage <span className="text-gold font-semibold">{selectedSchool.name}</span>.</p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <label className="block text-[10px] font-semibold text-gold uppercase mb-1">Target School Subdomain</label>
                  <select
                    value={selectedSchool.slug}
                    onChange={(e) => {
                      const found = KNOWN_SCHOOLS.find(s => s.slug === e.target.value);
                      if (found) {
                        setSelectedSchool(found);
                        setActiveTenantSlug(found.slug);
                      }
                    }}
                    className="w-full bg-navy-900 border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-gold"
                  >
                    {KNOWN_SCHOOLS.map(s => (
                      <option key={s.slug} value={s.slug}>{s.name} ({s.subdomain})</option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-white/70 mb-1 font-medium">Staff Email Address</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-medium">Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        required
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                      >
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold gold-gradient text-navy-900 text-xs shadow-lg shadow-yellow-900/20"
                    style={{ color: '#0a1628' }}
                  >
                    {loading ? <><Loader2 size={14} className="animate-spin" /> Authenticating…</> : 'Sign In to Portal'}
                  </button>
                </form>
              </>
            ) : (
              /* MFA Verification Step */
              <div className="space-y-4 text-xs">
                <div className="text-center">
                  <Smartphone size={32} className="text-gold mx-auto mb-2" />
                  <h3 className="font-serif text-white text-lg font-bold">Authenticator Code</h3>
                  <p className="text-white/40 text-xs">Enter 6-digit OTP from Google/Microsoft Auth</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                    {error}
                  </div>
                )}

                <form onSubmit={handleMfaVerify} className="space-y-3">
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={useBackupCode ? 9 : 6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.toUpperCase())}
                    placeholder={useBackupCode ? 'XXXX-XXXX' : '123456'}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-gold/40 text-center font-mono text-lg text-gold tracking-widest focus:outline-none focus:border-gold"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold gold-gradient text-navy-900 text-xs"
                    style={{ color: '#0a1628' }}
                  >
                    {loading ? 'Verifying...' : 'Verify & Enter Portal'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SaaSLandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#040810] flex items-center justify-center"><Loader2 size={28} className="text-gold animate-spin" /></div>}>
      <SaaSLandingPageContent />
    </Suspense>
  );
}
