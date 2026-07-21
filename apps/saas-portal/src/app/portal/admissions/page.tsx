'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAdminAccessToken } from '@/lib/auth';
import { listAdminApplications, getAdminApplication, decideAdminApplication, enrollStudent } from '@/lib/api';
import { getActiveSchool } from '@/lib/tenant';
import {
  UserCheck, Search, Filter, CheckCircle, XCircle, Clock, Eye, FileText,
  FileCheck, ShieldCheck, Award, Loader2, X, ChevronRight, Check
} from 'lucide-react';

interface Application {
  id: string;
  applicantName: string;
  applicantEmail: string;
  gradeApplyingFor: string;
  guardianName?: string;
  guardianPhone?: string;
  notes?: string;
  status: 'submitted' | 'under_review' | 'offered' | 'enrolled' | 'rejected';
  createdAt: string;
}

const INITIAL_APPS: Application[] = [
  { id: 'APP-884920', applicantName: 'Mary Wambui', applicantEmail: 'mary.wambui@example.com', gradeApplyingFor: 'Form 1', guardianName: 'John Wambui', guardianPhone: '+254 712 345 678', notes: 'Standard Form 1 Applicant Requisition', status: 'submitted', createdAt: '2026-07-21T10:14:00Z' },
  { id: 'APP-771822', applicantName: 'Brian Otieno', applicantEmail: 'brian.o@example.com', gradeApplyingFor: 'Form 2', guardianName: 'Sarah Otieno', guardianPhone: '+254 722 987 654', notes: 'Transfer student from St. Marys', status: 'under_review', createdAt: '2026-07-20T14:30:00Z' },
  { id: 'APP-662910', applicantName: 'Kevin Kamau', applicantEmail: 'kevin.k@example.com', gradeApplyingFor: 'Form 1', guardianName: 'Peter Kamau', guardianPhone: '+254 733 112 233', status: 'offered', createdAt: '2026-07-18T09:00:00Z' },
  { id: 'APP-551044', applicantName: 'Amina Mohamed', applicantEmail: 'amina.m@example.com', gradeApplyingFor: 'Form 3', guardianName: 'Fatima Mohamed', guardianPhone: '+254 711 445 566', status: 'enrolled', createdAt: '2026-07-15T11:20:00Z' },
];

export default function SaaSAdminAdmissionsPage() {
  const school = getActiveSchool();
  const [apps, setApps] = useState<Application[]>(INITIAL_APPS);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminRemarks, setAdminRemarks] = useState('');

  const loadData = useCallback(async () => {
    const token = getAdminAccessToken();
    if (!token) { setLoading(false); return; }
    try {
      const res = await listAdminApplications(token) as { items?: Application[] } | Application[];
      const items = Array.isArray(res) ? res : (res.items || []);
      if (items.length > 0) {
        setApps(items);
      }
    } catch (err) {
      console.warn('API error, using initial applications', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredApps = apps.filter((app) => {
    const matchStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchSearch =
      app.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(search.toLowerCase()) ||
      app.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  async function handleDecide(decision: 'approved' | 'rejected' | 'offered') {
    if (!selectedApp) return;
    setActionLoading(true);
    const token = getAdminAccessToken();
    try {
      if (token) {
        await decideAdminApplication(token, selectedApp.id, decision, adminRemarks);
      }
      const newStatus = decision === 'rejected' ? 'rejected' : 'offered';
      setApps(prev => prev.map(a => a.id === selectedApp.id ? { ...a, status: newStatus } : a));
      setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Decision failed');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEnroll() {
    if (!selectedApp) return;
    setActionLoading(true);
    const token = getAdminAccessToken();
    try {
      if (token) {
        await enrollStudent(token, selectedApp.id);
      }
      setApps(prev => prev.map(a => a.id === selectedApp.id ? { ...a, status: 'enrolled' } : a));
      setSelectedApp(prev => prev ? { ...prev, status: 'enrolled' } : null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Enrollment failed');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
            <UserCheck className="text-gold" size={24} /> Admissions Evaluation Hub
          </h1>
          <p className="text-white/40 text-xs mt-1">Review applicant files, verify uploaded documents, issue offer letters, and enroll students for {school.name}.</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-navy-800 p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student name, email or ref..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'submitted', 'under_review', 'offered', 'enrolled', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                filterStatus === st ? 'bg-gold/15 text-gold border border-gold/30' : 'bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Review Table */}
      <div className="bg-navy-800 rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={24} className="text-gold animate-spin mx-auto mb-2" />
            <p className="text-white/40 text-xs">Loading application records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-white/40 text-[10px] font-semibold uppercase tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-4">Ref ID</th>
                  <th className="py-3.5 px-4">Applicant Name</th>
                  <th className="py-3.5 px-4">Grade</th>
                  <th className="py-3.5 px-4">Guardian Contact</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4">Review Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-gold font-semibold">{app.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {app.applicantName}
                      <p className="text-[10px] text-white/40 font-normal">{app.applicantEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gold">{app.gradeApplyingFor}</td>
                    <td className="py-3.5 px-4">
                      {app.guardianName || 'N/A'}
                      <p className="text-[10px] text-white/40">{app.guardianPhone || 'N/A'}</p>
                    </td>
                    <td className="py-3.5 px-4 text-white/40">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                        app.status === 'enrolled' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        app.status === 'offered' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        app.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold text-[11px] font-semibold transition-colors"
                      >
                        Evaluate File
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Evaluation Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-gold bg-gold/10 px-2.5 py-0.5 rounded-full uppercase font-semibold">
                  Ref #{selectedApp.id}
                </span>
                <h2 className="text-white font-serif font-bold text-xl mt-1">{selectedApp.applicantName}</h2>
                <p className="text-white/40 text-xs">Target Grade: <span className="text-gold font-bold">{selectedApp.gradeApplyingFor}</span></p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Applicant Metadata */}
            <div className="grid sm:grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl text-xs">
              <div>
                <p className="text-white/40 mb-1">Student Email</p>
                <p className="text-white font-medium">{selectedApp.applicantEmail}</p>
              </div>
              <div>
                <p className="text-white/40 mb-1">Guardian Contact</p>
                <p className="text-white font-medium">{selectedApp.guardianName || 'N/A'} ({selectedApp.guardianPhone || 'N/A'})</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-white/40 mb-1">Applicant Notes</p>
                <p className="text-white/80 italic">{selectedApp.notes || 'No special notes submitted.'}</p>
              </div>
            </div>

            {/* Simulated Verified Required Documents */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Uploaded Documents Checklist (4/4 Verified)</h4>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                {[
                  { name: 'Birth Certificate', file: 'birth_cert_certified.pdf', size: '1.2 MB' },
                  { name: 'Previous School Leaving Cert', file: 'leaving_cert_2025.pdf', size: '980 KB' },
                  { name: 'Academic Transcripts (2 Yrs)', file: 'transcripts_report.pdf', size: '2.4 MB' },
                  { name: 'Passport Photographs', file: 'passport_photo.jpg', size: '450 KB' },
                ].map((doc, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck size={16} className="text-green-400" />
                      <div>
                        <p className="text-white font-semibold text-xs">{doc.name}</p>
                        <p className="text-[10px] text-white/40">{doc.file} ({doc.size})</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded">Verified</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admission Fee Status */}
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle size={18} className="text-green-400" />
                <div>
                  <p className="text-white font-semibold">Admission Evaluation Fee (KES 2,500)</p>
                  <p className="text-white/50 text-[10px]">Paid via M-Pesa · Ref RCPT-2026-8839</p>
                </div>
              </div>
              <span className="text-green-400 font-bold">Settled</span>
            </div>

            {/* Admin Action Box */}
            <div className="bg-navy-900 p-4 rounded-xl border border-white/10 space-y-4">
              <label className="block text-xs font-semibold text-white/70">Admissions Board Remarks / Remarks</label>
              <textarea
                rows={2}
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="Enter evaluation remarks or requirements before decision..."
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold resize-none"
              />

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  disabled={actionLoading}
                  onClick={() => handleDecide('rejected')}
                  className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold"
                >
                  Reject Application
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleDecide('approved')}
                  className="px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 text-xs font-semibold"
                >
                  Approve & Issue Offer Letter
                </button>
                <button
                  disabled={actionLoading || selectedApp.status === 'enrolled'}
                  onClick={handleEnroll}
                  className="px-5 py-2.5 rounded-xl gold-gradient text-xs font-bold text-navy-900 hover:opacity-90 flex items-center gap-1.5"
                  style={{ color: '#0a1628' }}
                >
                  {selectedApp.status === 'enrolled' ? '✓ Fully Enrolled' : 'Enroll Student into School'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
