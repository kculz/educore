'use client';

import { useState } from 'react';
import { getActiveSchool } from '@/lib/tenant';
import { Award, Calendar } from 'lucide-react';

export default function SaaSAdminContractsPage() {
  const school = getActiveSchool();
  const [contracts] = useState([
    { id: 'CTR-001', title: 'School Food & Catering Provisions SLA', supplier: 'Fresh Harvest Foods', contractValue: 120000, startDate: '2026-01-01', endDate: '2026-12-31', status: 'active' },
    { id: 'CTR-002', title: 'Stationery & Examination Printing SLA', supplier: 'Apex Stationers Ltd', contractValue: 65000, startDate: '2026-02-01', endDate: '2026-11-30', status: 'active' },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
          <Award className="text-gold" size={24} /> Supplier Service Level Agreements (SLA)
        </h1>
        <p className="text-white/40 text-xs mt-1">Manage vendor contracts, terms, and expiration dates for {school.name}.</p>
      </div>

      <div className="bg-navy-800 rounded-2xl border border-white/5 p-6 space-y-4">
        {contracts.map((c) => (
          <div key={c.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-gold font-bold">{c.id}</span>
              <span className="bg-green-500/10 text-green-400 font-semibold px-2.5 py-0.5 rounded text-[10px]">
                Active Contract
              </span>
            </div>
            <h3 className="text-white font-bold text-base">{c.title}</h3>
            <p className="text-gold font-medium">{c.supplier}</p>
            <p className="text-white/40">
              Contract Value: <span className="text-white font-mono font-bold">KES {c.contractValue.toLocaleString()}</span> · Duration: {c.startDate} to {c.endDate}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
