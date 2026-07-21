'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAccessToken } from '@/lib/auth';
import { listGRNs } from '@/lib/api';
import { Truck, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

type GRNItem = {
  id: string;
  grnNumber?: string;
  purchaseOrderId: string;
  deliveryNoteNumber: string;
  receivedDate: string;
  createdAt: string;
};

export default function GRNsPage() {
  const [grns, setGrns] = useState<GRNItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) { setError('Not authenticated'); setLoading(false); return; }
    try {
      const res = await listGRNs(token) as GRNItem[];
      setGrns(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load GRNs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white">Goods Received Notes (GRN)</h1>
        <p className="text-white/40 text-xs mt-1">Audit log of all physical deliveries recorded against Purchase Orders.</p>
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

      {!loading && !error && grns.length === 0 && (
        <div className="bg-navy-800 rounded-2xl border border-white/5 p-12 text-center">
          <Truck size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/60 text-sm font-medium">No deliveries recorded</p>
          <p className="text-white/30 text-xs mt-1">Goods Received Notes are recorded upon inspecting vendor deliveries.</p>
        </div>
      )}

      {!loading && !error && grns.length > 0 && (
        <div className="bg-navy-800 rounded-2xl border border-white/5 overflow-hidden">
          <div className="divide-y divide-white/5">
            {grns.map((g) => (
              <div key={g.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shrink-0" style={{ color: '#0a1628' }}>
                  <Truck size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-semibold text-sm">GRN #{g.grnNumber ?? g.id.slice(0, 8).toUpperCase()}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                      Received
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-white/40">
                    <span>Delivery Note #: <span className="text-white/70">{g.deliveryNoteNumber}</span></span>
                    <span>PO Ref: <span className="text-gold font-mono">{g.purchaseOrderId?.slice(0, 8).toUpperCase()}</span></span>
                    <span>Received: {new Date(g.receivedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
