'use client';

import { useEffect, useState } from 'react';
import { getAdminAccessToken } from '@/lib/auth';
import {
  getAdminProcurementDashboard, listAdminPurchaseRequests, approveAdminPurchaseRequest,
  rejectAdminPurchaseRequest, listAdminPurchaseOrders, listAdminSuppliers, listAdminQuotations,
  acceptAdminQuotation, listAdminContracts, listAdminGRNs
} from '@/lib/api';
import { getActiveSchool } from '@/lib/tenant';
import { ShoppingCart, Building2, FileText, CheckCircle, XCircle, Clock, Send, Eye, ShieldCheck, Loader2, X } from 'lucide-react';

export default function SaaSAdminProcurementPage() {
  const school = getActiveSchool();
  const [tab, setTab] = useState<'requests' | 'orders' | 'suppliers' | 'quotes' | 'contracts' | 'grns'>('requests');
  const [loading, setLoading] = useState(true);

  // States
  const [requests, setRequests] = useState([
    { id: 'PR-2026-001', title: 'Laboratory Chemicals & Apparatus', department: 'Science Dept', estimatedAmount: 18500, status: 'submitted', createdAt: '2026-07-20T10:00:00Z' },
    { id: 'PR-2026-002', title: 'Library Textbooks (Curriculum 2026)', department: 'Academics', estimatedAmount: 32000, status: 'approved', createdAt: '2026-07-18T11:30:00Z' },
  ]);

  const [orders, setOrders] = useState([
    { id: 'PO-2026-001', supplierId: 'Apex Stationers Ltd', totalAmount: 32000, status: 'sent', createdAt: '2026-07-19T09:00:00Z' },
  ]);

  const [suppliers, setSuppliers] = useState([
    { id: 'SUP-001', name: 'Apex Stationers Ltd', category: 'Stationery', email: 'sales@apexstationers.co.zw', phone: '+263 77 123 4567', status: 'verified' },
    { id: 'SUP-002', name: 'ChemLab Supplies', category: 'Science Equip', email: 'orders@chemlab.co.zw', phone: '+263 71 987 6543', status: 'verified' },
  ]);

  const [quotes, setQuotes] = useState([
    { id: 'QT-001', prId: 'PR-2026-001', supplier: 'ChemLab Supplies', amount: 17800, validUntil: '2026-08-30', status: 'submitted' },
  ]);

  const [contracts, setContracts] = useState([
    { id: 'CTR-001', title: 'School Food & Catering SLA', supplier: 'Fresh Harvest Foods', contractValue: 120000, startDate: '2026-01-01', endDate: '2026-12-31', status: 'active' },
  ]);

  const [grns, setGrns] = useState([
    { id: 'GRN-001', poId: 'PO-2026-001', deliveryNote: 'DN-99482', receivedDate: '2026-07-21', status: 'received' },
  ]);

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const token = getAdminAccessToken();
      if (!token) { setLoading(false); return; }
      try {
        const [reqs, pos, supps, qts, ctrs, gns] = await Promise.allSettled([
          listAdminPurchaseRequests(token),
          listAdminPurchaseOrders(token),
          listAdminSuppliers(token),
          listAdminQuotations(token),
          listAdminContracts(token),
          listAdminGRNs(token),
        ]);
        if (reqs.status === 'fulfilled' && Array.isArray(reqs.value) && reqs.value.length > 0) setRequests(reqs.value);
        if (pos.status === 'fulfilled' && Array.isArray(pos.value) && pos.value.length > 0) setOrders(pos.value);
        if (supps.status === 'fulfilled' && Array.isArray(supps.value) && supps.value.length > 0) setSuppliers(supps.value);
        if (qts.status === 'fulfilled' && Array.isArray(qts.value) && qts.value.length > 0) setQuotes(qts.value);
        if (ctrs.status === 'fulfilled' && Array.isArray(ctrs.value) && ctrs.value.length > 0) setContracts(ctrs.value);
        if (gns.status === 'fulfilled' && Array.isArray(gns.value) && gns.value.length > 0) setGrns(gns.value);
      } catch (err) {
        console.warn('Procurement load warning', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleApprovePR(id: string) {
    setActionLoading(true);
    const token = getAdminAccessToken();
    try {
      if (token) await approveAdminPurchaseRequest(token, id);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Approve failed');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRejectPR(id: string) {
    setActionLoading(true);
    const token = getAdminAccessToken();
    try {
      if (token) await rejectAdminPurchaseRequest(token, id, 'Budget cap exceeded');
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Reject failed');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAcceptQuote(id: string) {
    setActionLoading(true);
    const token = getAdminAccessToken();
    try {
      if (token) await acceptAdminQuotation(token, id);
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: 'accepted' } : q));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Accept quote failed');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="text-gold" size={24} /> Procurement & Supply Chain Management
        </h1>
        <p className="text-white/40 text-xs mt-1">Manage Purchase Requests, Purchase Orders, Suppliers, Quotations, Contracts & Goods Received Notes for {school.name}.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 overflow-x-auto pb-2">
        {[
          { id: 'requests', label: `Purchase Requests (${requests.length})` },
          { id: 'orders', label: `Purchase Orders (${orders.length})` },
          { id: 'suppliers', label: `Suppliers (${suppliers.length})` },
          { id: 'quotes', label: `Bids & Quotes (${quotes.length})` },
          { id: 'contracts', label: `Contracts (${contracts.length})` },
          { id: 'grns', label: `GRNs (${grns.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              tab === t.id ? 'bg-gold/15 text-gold border border-gold/30' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-navy-800 rounded-2xl border border-white/5 p-6">
        {tab === 'requests' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm">Departmental Purchase Requisitions</h3>
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-gold font-semibold uppercase">{r.id}</span>
                    <h4 className="text-white font-semibold text-sm mt-0.5">{r.title}</h4>
                    <p className="text-white/40 text-xs">{r.department} · Estimated: <span className="text-gold font-bold">KES {r.estimatedAmount.toLocaleString()}</span></p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                      r.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                      r.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {r.status}
                    </span>

                    {r.status === 'submitted' && (
                      <div className="flex gap-2">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleRejectPR(r.id)}
                          className="px-3 py-1 rounded-lg border border-red-500/30 text-red-400 text-[11px] font-semibold hover:bg-red-500/10"
                        >
                          Reject
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleApprovePR(r.id)}
                          className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-[11px] font-semibold hover:bg-green-500/30"
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm">Issued Purchase Orders (PO)</h3>
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-gold font-bold">{o.id}</span>
                    <p className="text-white font-semibold mt-0.5">{o.supplierId}</p>
                    <p className="text-white/40">Total Commitment: KES {o.totalAmount.toLocaleString()}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-semibold uppercase text-[10px]">
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'suppliers' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm">Registered Vendor Directory</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {suppliers.map((s) => (
                <div key={s.id} className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-bold">{s.name}</h4>
                    <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-semibold">Verified</span>
                  </div>
                  <p className="text-gold font-medium mt-1">{s.category}</p>
                  <p className="text-white/40 mt-2">{s.email} · {s.phone}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'quotes' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm">Supplier Quotations & Bids</h3>
            <div className="space-y-3">
              {quotes.map((q) => (
                <div key={q.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-gold">{q.id}</span> (For {q.prId})
                    <p className="text-white font-bold text-sm mt-0.5">{q.supplier}</p>
                    <p className="text-white/40">Bid Amount: <span className="text-green-400 font-mono font-bold">KES {q.amount.toLocaleString()}</span></p>
                  </div>
                  {q.status === 'submitted' ? (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleAcceptQuote(q.id)}
                      className="px-4 py-2 rounded-xl gold-gradient text-navy-900 font-bold text-xs"
                      style={{ color: '#0a1628' }}
                    >
                      Accept Bid & Issue PO
                    </button>
                  ) : (
                    <span className="text-green-400 font-bold">✓ Bid Accepted</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'contracts' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm">Supplier SLA Contracts</h3>
            <div className="space-y-3">
              {contracts.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs">
                  <h4 className="text-white font-bold">{c.title}</h4>
                  <p className="text-gold font-medium mt-0.5">{c.supplier}</p>
                  <p className="text-white/40 mt-1">Contract Value: KES {c.contractValue.toLocaleString()} · Valid: {c.startDate} to {c.endDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'grns' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm">Goods Received Notes (GRN)</h3>
            <div className="space-y-3">
              {grns.map((g) => (
                <div key={g.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-gold font-bold">{g.id}</span> (PO: {g.poId})
                    <p className="text-white mt-0.5">Delivery Note #{g.deliveryNote}</p>
                    <p className="text-white/40">Received Date: {g.receivedDate}</p>
                  </div>
                  <span className="bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full font-semibold">✓ Verified Delivery</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
