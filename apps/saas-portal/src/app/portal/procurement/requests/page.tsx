'use client';

import { useEffect, useState } from 'react';
import { getAdminAccessToken } from '@/lib/auth';
import { listAdminPurchaseRequests, approveAdminPurchaseRequest, rejectAdminPurchaseRequest } from '@/lib/api';
import { getActiveSchool } from '@/lib/tenant';
import { FileText, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

export default function SaaSAdminPRsPage() {
  const school = getActiveSchool();
  const [requests, setRequests] = useState([
    { id: 'PR-2026-001', title: 'Laboratory Chemicals & Apparatus', department: 'Science Dept', estimatedAmount: 18500, status: 'submitted', createdAt: '2026-07-20T10:00:00Z' },
    { id: 'PR-2026-002', title: 'Library Textbooks (Curriculum 2026)', department: 'Academics', estimatedAmount: 32000, status: 'approved', createdAt: '2026-07-18T11:30:00Z' },
    { id: 'PR-2026-003', title: 'Sports Kits & Athletic Equipment', department: 'Sports & PE', estimatedAmount: 12500, status: 'submitted', createdAt: '2026-07-21T09:15:00Z' },
  ]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  async function handleApprove(id: string) {
    setActionLoading(true);
    const token = getAdminAccessToken();
    try {
      if (token) await approveAdminPurchaseRequest(token, id);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    } catch (err) {
      alert('Approve failed');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(id: string) {
    setActionLoading(true);
    const token = getAdminAccessToken();
    try {
      if (token) await rejectAdminPurchaseRequest(token, id, 'Budget cap exceeded');
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    } catch (err) {
      alert('Reject failed');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="text-gold" size={24} /> Departmental Purchase Requisitions (PR)
        </h1>
        <p className="text-white/40 text-xs mt-1">Review, approve, or reject department purchase requests for {school.name}.</p>
      </div>

      <div className="bg-navy-800 rounded-2xl border border-white/5 p-6 space-y-4">
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
                  r.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                  r.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}>
                  {r.status}
                </span>

                {r.status === 'submitted' && (
                  <div className="flex gap-2">
                    <button
                      disabled={actionLoading}
                      onClick={() => handleReject(r.id)}
                      className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/10"
                    >
                      Reject
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleApprove(r.id)}
                      className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-500/30"
                    >
                      Approve Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
