'use client';

import { useState } from 'react';
import { getActiveSchool } from '@/lib/tenant';
import { Tag, CheckCircle } from 'lucide-react';

export default function SaaSAdminQuotationsPage() {
  const school = getActiveSchool();
  const [quotes, setQuotes] = useState([
    { id: 'QT-001', prId: 'PR-2026-001', supplier: 'ChemLab Supplies', amount: 17800, validUntil: '2026-08-30', status: 'submitted' },
    { id: 'QT-002', prId: 'PR-2026-002', supplier: 'Apex Stationers Ltd', amount: 31500, validUntil: '2026-08-25', status: 'accepted' },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
          <Tag className="text-gold" size={24} /> Supplier Quotations & Price Bids
        </h1>
        <p className="text-white/40 text-xs mt-1">Evaluate competitive price bids and accept quotations for {school.name}.</p>
      </div>

      <div className="bg-navy-800 rounded-2xl border border-white/5 p-6 space-y-3">
        {quotes.map((q) => (
          <div key={q.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
            <div>
              <span className="font-mono text-gold">{q.id}</span> (For {q.prId})
              <p className="text-white font-bold text-sm mt-0.5">{q.supplier}</p>
              <p className="text-white/40">Bid Amount: <span className="text-green-400 font-mono font-bold">KES {q.amount.toLocaleString()}</span> · Valid Until: {q.validUntil}</p>
            </div>
            <span className={`px-3 py-1 rounded-full font-semibold text-[10px] ${
              q.status === 'accepted' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
            }`}>
              {q.status === 'accepted' ? '✓ Accepted' : 'Pending Evaluation'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
