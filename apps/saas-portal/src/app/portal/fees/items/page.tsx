'use client';

import { useState } from 'react';
import { getActiveSchool } from '@/lib/tenant';
import { Tag, Plus, CheckCircle } from 'lucide-react';

export default function SaaSAdminFeeItemsPage() {
  const school = getActiveSchool();
  const [items, setItems] = useState([
    { id: 'FEE-01', name: 'Term Tuition Fee', category: 'Tuition', defaultAmount: 35000, description: 'Core academic instruction and curriculum assessment fee.' },
    { id: 'FEE-02', name: 'Boarding & Catering Levy', category: 'Accommodation', defaultAmount: 10000, description: 'Boarding house maintenance and meal service.' },
    { id: 'FEE-03', name: 'Science Laboratory & Practical Fee', category: 'Academic Practical', defaultAmount: 3500, description: 'Lab chemicals, apparatus, and practical exam materials.' },
    { id: 'FEE-04', name: 'Computer & IT Skills Levy', category: 'Technology', defaultAmount: 2500, description: 'ICT lab usage and software licensing.' },
  ]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
          <Tag className="text-gold" size={24} /> Term Fee Structures & Line Items
        </h1>
        <p className="text-white/40 text-xs mt-1">Configure default tuition fees, lab levies, and boarding charges for {school.name}.</p>
      </div>

      <div className="bg-navy-800 rounded-2xl border border-white/5 p-6 space-y-4">
        <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-3">Active Fee Components</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-gold font-semibold text-[10px]">{item.id}</span>
                <span className="bg-gold/10 text-gold font-mono font-bold text-xs px-2.5 py-0.5 rounded">
                  KES {item.defaultAmount.toLocaleString()}
                </span>
              </div>
              <h4 className="text-white font-bold text-sm">{item.name}</h4>
              <p className="text-white/40 text-xs leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
