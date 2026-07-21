'use client';

import { useEffect, useState } from 'react';
import { getAdminAccessToken } from '@/lib/auth';
import { listAdminReceipts } from '@/lib/api';
import { getActiveSchool } from '@/lib/tenant';
import { FileText, CheckCircle, Search, Loader2 } from 'lucide-react';

export default function SaaSAdminReceiptsPage() {
  const school = getActiveSchool();
  const [receipts, setReceipts] = useState([
    { id: 'RCPT-2026-8839', invoiceId: 'INV-2026-001', studentName: 'Mary Wambui', amount: 45000, paymentMethod: 'M-Pesa Paybill', reference: 'MPESA-998811', date: '2026-07-20' },
    { id: 'RCPT-2026-7712', invoiceId: 'INV-2026-002', studentName: 'Brian Otieno', amount: 18000, paymentMethod: 'Bank Transfer', reference: 'EFT-776211', date: '2026-07-19' },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="text-gold" size={24} /> Payment Receipts & Bank Audit Log
        </h1>
        <p className="text-white/40 text-xs mt-1">Audit log of all verified bank deposits, M-Pesa receipts, and counter payments for {school.name}.</p>
      </div>

      <div className="bg-navy-800 rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/5 text-white/40 text-[10px] font-semibold uppercase tracking-wider border-b border-white/5">
            <tr>
              <th className="py-3.5 px-4">Receipt Ref</th>
              <th className="py-3.5 px-4">Invoice #</th>
              <th className="py-3.5 px-4">Student</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Method</th>
              <th className="py-3.5 px-4">Transaction Ref</th>
              <th className="py-3.5 px-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/80">
            {receipts.map((rcpt) => (
              <tr key={rcpt.id} className="hover:bg-white/5 transition-colors">
                <td className="py-3.5 px-4 font-mono text-gold font-bold">{rcpt.id}</td>
                <td className="py-3.5 px-4 font-mono text-white/60">{rcpt.invoiceId}</td>
                <td className="py-3.5 px-4 font-semibold text-white">{rcpt.studentName}</td>
                <td className="py-3.5 px-4 font-mono text-green-400 font-bold">KES {rcpt.amount.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-white">{rcpt.paymentMethod}</td>
                <td className="py-3.5 px-4 font-mono text-gold">{rcpt.reference}</td>
                <td className="py-3.5 px-4 text-white/40">{rcpt.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
