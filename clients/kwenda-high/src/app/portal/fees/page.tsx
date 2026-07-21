'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAccessToken } from '@/lib/auth';
import { listInvoices } from '@/lib/api';
import { Receipt, CheckCircle, AlertCircle, Clock, Loader2, CreditCard } from 'lucide-react';

type Invoice = {
  id: string;
  studentId: string;
  studentName?: string;
  amount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  dueDate: string;
  description?: string;
  createdAt: string;
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle; color: string }> = {
  draft: { label: 'Draft', icon: Clock, color: 'text-slate-400 bg-slate-400/10' },
  issued: { label: 'Due', icon: AlertCircle, color: 'text-yellow-400 bg-yellow-400/10' },
  partial: { label: 'Partial', icon: Clock, color: 'text-blue-400 bg-blue-400/10' },
  paid: { label: 'Paid', icon: CheckCircle, color: 'text-green-400 bg-green-400/10' },
  overdue: { label: 'Overdue', icon: AlertCircle, color: 'text-red-400 bg-red-400/10' },
  cancelled: { label: 'Cancelled', icon: AlertCircle, color: 'text-slate-500 bg-slate-500/10' },
};

function formatKES(amount: number) {
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PortalFeesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) { setError('Not authenticated'); setLoading(false); return; }
    try {
      const data = await listInvoices(token) as Invoice[];
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const outstanding = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').reduce((s, i) => s + (i.balanceAmount ?? 0), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.paidAmount ?? 0), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white">Fees & Payments</h1>
        <p className="text-white/40 text-sm mt-1">View your invoices and payment history</p>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Outstanding Balance', value: formatKES(outstanding), sub: 'Across all invoices', color: 'text-yellow-400' },
          { label: 'Total Paid', value: formatKES(totalPaid), sub: 'This academic year', color: 'text-green-400' },
          { label: 'Total Invoices', value: `${invoices.length}`, sub: `${invoices.filter(i => i.status === 'paid').length} paid`, color: 'text-blue-400' },
        ].map((card) => (
          <div key={card.label} className="bg-navy-800 rounded-2xl border border-white/5 p-6">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{card.label}</p>
            <p className={`font-serif text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-white/30 text-xs mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="text-gold animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-navy-800 rounded-2xl border border-white/5 p-8 text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-white/60 text-sm">{error}</p>
          <p className="text-white/30 text-xs mt-2">Make sure the EduCore API is running at <code className="text-gold">localhost:3001</code></p>
        </div>
      )}

      {!loading && !error && invoices.length === 0 && (
        <div className="bg-navy-800 rounded-2xl border border-white/5 p-12 text-center">
          <Receipt size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/60 text-sm font-medium">No invoices yet</p>
          <p className="text-white/30 text-xs mt-1">Your fee invoices will appear here once issued.</p>
        </div>
      )}

      {!loading && !error && invoices.length > 0 && (
        <div className="bg-navy-800 rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-white font-semibold text-sm">Invoice History</h3>
          </div>
          <div className="divide-y divide-white/5">
            {invoices.map((inv) => {
              const s = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG['issued'];
              return (
                <div key={inv.id} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white text-sm font-medium">{inv.description ?? `Invoice ${inv.id.slice(0, 8).toUpperCase()}`}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${s.color}`}>
                        <s.icon size={10} /> {s.label}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-white/30">
                      <span>Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                      <span>Total: <span className="text-white/50">{formatKES(inv.amount)}</span></span>
                      {inv.paidAmount > 0 && <span>Paid: <span className="text-green-400">{formatKES(inv.paidAmount)}</span></span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-lg ${inv.status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {formatKES(inv.balanceAmount ?? 0)}
                    </p>
                    <p className="text-white/30 text-xs">
                      {inv.status === 'paid' ? 'Fully paid' : 'Balance due'}
                    </p>
                    {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                      <button className="mt-2 flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold gold-gradient hover:opacity-90 transition-opacity" style={{ color: '#0a1628' }}>
                        <CreditCard size={12} /> Pay Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
