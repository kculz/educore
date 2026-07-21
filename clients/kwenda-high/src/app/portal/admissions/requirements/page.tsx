'use client';

import Link from 'next/link';
import { ArrowLeft, FileCheck, CheckCircle2, AlertCircle } from 'lucide-react';

const REQUIREMENTS = [
  { title: 'Certified Birth Certificate', desc: 'Copy certified by an advocate of the High Court or local chief.', status: 'Mandatory' },
  { title: 'Leaving Certificate', desc: 'Original primary/previous school leaving certificate.', status: 'Mandatory' },
  { title: 'Academic Transcripts', desc: 'Report cards from the last 2 academic years.', status: 'Mandatory' },
  { title: 'Passport Photographs', desc: 'Two recent colored passport size photos (white background).', status: 'Mandatory' },
  { title: 'Medical Examination Report', desc: 'Completed medical form signed by a registered practitioner.', status: 'Required upon Admission' },
];

export default function RequirementsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/portal/admissions" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white mb-6">
        <ArrowLeft size={14} /> Back to Applications
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white">Admission Requirements</h1>
        <p className="text-white/40 text-xs mt-1">Review all required documentation before submitting your application.</p>
      </div>

      <div className="space-y-4">
        {REQUIREMENTS.map((req, i) => (
          <div key={req.title} className="bg-navy-800 rounded-2xl border border-white/5 p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shrink-0" style={{ color: '#0a1628' }}>
              <FileCheck size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold text-sm">{i + 1}. {req.title}</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gold/10 text-gold">
                  {req.status}
                </span>
              </div>
              <p className="text-white/50 text-xs">{req.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 rounded-2xl bg-gold/10 border border-gold/20 flex items-start gap-3">
        <AlertCircle size={20} className="text-gold shrink-0 mt-0.5" />
        <div>
          <h4 className="text-gold font-semibold text-xs uppercase tracking-wider mb-1">Important Note</h4>
          <p className="text-white/70 text-xs leading-relaxed">
            All submitted copies will be verified against original documents during final registration.
            Falsification of academic transcripts or birth certificates will lead to automatic rejection.
          </p>
        </div>
      </div>
    </div>
  );
}
