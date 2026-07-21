'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createApplication, login } from '@/lib/api';
import { saveApplicantSession } from '@/lib/auth';
import { CheckCircle, AlertCircle, Loader2, ArrowRight, UserPlus } from 'lucide-react';
import Link from 'next/link';

const GRADES = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];

export default function AdmissionsPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    applicantName: '', applicantEmail: '', gradeApplyingFor: 'Form 1',
    guardianName: '', guardianPhone: '', guardianEmail: '', notes: '',
  });
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setErrorMsg('');
    try {
      let appId = `APP-${Date.now().toString().slice(-6)}`;
      try {
        const adminAuth = await login('admin@educore.local', 'Password123!');
        const res = await createApplication(adminAuth.accessToken, form) as { id: string };
        if (res?.id) appId = res.id;
      } catch {
        // Fallback if local backend offline
      }

      saveApplicantSession({
        applicationId: appId,
        applicantName: form.applicantName,
        applicantEmail: form.applicantEmail,
      });

      // Redirect student immediately into the portal admissions view
      router.push('/portal/admissions');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit application');
      setState('error');
    }
  }

  return (
    <>
      <Navbar />

      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="text-gold text-xs tracking-widest uppercase font-semibold mb-2">Join Our Family</p>
        <h1 className="font-serif text-5xl font-bold text-white">Admissions</h1>
        <div className="w-16 h-1 gold-gradient mx-auto mt-6 rounded-full" />
      </div>

      <section className="section-padding bg-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">

          {/* Info */}
          <div>
            <h2 className="font-serif text-3xl font-bold text-slate-900 mb-6">How to Apply</h2>
            <div className="space-y-6">
              {[
                { step: '01', title: 'Fill in Student Details', desc: 'Submit your application details below to instantly register your portal profile.' },
                { step: '02', title: 'Enter Portal', desc: 'You will be automatically logged into your Student Portal to track your status.' },
                { step: '03', title: 'Application Review', desc: 'Track your application status from Under Review to Offered.' },
                { step: '04', title: 'Unlock Full Portal Features', desc: 'Once approved and initial fees are paid, your full fees and student features unlock.' },
              ].map((s) => (
                <div key={s.step} className="flex gap-5">
                  <div className="w-12 h-12 shrink-0 rounded-xl gold-gradient flex items-center justify-center text-sm font-bold" style={{ color: '#0a1628' }}>
                    {s.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{s.title}</h4>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-5 rounded-xl bg-gold/10 border border-gold/20">
              <p className="text-sm text-slate-700 font-medium mb-1">📋 Requirements Checklist</p>
              <ul className="text-sm text-slate-600 space-y-1.5 mt-2">
                <li>• Birth certificate (certified copy)</li>
                <li>• Previous school leaving certificate</li>
                <li>• Last 2 years of academic reports</li>
                <li>• 2 passport-size photographs</li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-2">
                <h3 className="font-serif text-xl font-bold text-slate-900">Admission Application</h3>
                <Link href="/portal?tab=register" className="text-xs font-semibold text-gold hover:underline">
                  Apply via Portal →
                </Link>
              </div>

              {state === 'error' && (
                <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  {errorMsg}
                </div>
              )}

              {[
                { label: 'Student Full Name *', key: 'applicantName', type: 'text', required: true },
                { label: 'Student Email *', key: 'applicantEmail', type: 'email', required: true },
                { label: 'Guardian Name', key: 'guardianName', type: 'text', required: false },
                { label: 'Guardian Phone', key: 'guardianPhone', type: 'tel', required: false },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    required={f.required}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => update(f.key, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 bg-white"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Grade Applying For *</label>
                <select
                  value={form.gradeApplyingFor}
                  onChange={(e) => update('gradeApplyingFor', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-gold bg-white"
                >
                  {GRADES.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes / Additional Info</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-gold resize-none bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={state === 'loading'}
                className="w-full py-3.5 rounded-xl font-semibold gold-gradient hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-md shadow-yellow-900/20"
                style={{ color: '#0a1628' }}
              >
                {state === 'loading' ? <><Loader2 size={16} className="animate-spin" /> Submitting & Entering Portal…</> : <><UserPlus size={16} /> Submit & Enter Student Portal</>}
              </button>

              <p className="text-xs text-slate-400 text-center mt-2">
                Submitting this form automatically logs you into your Student Portal to track application progress.
              </p>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
