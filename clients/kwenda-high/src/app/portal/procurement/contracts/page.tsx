'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAccessToken } from '@/lib/auth';
import { listContracts, createContract } from '@/lib/api';
import { FileCheck, Plus, Calendar, Loader2, AlertCircle } from 'lucide-react';

type Contract = {
  id: string;
  supplierId: string;
  title: string;
  contractValue: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ supplierId: 'sup-1', title: '', contractValue: 250000, startDate: '', endDate: '', terms: '' });

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) { setError('Not authenticated'); setLoading(false); return; }
    try {
      const res = await listContracts(token) as Contract[];
      setContracts(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contracts');
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
      await createContract(token, form);
      setShowModal(false);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create contract');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Supplier Contracts</h1>
          <p className="text-white/40 text-xs mt-1">Long-term vendor service level agreements.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold gold-gradient text-xs hover:opacity-90 transition-opacity"
          style={{ color: '#0a1628' }}
        >
          <Plus size={16} /> New Contract
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

      {!loading && !error && contracts.length === 0 && (
        <div className="bg-navy-800 rounded-2xl border border-white/5 p-12 text-center">
          <FileCheck size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/60 text-sm font-medium">No contracts active</p>
          <p className="text-white/30 text-xs mt-1">Register supplier contracts to track SLAs and expiry dates.</p>
        </div>
      )}

      {!loading && !error && contracts.length > 0 && (
        <div className="bg-navy-800 rounded-2xl border border-white/5 overflow-hidden">
          <div className="divide-y divide-white/5">
            {contracts.map((c) => (
              <div key={c.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-semibold text-sm">{c.title}</h3>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                      c.status === 'active' ? 'bg-green-500/10 text-green-400' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-white/40">
                    <span>Duration: {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-serif text-base font-bold text-gold">
                    KES {c.contractValue.toLocaleString('en-KE')}
                  </p>
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
            <h3 className="font-serif text-xl font-bold text-white mb-4">Create Contract</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">Contract Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Annual Food Supply Agreement"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Contract Value (KES) *</label>
                <input
                  type="number"
                  required
                  value={form.contractValue}
                  onChange={(e) => setForm({ ...form, contractValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-white/50 hover:text-white">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl font-semibold gold-gradient text-xs" style={{ color: '#0a1628' }}>
                  Create Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
