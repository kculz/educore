'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, getStoredUser } from '@/lib/auth';
import { createApplication, listApplications } from '@/lib/api';
import { CheckCircle, AlertCircle, Loader2, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

const GRADES = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];

export default function NewApplicationPage() {
  const router = useRouter();
  const [hasExistingApp, setHasExistingApp] = useState(false);
  const [checking, setChecking] = useState(true);

  const [form, setForm] = useState({
    applicantName: '', applicantEmail: '', gradeApplyingFor: 'Form 1',
    guardianName: '', guardianPhone: '', guardianEmail: '', notes: '',
  });
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [createdId, setCreatedId] = useState('');

  useEffect(() => {
    async function check() {
      const token = getAccessToken();
      const user = getStoredUser();
      if (!token) return setChecking(false);
      try {
        const apps = await listApplications(token) as any[];
        if ((Array.isArray(apps) && apps.length > 0) || user?.isApplicant) {
          setHasExistingApp(true);
        }
      } catch {
        if (user?.isApplicant) setHasExistingApp(true);
      } finally {
        setChecking(false);
      }
    }
    check();
  }, []);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) {
      setErrorMsg('Not authenticated');
      setState('error');
      return;
    }
    setState('loading');
    try {
      const res = await createApplication(token, form) as { id: string };
      setCreatedId(res.id);
      setState('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed');
      setState('error');
    }
  }

  if (checking) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/portal/admissions" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white mb-6">
        <ArrowLeft size={14} /> Back to Application Overview
      </Link>

      {hasExistingApp ? (
        <div className="bg-navy-800 rounded-2xl border border-white/5 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gold/10 text-gold border border-gold/20 flex items-center justify-center mx-auto mb-4">
            <Lock size={28} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mb-2">Application Limit Reached</h2>
          <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed mb-6">
            Each applicant is permitted to submit only <span className="text-gold font-semibold">1 active admission application</span>.
            You already have an existing application under review.
          </p>
          <Link
            href="/portal/admissions"
            className="px-6 py-3 rounded-xl font-semibold gold-gradient text-xs inline-flex items-center justify-center gap-2"
            style={{ color: '#0a1628' }}
          >
            Manage Existing Application
          </Link>
        </div>
      ) : (
        <div className="bg-navy-800 rounded-2xl border border-white/5 p-8">
          <div className="mb-6">
            <h1 className="font-serif text-2xl font-bold text-white">New Student Application</h1>
            <p className="text-white/40 text-xs mt-1">Submit a new application for admission to Kwenda High School.</p>
          </div>

          {state === 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">Application Submitted!</h3>
              <p className="text-white/50 text-sm mb-4">Reference Code: <span className="text-gold font-mono">{createdId.slice(0, 8).toUpperCase()}</span></p>
              <div className="flex justify-center gap-3">
                <button onClick={() => router.push('/portal/admissions')} className="px-6 py-2.5 rounded-xl font-semibold gold-gradient text-xs" style={{ color: '#0a1628' }}>
                  View Application Details & Upload Docs
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {state === 'error' && (
                <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  {errorMsg}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.applicantName}
                    onChange={(e) => update('applicantName', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Student Email *</label>
                  <input
                    type="email"
                    required
                    value={form.applicantEmail}
                    onChange={(e) => update('applicantEmail', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">Grade Applying For *</label>
                <select
                  value={form.gradeApplyingFor}
                  onChange={(e) => update('gradeApplyingFor', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-white text-xs focus:outline-none focus:border-gold"
                >
                  {GRADES.map((g) => <option key={g} value={g} className="bg-navy-800 text-white">{g}</option>)}
                </select>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Guardian Name</label>
                  <input
                    type="text"
                    value={form.guardianName}
                    onChange={(e) => update('guardianName', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Guardian Phone</label>
                  <input
                    type="tel"
                    value={form.guardianPhone}
                    onChange={(e) => update('guardianPhone', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Guardian Email</label>
                  <input
                    type="email"
                    value={form.guardianEmail}
                    onChange={(e) => update('guardianEmail', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">Additional Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={state === 'loading'}
                className="w-full py-3 rounded-xl font-semibold gold-gradient text-xs flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ color: '#0a1628' }}
              >
                {state === 'loading' ? <><Loader2 size={15} className="animate-spin" /> Submitting…</> : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
