'use client';

import { useEffect, useState } from 'react';
import { getAccessToken } from '@/lib/auth';
import { listReceipts } from '@/lib/api';
import { FileCheck, Download, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

type ReceiptItem = {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  transactionReference: string;
  createdAt: string;
};

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const token = getAccessToken();
      if (!token) { setError('Not authenticated'); setLoading(false); return; }
      try {
        const res = await listReceipts(token) as ReceiptItem[];
        setReceipts(Array.isArray(res) ? res : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load receipts');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white">Payment Receipts</h1>
        <p className="text-white/40 text-xs mt-1">Official payment receipts generated for fee settlements.</p>
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

      {!loading && !error && receipts.length === 0 && (
        <div className="bg-navy-800 rounded-2xl border border-white/5 p-12 text-center">
          <FileCheck size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/60 text-sm font-medium">No receipts available</p>
          <p className="text-white/30 text-xs mt-1">Payment receipts will be generated automatically once an invoice is paid.</p>
        </div>
      )}

      {!loading && !error && receipts.length > 0 && (
        <div className="bg-navy-800 rounded-2xl border border-white/5 overflow-hidden">
          <div className="divide-y divide-white/5">
            {receipts.map((rcpt) => (
              <div key={rcpt.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shrink-0" style={{ color: '#0a1628' }}>
                  <FileCheck size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-semibold text-sm">Receipt #{rcpt.receiptNumber ?? rcpt.id.slice(0, 8).toUpperCase()}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                      Verified
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-white/40">
                    <span>Ref: <span className="text-gold font-mono">{rcpt.transactionReference || 'N/A'}</span></span>
                    <span>Method: <span className="capitalize text-white/70">{rcpt.paymentMethod || 'M-Pesa'}</span></span>
                    <span>Date: {new Date(rcpt.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="font-serif text-lg font-bold text-green-400">
                      KES {rcpt.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="Download Receipt PDF">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
