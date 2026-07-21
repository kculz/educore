'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAccessToken } from '@/lib/auth';
import { listPurchaseRequests, createPurchaseRequest, submitPurchaseRequest, approvePurchaseRequest } from '@/lib/api';
import { FileText, Plus, CheckCircle, Clock, XCircle, Loader2, AlertCircle } from 'lucide-react';

type PurchaseRequest = {
  id: string;
  requestNumber?: string;
  title: string;
  department: string;
  estimatedAmount: number;
  status: string;
  createdAt: string;
};

export default function PurchaseRequestsPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', department: 'Science Dept', estimatedAmount: 50000, description: '' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) { setError('Not authenticated'); setLoading(false); return; }
    try {
      const res = await listPurchaseRequests(token) as PurchaseRequest[];
      setRequests(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) return;
    try {
      await createPurchaseRequest(token, form);
      setShowModal(false);
      setForm({ title: '', department: 'Science Dept', estimatedAmount: 50000, description: '' });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create request');
    }
  }

  async function handleSubmitReq(id: string) {
    const token = getAccessToken();
    if (!token) return;
    setActionLoading(id);
    try {
      await submitPurchaseRequest(token, id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleApproveReq(id: string) {
    const token = getAccessToken();
    if (!token) return;
    setActionLoading(id);
    try {
      await approvePurchaseRequest(token, id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve request');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Purchase Requests</h1>
          <p className="text-white/40 text-xs mt-1">Requisitions submitted by school departments.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold gold-gradient text-xs hover:opacity-90 transition-opacity"
          style={{ color: '#0a1628' }}
        >
          <Plus size={16} /> New Request
        </button>
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

      {!loading && !error && requests.length === 0 && (
        <div className="bg-navy-800 rounded-2xl border border-white/5 p-12 text-center">
          <FileText size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/60 text-sm font-medium">No purchase requests found</p>
          <p className="text-white/30 text-xs mt-1">Create your first purchase request using the button above.</p>
        </div>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="bg-navy-800 rounded-2xl border border-white/5 overflow-hidden">
          <div className="divide-y divide-white/5">
            {requests.map((req) => (
              <div key={req.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-semibold text-sm">{req.title}</h3>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                      req.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                      req.status === 'submitted' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-white/40">
                    <span>Dept: <span className="text-white/70">{req.department}</span></span>
                    <span>Ref: <span className="text-gold font-mono">{req.id.slice(0, 8).toUpperCase()}</span></span>
                    <span>Date: {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="font-serif text-base font-bold text-gold">
                      KES {req.estimatedAmount.toLocaleString('en-KE')}
                    </p>
                  </div>
                  {req.status === 'draft' && (
                    <button
                      disabled={actionLoading === req.id}
                      onClick={() => handleSubmitReq(req.id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/30 transition-colors"
                    >
                      Submit
                    </button>
                  )}
                  {req.status === 'submitted' && (
                    <button
                      disabled={actionLoading === req.id}
                      onClick={() => handleApproveReq(req.id)}
                      className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-500/30 transition-colors"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-serif text-xl font-bold text-white mb-4">Create Purchase Request</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Science Lab Chemicals"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Department *</label>
                <input
                  type="text"
                  required
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Estimated Amount (KES) *</label>
                <input
                  type="number"
                  required
                  value={form.estimatedAmount}
                  onChange={(e) => setForm({ ...form, estimatedAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-white/50 hover:text-white">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl font-semibold gold-gradient text-xs" style={{ color: '#0a1628' }}>
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
