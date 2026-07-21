'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAccessToken } from '@/lib/auth';
import { listQuotations, acceptQuotation } from '@/lib/api';
import { FileSpreadsheet, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

type Quotation = {
  id: string;
  purchaseRequestId: string;
  supplierId: string;
  amount: number;
  status: string;
  validUntil: string;
  createdAt: string;
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) { setError('Not authenticated'); setLoading(false); return; }
    try {
      const res = await listQuotations(token) as Quotation[];
      setQuotations(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quotations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAccept(id: string) {
    const token = getAccessToken();
    if (!token) return;
    setActionLoading(id);
    try {
      await acceptQuotation(token, id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to accept quotation');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white">Quotations & Bids</h1>
        <p className="text-white/40 text-xs mt-1">Review and accept competitive bids submitted by vendors.</p>
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
        </div>
      )}

      {!loading && !error && quotations.length === 0 && (
        <div className="bg-navy-800 rounded-2xl border border-white/5 p-12 text-center">
          <FileSpreadsheet size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/60 text-sm font-medium">No quotations recorded</p>
          <p className="text-white/30 text-xs mt-1">Quotations received from suppliers for purchase requests will appear here.</p>
        </div>
      )}

      {!loading && !error && quotations.length > 0 && (
        <div className="bg-navy-800 rounded-2xl border border-white/5 overflow-hidden">
          <div className="divide-y divide-white/5">
            {quotations.map((q) => (
              <div key={q.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-semibold text-sm">Quote #{q.id.slice(0, 8).toUpperCase()}</h3>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                      q.status === 'accepted' ? 'bg-green-500/10 text-green-400' :
                      q.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {q.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-white/40">
                    <span>PR Ref: <span className="text-white/70">{q.purchaseRequestId?.slice(0, 8).toUpperCase()}</span></span>
                    <span>Valid Until: {new Date(q.validUntil).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="font-serif text-base font-bold text-gold">
                      KES {q.amount.toLocaleString('en-KE')}
                    </p>
                  </div>
                  {q.status === 'pending' && (
                    <button
                      disabled={actionLoading === q.id}
                      onClick={() => handleAccept(q.id)}
                      className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-500/30 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle size={12} /> Accept Quote
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
