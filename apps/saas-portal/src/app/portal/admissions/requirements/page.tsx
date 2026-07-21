'use client';

import { useState } from 'react';
import { getActiveSchool } from '@/lib/tenant';
import { CheckSquare, Plus, FileCheck, ShieldCheck, Trash2 } from 'lucide-react';

export default function SaaSAdmissionRequirementsPage() {
  const school = getActiveSchool();
  const [requirements, setRequirements] = useState([
    { id: 'REQ-1', title: 'Birth Certificate (Certified Copy)', mandatory: true, description: 'Official government birth certificate copy verified by commissioner of oaths.' },
    { id: 'REQ-2', title: 'Previous School Leaving Certificate', mandatory: true, description: 'Headmaster signed leaving certificate from former institution.' },
    { id: 'REQ-3', title: 'Academic Reports (Last 2 Years)', mandatory: true, description: 'Term 1, 2 and 3 official report cards signed by class teacher.' },
    { id: 'REQ-4', title: 'Passport Photographs (2 Copies)', mandatory: true, description: 'Recent color passport photos with clear background.' },
    { id: 'REQ-5', title: 'Immunization & Health Record', mandatory: false, description: 'Medical fitness certificate signed by registered practitioner.' },
  ]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="text-gold" size={24} /> Admissions Verification Checklists
          </h1>
          <p className="text-white/40 text-xs mt-1">Configure mandatory document requirements for student admission applications at {school.name}.</p>
        </div>
      </div>

      <div className="bg-navy-800 rounded-2xl border border-white/5 p-6 space-y-4">
        <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-3">Active Document Prerequisites</h3>
        <div className="space-y-3">
          {requirements.map((req) => (
            <div key={req.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-3">
                <FileCheck size={18} className="text-gold mt-0.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-bold text-sm">{req.title}</h4>
                    {req.mandatory ? (
                      <span className="bg-red-500/10 text-red-400 text-[10px] px-2 py-0.5 rounded font-semibold uppercase">Mandatory</span>
                    ) : (
                      <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded font-semibold uppercase">Optional</span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs mt-1">{req.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
