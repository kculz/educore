'use client';

import { FileSpreadsheet, Download } from 'lucide-react';

const FEE_BREAKDOWN = [
  { category: 'Tuition & Academic Instructions', term1: 25000, term2: 20000, term3: 20000 },
  { category: 'Boarding & Accommodation', term1: 18000, term2: 18000, term3: 18000 },
  { category: 'Laboratory & Science Equipment', term1: 4500, term2: 2500, term3: 2500 },
  { category: 'ICT & Computer Lab Infrastructure', term1: 3500, term2: 2000, term3: 2000 },
  { category: 'Sports, Clubs & Co-Curricular', term1: 2500, term2: 1500, term3: 1500 },
  { category: 'Medical & Student Insurance', term1: 2000, term2: 1000, term3: 1000 },
];

export default function FeeStructurePage() {
  const term1Total = FEE_BREAKDOWN.reduce((s, i) => s + i.term1, 0);
  const term2Total = FEE_BREAKDOWN.reduce((s, i) => s + i.term2, 0);
  const term3Total = FEE_BREAKDOWN.reduce((s, i) => s + i.term3, 0);
  const annualTotal = term1Total + term2Total + term3Total;

  function formatKES(val: number) {
    return `KES ${val.toLocaleString('en-KE')}`;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Fee Structure 2026</h1>
          <p className="text-white/40 text-xs mt-1">Itemized breakdown of academic fees per term (Form 1 - Form 4).</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors">
          <Download size={14} /> Download Schedule PDF
        </button>
      </div>

      <div className="bg-navy-800 rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/5 text-gold uppercase tracking-wider font-semibold border-b border-white/5">
            <tr>
              <th className="py-4 px-6">Vote Head / Category</th>
              <th className="py-4 px-4 text-right">Term 1</th>
              <th className="py-4 px-4 text-right">Term 2</th>
              <th className="py-4 px-4 text-right">Term 3</th>
              <th className="py-4 px-6 text-right">Annual Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/70">
            {FEE_BREAKDOWN.map((row) => (
              <tr key={row.category} className="hover:bg-white/5 transition-colors">
                <td className="py-3.5 px-6 font-medium text-white">{row.category}</td>
                <td className="py-3.5 px-4 text-right font-mono">{formatKES(row.term1)}</td>
                <td className="py-3.5 px-4 text-right font-mono">{formatKES(row.term2)}</td>
                <td className="py-3.5 px-4 text-right font-mono">{formatKES(row.term3)}</td>
                <td className="py-3.5 px-6 text-right font-mono font-semibold text-white">
                  {formatKES(row.term1 + row.term2 + row.term3)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gold/10 font-bold text-white border-t border-gold/20">
            <tr>
              <td className="py-4 px-6">Total Payable per Term</td>
              <td className="py-4 px-4 text-right font-mono text-gold">{formatKES(term1Total)}</td>
              <td className="py-4 px-4 text-right font-mono text-gold">{formatKES(term2Total)}</td>
              <td className="py-4 px-4 text-right font-mono text-gold">{formatKES(term3Total)}</td>
              <td className="py-4 px-6 text-right font-mono text-gold text-sm">{formatKES(annualTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
