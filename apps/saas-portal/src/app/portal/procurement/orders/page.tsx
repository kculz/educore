'use client';

import { useState } from 'react';
import { getActiveSchool } from '@/lib/tenant';
import { CheckSquare, Send, Clock, CheckCircle } from 'lucide-react';

export default function SaaSAdminPOsPage() {
  const school = getActiveSchool();
  const [orders] = useState([
    { id: 'PO-2026-001', supplierId: 'Apex Stationers Ltd', totalAmount: 32000, status: 'sent', createdAt: '2026-07-19T09:00:00Z' },
    { id: 'PO-2026-002', supplierId: 'ChemLab Supplies', totalAmount: 18500, status: 'issued', createdAt: '2026-07-20T14:30:00Z' },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
          <CheckSquare className="text-gold" size={24} /> Issued Purchase Orders (PO)
        </h1>
        <p className="text-white/40 text-xs mt-1">Official purchase orders issued to verified vendors for {school.name}.</p>
      </div>

      <div className="bg-navy-800 rounded-2xl border border-white/5 p-6 space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
            <div>
              <span className="font-mono text-gold font-bold text-sm">{o.id}</span>
              <p className="text-white font-semibold mt-0.5">{o.supplierId}</p>
              <p className="text-white/40">Total Commitment: <span className="text-white font-mono font-bold">KES {o.totalAmount.toLocaleString()}</span></p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 font-semibold uppercase text-[10px] border border-blue-500/20">
              {o.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
