'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login, createApplication } from '@/lib/api';
import { saveSession, saveApplicantSession, getAccessToken } from '@/lib/auth';
import { GraduationCap, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import Link from 'next/link';

function PortalFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  // Login state
  const [loginForm, setLoginForm] = useState({ email: 'admin@educore.local', password: 'Password123!' });
  const [showPass, setShowPass] = useState(false);
  const [loginState, setLoginState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [loginErr, setLoginErr] = useState('');

  // Register / Application state
  const [regForm, setRegForm] = useState({
    applicantName: '',
    applicantEmail: '',
    gradeApplyingFor: 'Form 1',
    guardianName: '',
    guardianPhone: '',
    notes: '',
  });
  const [regState, setRegState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [regErr, setRegErr] = useState('');

  useEffect(() => {
    if (getAccessToken()) router.replace('/portal/dashboard');
  }, [router]);

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginState('loading');
    setLoginErr('');
    try {
      const result = await login(loginForm.email, loginForm.password);
      saveSession(result.accessToken, result.refreshToken, {
        id: result.user.id,
        tenantId: result.user.tenantId,
        email: result.user.email,
        fullName: result.user.fullName,
        permissions: result.user.permissions,
        roleIds: result.user.roleIds,
      });
      router.push('/portal/dashboard');
    } catch (err) {
      setLoginErr(err instanceof Error ? err.message : 'Login failed');
      setLoginState('error');
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRegState('loading');
    setRegErr('');
    try {
      let appId = `APP-${Date.now().toString().slice(-6)}`;
      try {
        const adminAuth = await login('admin@educore.local', 'Password123!');
        const appRes = await createApplication(adminAuth.accessToken, regForm) as { id: string };
        if (appRes?.id) appId = appRes.id;
      } catch {
        // Fallback to local applicant session if API demo login fails
      }

      saveApplicantSession({
        applicationId: appId,
        applicantName: regForm.applicantName,
        applicantEmail: regForm.applicantEmail,
      });

      // Redirect immediately to portal admissions page
      router.push('/portal/admissions');
    } catch (err) {
      setRegErr(err instanceof Error ? err.message : 'Registration failed');
      setRegState('error');
    }
  }

  return (
    <div className="glass rounded-2xl p-8 shadow-2xl shadow-black/40 border border-gold/20">
      {/* Tab Switcher */}
      <div className="grid grid-cols-2 p-1 bg-white/5 rounded-xl mb-6 border border-white/10">
        <button
          type="button"
          onClick={() => setTab('login')}
          className={`py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            tab === 'login' ? 'bg-gold text-navy-900 shadow font-bold' : 'text-white/60 hover:text-white'
          }`}
          style={tab === 'login' ? { color: '#0a1628' } : {}}
        >
          <LogIn size={14} /> Student Login
        </button>
        <button
          type="button"
          onClick={() => setTab('register')}
          className={`py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            tab === 'register' ? 'bg-gold text-navy-900 shadow font-bold' : 'text-white/60 hover:text-white'
          }`}
          style={tab === 'register' ? { color: '#0a1628' } : {}}
        >
          <UserPlus size={14} /> Apply for Admission
        </button>
      </div>

      {tab === 'login' ? (
        <>
          <div className="mb-6">
            <h1 className="font-serif text-xl font-bold text-white mb-1">Sign In to Portal</h1>
            <p className="text-white/50 text-xs">Enter your credentials to access your student portal.</p>
          </div>

          {loginState === 'error' && (
            <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 mb-5">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              {loginErr}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder="you@kwendahigh.ac.ke"
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-gold"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginState === 'loading'}
              className="w-full py-3 rounded-xl font-semibold gold-gradient hover:opacity-90 transition-opacity text-xs flex items-center justify-center gap-2 shadow-lg shadow-yellow-900/20 mt-2 disabled:opacity-60"
              style={{ color: '#0a1628' }}
            >
              {loginState === 'loading' ? <><Loader2 size={15} className="animate-spin" /> Signing In…</> : 'Sign In to Portal'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-[11px] text-white/40 mb-1">Demo Credentials Prepared:</p>
            <p className="text-xs font-mono text-gold bg-white/5 py-1 px-3 rounded border border-white/5 inline-block">
              admin@educore.local / Password123!
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="mb-5">
            <h1 className="font-serif text-xl font-bold text-white mb-1">Admission Registration</h1>
            <p className="text-white/50 text-xs">Fill in your details below to register and start your application.</p>
          </div>

          {regState === 'error' && (
            <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 mb-4">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              {regErr}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                value={regForm.applicantName}
                onChange={(e) => setRegForm({ ...regForm, applicantName: e.target.value })}
                placeholder="e.g. Mary Wambui"
                className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Student Email Address *</label>
              <input
                type="email"
                required
                value={regForm.applicantEmail}
                onChange={(e) => setRegForm({ ...regForm, applicantEmail: e.target.value })}
                placeholder="mary@gmail.com"
                className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Grade Applying For *</label>
              <select
                value={regForm.gradeApplyingFor}
                onChange={(e) => setRegForm({ ...regForm, gradeApplyingFor: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-navy-800 border border-white/10 text-white text-xs focus:outline-none focus:border-gold"
              >
                <option value="Form 1">Form 1</option>
                <option value="Form 2">Form 2</option>
                <option value="Form 3">Form 3</option>
                <option value="Form 4">Form 4</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Guardian Name</label>
                <input
                  type="text"
                  value={regForm.guardianName}
                  onChange={(e) => setRegForm({ ...regForm, guardianName: e.target.value })}
                  placeholder="John Wambui"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Guardian Phone</label>
                <input
                  type="tel"
                  value={regForm.guardianPhone}
                  onChange={(e) => setRegForm({ ...regForm, guardianPhone: e.target.value })}
                  placeholder="+254 712..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={regState === 'loading'}
              className="w-full py-3 rounded-xl font-semibold gold-gradient hover:opacity-90 transition-opacity text-xs flex items-center justify-center gap-2 shadow-lg shadow-yellow-900/20 mt-2 disabled:opacity-60"
              style={{ color: '#0a1628' }}
            >
              {regState === 'loading' ? <><Loader2 size={15} className="animate-spin" /> Registering Application…</> : <><UserPlus size={15} /> Register & Enter Portal</>}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function PortalPage() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-gold/10"
            style={{ width: `${200 + i * 140}px`, height: `${200 + i * 140}px`, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center shadow-xl shadow-yellow-900/30">
              <GraduationCap size={28} style={{ color: '#0a1628' }} />
            </div>
            <div>
              <p className="font-serif text-white text-2xl font-bold">Kwenda High School</p>
              <p className="text-gold text-[10px] tracking-widest uppercase font-semibold">EduCore Platform Portal</p>
            </div>
          </Link>
        </div>

        <Suspense fallback={
          <div className="glass rounded-2xl p-8 text-center text-white/50">
            <Loader2 size={24} className="animate-spin text-gold mx-auto mb-2" />
            <p className="text-xs">Loading Portal...</p>
          </div>
        }>
          <PortalFormContent />
        </Suspense>

        <p className="text-center mt-6 text-xs text-white/30">
          <Link href="/" className="hover:text-white/70 transition-colors">← Back to Kwenda High School Homepage</Link>
        </p>
      </div>
    </div>
  );
}
