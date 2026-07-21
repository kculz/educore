'use client';

import { useState } from 'react';
import { getActiveSchool } from '@/lib/tenant';
import { Truck, CheckCircle } from 'lucide-react';

export default function SaaSAdminGRNsPage() {
  const school = getActiveSchool();
  const [grns] = useState([
    { id: 'GRN-001', poId: 'PO-2026-001', deliveryNote: 'DN-99482', receivedDate: '2026-07-21', status: 'received', remarks: 'All stationery delivered in good order.' },
    { id: 'GRN-002', poId: 'PO-2026-002', deliveryNote: 'DN-77310', receivedDate: '2026-07-20', status: 'received', remarks: 'Lab chemicals verified against packing list.' },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
          <Truck className="text-gold" size={24} /> Goods Received Notes (GRN)
        </h1>
        <p className="text-white/40 text-xs mt-1">Record and verify material deliveries against purchase orders for {school.name}.</p>
      </div>

      <div className="bg-navy-800 rounded-2xl border border-white/5 p-6 space-y-3">
        {grns.map((g) => (
          <div key={g.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
            <div>
              <span className="font-mono text-gold font-bold">{g.id}</span> (Linked to {g.poId})
              <p className="text-white font-semibold mt-0.5">Delivery Note #{g.deliveryNote}</p>
              <p className="text-white/40">Received Date: {g.receivedDate} · {g.remarks}</p>
            </div>
            <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full font-semibold text-[10px] flex items-center gap-1">
              <CheckCircle size={13} /> Verified Delivery
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
