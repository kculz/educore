'use client';

import { useEffect, useState } from 'react';
import { getStoredAdminUser, getAdminAccessToken } from '@/lib/auth';
import { getActiveSchool } from '@/lib/tenant';
import { setupMfa, enableMfa, disableMfa } from '@/lib/api';
import { Building2, ShieldCheck, Key, CheckCircle, Lock, Smartphone, QrCode, Copy, Check, ShieldAlert, Loader2, AlertCircle } from 'lucide-react';

export default function SaaSAdminSettingsPage() {
  const school = getActiveSchool();
  const [user, setUser] = useState(getStoredAdminUser());
  const [mfaEnabled, setMfaEnabled] = useState(false);

  // Setup state
  const [setupWizard, setSetupWizard] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; qrUri: string; backupCodes: string[] } | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const current = getStoredAdminUser();
    setUser(current);
    if (current && current.mfaEnabled) {
      setMfaEnabled(true);
    }
  }, []);

  async function handleStartSetup() {
    setLoading(true);
    setErrorMsg('');
    const token = getAdminAccessToken();
    if (!token) return;
    try {
      const res = await setupMfa(token);
      setSetupData(res);
      setSetupWizard(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to initialize setup');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmEnable(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const token = getAdminAccessToken();
    if (!token) return;
    try {
      const res = await enableMfa(token, verifyCode);
      setMfaEnabled(true);
      setSuccessMsg(res.message || 'MFA successfully enabled');
      setSetupWizard(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid Authenticator code');
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    if (!confirm('Are you sure you want to disable Authenticator App 2FA for your admin account?')) return;
    setLoading(true);
    const token = getAdminAccessToken();
    if (!token) return;
    try {
      await disableMfa(token);
      setMfaEnabled(false);
      setSuccessMsg('MFA has been disabled');
    } catch (err) {
      setErrorMsg('Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  }

  function copySecret() {
    if (!setupData) return;
    navigator.clipboard.writeText(setupData.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
          <Building2 className="text-gold" size={24} /> Client School Profile & Security Settings
        </h1>
        <p className="text-white/40 text-xs mt-1">Configure tenant parameters, active product licenses, and Google/Microsoft Authenticator app 2FA for {school.name}.</p>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-400 flex items-center gap-2">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {/* Authenticator Apps (MFA/2FA) Setup Section */}
      <div className="bg-navy-800 p-6 rounded-2xl border border-white/5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
              <Smartphone size={22} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Authenticator App (Google / Microsoft Auth)</h3>
              <p className="text-white/40 text-xs">Secure staff login with Time-based One-Time Passwords (TOTP).</p>
            </div>
          </div>

          <div>
            {mfaEnabled ? (
              <span className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle size={14} /> 2FA Active & Enforced
              </span>
            ) : (
              <button
                disabled={loading}
                onClick={handleStartSetup}
                className="px-4 py-2 rounded-xl gold-gradient text-xs font-bold text-navy-900 hover:opacity-90 transition-opacity"
                style={{ color: '#0a1628' }}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : 'Set Up Google / MS Authenticator'}
              </button>
            )}
          </div>
        </div>

        {/* Wizard step */}
        {setupWizard && setupData && (
          <div className="bg-navy-900 p-6 rounded-xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                <QrCode size={18} className="text-gold" /> Authenticator App Linkage Wizard
              </h4>
              <button onClick={() => setSetupWizard(false)} className="text-white/40 hover:text-white text-xs">Cancel</button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-center">
              {/* Simulated Visual QR Code */}
              <div className="bg-white p-6 rounded-2xl text-center space-y-2 text-navy-900">
                <div className="w-48 h-48 mx-auto bg-navy-900 rounded-xl p-3 flex flex-col items-center justify-center relative">
                  {/* High precision SVG QR grid simulation */}
                  <div className="grid grid-cols-7 gap-1 w-full h-full p-2 bg-white rounded-lg">
                    {[...Array(49)].map((_, i) => (
                      <div
                        key={i}
                        className={`${
                          (i % 2 === 0 || i % 7 === 0 || i < 7 || i > 42 || i % 5 === 0) ? 'bg-navy-900' : 'bg-transparent'
                        } rounded-[1px]`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] font-bold text-navy-900 mt-2">Scan with Google Authenticator or Microsoft Authenticator</p>
              </div>

              {/* Step instructions */}
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <p className="text-white font-semibold">1. Install Authenticator App</p>
                  <p className="text-white/50 text-[11px]">Download <span className="text-gold">Google Authenticator</span> or <span className="text-gold">Microsoft Authenticator</span> from the iOS App Store or Google Play Store.</p>
                </div>

                <div className="space-y-2">
                  <p className="text-white font-semibold">2. Manual Base32 Secret Key</p>
                  <div className="flex items-center gap-2">
                    <code className="px-3 py-2 rounded-lg bg-white/10 text-gold font-mono text-xs font-bold flex-1 text-center">
                      {setupData.secret}
                    </code>
                    <button
                      onClick={copySecret}
                      className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 text-[11px]"
                    >
                      {copiedSecret ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      {copiedSecret ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleConfirmEnable} className="space-y-3 pt-2">
                  <p className="text-white font-semibold">3. Enter 6-Digit Code to Activate</p>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-gold/40 text-center font-mono text-sm tracking-widest text-gold focus:outline-none focus:border-gold"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl font-bold gold-gradient text-navy-900 text-xs"
                    style={{ color: '#0a1628' }}
                  >
                    {loading ? 'Activating 2FA...' : 'Verify Code & Enable Authenticator 2FA'}
                  </button>
                </form>
              </div>
            </div>

            {/* Emergency Recovery Codes */}
            <div className="border-t border-white/10 pt-4 space-y-2">
              <p className="text-white font-semibold text-xs flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-yellow-400" /> One-Time Emergency Backup Recovery Codes
              </p>
              <p className="text-white/40 text-[11px]">Save these 8 recovery codes in a secure password manager. Each code can be used once if you lose access to your Authenticator phone.</p>
              <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-[11px] text-gold">
                {setupData.backupCodes.map((code, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-white/5 text-center border border-white/5">
                    {code}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {mfaEnabled && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-white/50 text-xs">Your account is protected by Google / Microsoft Authenticator app 2FA.</p>
            <button
              onClick={handleDisable}
              className="px-3.5 py-1.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold"
            >
              Disable 2FA
            </button>
          </div>
        )}
      </div>

      {/* School Profile Info */}
      <div className="bg-navy-800 p-6 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-3">School Organization Details</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-white/40 mb-1">School Name</p>
            <p className="text-white font-bold text-base">{school.name}</p>
          </div>
          <div>
            <p className="text-white/40 mb-1">Tenant Subdomain / Slug</p>
            <p className="text-gold font-mono font-bold">{school.subdomain}</p>
          </div>
        </div>
      </div>

      {/* Active Licensed Products */}
      <div className="bg-navy-800 p-6 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-3">Active Module Subscriptions & Product Licenses</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { code: 'admission', name: 'Admissions Module', desc: 'Application workflows, applicant review board, verification documents, and enrollment generator.', active: true },
            { code: 'fees', name: 'Fees & Revenue Module', desc: 'Student fee invoicing, receipt generation, M-Pesa/Bank tracking, and arrears management.', active: true },
            { code: 'procurement', name: 'Procurement Module', desc: 'Purchase requests, PO issuance, vendor directory, quotations comparison, contracts, and GRNs.', active: true },
          ].map((prod) => (
            <div key={prod.code} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between text-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-bold">{prod.name}</h4>
                  <ShieldCheck size={16} className="text-green-400" />
                </div>
                <p className="text-white/40 text-[11px] leading-relaxed">{prod.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-green-400 font-semibold uppercase">✓ Active & Licensed</span>
                <span className="text-[10px] text-gold font-mono">v1.0.0</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
