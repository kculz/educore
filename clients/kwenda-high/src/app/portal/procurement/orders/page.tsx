'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAccessToken } from '@/lib/auth';
import { listPurchaseOrders, sendPurchaseOrder } from '@/lib/api';
import { PackageCheck, Send, Loader2, AlertCircle } from 'lucide-react';

type PurchaseOrder = {
  id: string;
  poNumber?: string;
  purchaseRequestId: string;
  supplierId: string;
  totalAmount: number;
  status: string;
  expectedDeliveryDate?: string;
  createdAt: string;
};

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) { setError('Not authenticated'); setLoading(false); return; }
    try {
      const res = await listPurchaseOrders(token) as PurchaseOrder[];
      setOrders(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSend(id: string) {
    const token = getAccessToken();
    if (!token) return;
    setActionLoading(id);
    try {
      await sendPurchaseOrder(token, id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send PO');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white">Purchase Orders</h1>
        <p className="text-white/40 text-xs mt-1">Track purchase orders issued to suppliers.</p>
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

      {!loading && !error && orders.length === 0 && (
        <div className="bg-navy-800 rounded-2xl border border-white/5 p-12 text-center">
          <PackageCheck size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/60 text-sm font-medium">No purchase orders found</p>
          <p className="text-white/30 text-xs mt-1">Purchase orders are issued when a purchase request is approved.</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="bg-navy-800 rounded-2xl border border-white/5 overflow-hidden">
          <div className="divide-y divide-white/5">
            {orders.map((po) => (
              <div key={po.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-semibold text-sm">PO #{po.poNumber ?? po.id.slice(0, 8).toUpperCase()}</h3>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                      po.status === 'sent' ? 'bg-blue-500/10 text-blue-400' :
                      po.status === 'fully_received' ? 'bg-green-500/10 text-green-400' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {po.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-white/40">
                    <span>PR Ref: <span className="text-white/70">{po.purchaseRequestId?.slice(0, 8).toUpperCase()}</span></span>
                    <span>Issued: {new Date(po.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="font-serif text-base font-bold text-gold">
                      KES {po.totalAmount.toLocaleString('en-KE')}
                    </p>
                  </div>
                  {po.status === 'draft' && (
                    <button
                      disabled={actionLoading === po.id}
                      onClick={() => handleSend(po.id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/30 transition-colors flex items-center gap-1"
                    >
                      <Send size={12} /> Send to Supplier
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
