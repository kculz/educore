'use client';

import { useState } from 'react';
import { getActiveSchool } from '@/lib/tenant';
import { Users, Plus, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export default function SaaSAdminSuppliersPage() {
  const school = getActiveSchool();
  const [suppliers] = useState([
    { id: 'SUP-001', name: 'Apex Stationers Ltd', category: 'Stationery & Printing', email: 'sales@apexstationers.co.zw', phone: '+263 77 123 4567', status: 'verified' },
    { id: 'SUP-002', name: 'ChemLab Supplies', category: 'Science & Lab Equipment', email: 'orders@chemlab.co.zw', phone: '+263 71 987 6543', status: 'verified' },
    { id: 'SUP-003', name: 'Fresh Harvest Foods', category: 'Catering & Food Provisions', email: 'info@freshharvest.co.zw', phone: '+263 73 444 5566', status: 'verified' },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
          <Users className="text-gold" size={24} /> Approved Vendor & Supplier Directory
        </h1>
        <p className="text-white/40 text-xs mt-1">Directory of accredited vendors and supply partners for {school.name}.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        {suppliers.map((s) => (
          <div key={s.id} className="bg-navy-800 p-5 rounded-2xl border border-white/5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-gold font-semibold text-[10px]">{s.id}</span>
              <span className="bg-green-500/10 text-green-400 text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                <ShieldCheck size={12} /> Verified
              </span>
            </div>
            <h3 className="text-white font-bold text-base">{s.name}</h3>
            <p className="text-gold font-medium">{s.category}</p>
            <div className="pt-2 border-t border-white/5 space-y-1 text-white/50">
              <p className="flex items-center gap-1.5"><Mail size={12} /> {s.email}</p>
              <p className="flex items-center gap-1.5"><Phone size={12} /> {s.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
