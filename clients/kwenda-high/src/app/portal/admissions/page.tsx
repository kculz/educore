'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAccessToken, getStoredUser } from '@/lib/auth';
import { listApplications } from '@/lib/api';
import {
  UserCheck, Clock, CheckCircle, XCircle, RefreshCw, Loader2, FileText,
  Upload, CreditCard, Edit3, ShieldAlert, FileCheck, Check, Lock, ChevronRight, Eye, Download, X, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

type Application = {
  id: string;
  applicantName: string;
  applicantEmail: string;
  gradeApplyingFor: string;
  guardianName?: string;
  guardianPhone?: string;
  notes?: string;
  status: string;
  createdAt: string;
};

type DocState = {
  id: string;
  title: string;
  fileName: string | null;
  uploadedAt: string | null;
  size?: string;
  mimeType?: string;
  required: boolean;
};

const INITIAL_DOCS: DocState[] = [
  { id: 'birth_cert', title: 'Birth Certificate (Certified Copy)', fileName: 'birth_certificate_wambui.pdf', uploadedAt: 'Today, 10:14 AM', size: '1.2 MB', mimeType: 'PDF Document', required: true },
  { id: 'leaving_cert', title: 'Previous School Leaving Certificate', fileName: null, uploadedAt: null, required: true },
  { id: 'academic_reports', title: 'Academic Reports (Last 2 Years)', fileName: 'academic_report_2025.pdf', uploadedAt: 'Yesterday, 3:45 PM', size: '2.8 MB', mimeType: 'PDF Document', required: true },
  { id: 'passport_photos', title: 'Passport Photographs (2 Copies)', fileName: 'passport_photo_mary.jpg', uploadedAt: 'Today, 11:30 AM', size: '450 KB', mimeType: 'JPEG Image', required: true },
];

const STEPS = [
  { step: 1, label: 'Form Submitted' },
  { step: 2, label: 'Docs Uploaded' },
  { step: 3, label: 'Fee Paid' },
  { step: 4, label: 'Under Review' },
  { step: 5, label: 'Offer Extended' },
  { step: 6, label: 'Enrolled' },
];

export default function PortalAdmissionsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    applicantName: '', applicantEmail: '', gradeApplyingFor: 'Form 1',
    guardianName: '', guardianPhone: '', notes: '',
  });

  // Docs state
  const [docs, setDocs] = useState<DocState[]>(INITIAL_DOCS);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocState | null>(null);

  // Payment state
  const [feePaid, setFeePaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'upload'>('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('0712345678');
  const [proofFile, setProofFile] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  const load = useCallback(async () => {
    const token = getAccessToken();
    const storedUser = getStoredUser();
    if (!token) { setError('Not authenticated'); setLoading(false); return; }
    try {
      let data = await listApplications(token) as Application[];
      if (!Array.isArray(data)) data = [];

      if (data.length === 0 && storedUser?.isApplicant) {
        data = [{
          id: storedUser.applicationId || 'APP-884920',
          applicantName: storedUser.fullName,
          applicantEmail: storedUser.email,
          gradeApplyingFor: 'Form 1',
          guardianName: 'John Wambui',
          guardianPhone: '+254 712 345 678',
          notes: 'Standard Form 1 Applicant Requisition',
          status: storedUser.applicationStatus || 'submitted',
          createdAt: new Date().toISOString(),
        }];
      }

      setApps(data);
      if (data.length > 0) {
        const app = data[0];
        setEditForm({
          applicantName: app.applicantName,
          applicantEmail: app.applicantEmail,
          gradeApplyingFor: app.gradeApplyingFor,
          guardianName: app.guardianName || '',
          guardianPhone: app.guardianPhone || '',
          notes: app.notes || '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeApp = apps[0];
  const docsUploadedCount = docs.filter(d => d.fileName !== null).length;
  const isDocsComplete = docsUploadedCount === docs.length;

  const getProgressStep = () => {
    if (!activeApp) return 1;
    if (activeApp.status === 'enrolled') return 6;
    if (activeApp.status === 'offered') return 5;
    if (activeApp.status === 'under_review') return 4;
    if (feePaid) return 3;
    if (isDocsComplete) return 2;
    return 1;
  };

  const currentStep = getProgressStep();

  // Document upload/replace simulation
  function handleFileUpload(docId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadingDoc(docId);
    setTimeout(() => {
      setDocs(prev => prev.map(d => d.id === docId ? {
        ...d,
        fileName: file.name,
        uploadedAt: 'Just now',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        mimeType: file.type || 'Document'
      } : d));
      setUploadingDoc(null);
    }, 1000);
  }

  function handleRemoveDoc(docId: string) {
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, fileName: null, uploadedAt: null } : d));
    setPreviewDoc(null);
  }

  // Payment handler
  function handlePayFee(e: React.FormEvent) {
    e.preventDefault();
    setPayLoading(true);
    setTimeout(() => {
      setPayLoading(false);
      setFeePaid(true);
    }, 1500);
  }

  // Save form edit
  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setApps(prev => prev.map(a => a.id === activeApp.id ? { ...a, ...editForm } : a));
    setEditing(false);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Header & Single App Policy Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">My Admission Application</h1>
          <p className="text-white/40 text-xs mt-1">Manage your application details, upload documents, and track review status.</p>
        </div>
        {apps.length > 0 && (
          <div className="bg-gold/10 border border-gold/20 px-3.5 py-2 rounded-xl text-xs text-gold flex items-center gap-2">
            <Lock size={14} /> Single Application Policy (1/1 Active)
          </div>
        )}
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

      {!loading && !error && activeApp && (
        <>
          {/* 1. Progress Step Bar */}
          <div className="bg-navy-800 rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm">Application Progress Timeline</h3>
              <span className="text-xs text-gold font-mono font-semibold">
                Step {currentStep} of 6 — {STEPS[currentStep - 1].label}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
              {STEPS.map((s) => {
                const isDone = s.step <= currentStep;
                const isCurrent = s.step === currentStep;
                return (
                  <div key={s.step} className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-2 ${
                      isDone
                        ? 'gold-gradient text-navy-900 shadow-md shadow-yellow-900/20'
                        : 'bg-white/5 text-white/30 border border-white/10'
                    }`} style={isDone ? { color: '#0a1628' } : {}}>
                      {isDone ? <Check size={14} /> : s.step}
                    </div>
                    <p className={`text-[11px] font-medium leading-tight ${
                      isCurrent ? 'text-gold font-bold' : isDone ? 'text-white' : 'text-white/30'
                    }`}>
                      {s.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Review Requirement Warning Banner */}
          {(!isDocsComplete || !feePaid) && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 flex items-start gap-4">
              <ShieldAlert size={24} className="text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-yellow-400 font-semibold text-sm mb-1">Admissions Board Review Prerequisite</h4>
                <p className="text-white/70 text-xs leading-relaxed">
                  Your application will <span className="text-gold font-semibold">NOT</span> be assigned to an admissions evaluator until all 4 required documents are uploaded AND the KES 2,500 admission processing fee is settled.
                </p>
                <div className="flex gap-4 mt-3 text-xs">
                  <span className={`font-semibold flex items-center gap-1 ${isDocsComplete ? 'text-green-400' : 'text-yellow-400'}`}>
                    {isDocsComplete ? '✓' : '•'} Documents ({docsUploadedCount}/4)
                  </span>
                  <span className={`font-semibold flex items-center gap-1 ${feePaid ? 'text-green-400' : 'text-yellow-400'}`}>
                    {feePaid ? '✓' : '•'} Admission Fee ({feePaid ? 'Paid' : 'KES 2,500 Pending'})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Main Application Details & Editable Form */}
          <div className="bg-navy-800 rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-mono text-gold bg-gold/10 px-2.5 py-0.5 rounded-full uppercase font-semibold">
                  Ref #{activeApp.id.slice(0, 8).toUpperCase()}
                </span>
                <h2 className="text-white font-serif font-bold text-xl mt-1">{activeApp.applicantName}</h2>
              </div>

              {activeApp.status !== 'enrolled' && activeApp.status !== 'rejected' && (
                <button
                  onClick={() => setEditing(!editing)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gold hover:bg-gold/10 transition-colors"
                >
                  <Edit3 size={14} /> {editing ? 'Cancel Edit' : 'Edit Application Details'}
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.applicantName}
                      onChange={(e) => setEditForm({ ...editForm, applicantName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Student Email *</label>
                    <input
                      type="email"
                      required
                      value={editForm.applicantEmail}
                      onChange={(e) => setEditForm({ ...editForm, applicantEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Grade Applying For</label>
                    <select
                      value={editForm.gradeApplyingFor}
                      onChange={(e) => setEditForm({ ...editForm, gradeApplyingFor: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-white text-xs focus:outline-none focus:border-gold"
                    >
                      <option value="Form 1">Form 1</option>
                      <option value="Form 2">Form 2</option>
                      <option value="Form 3">Form 3</option>
                      <option value="Form 4">Form 4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Guardian Name</label>
                    <input
                      type="text"
                      value={editForm.guardianName}
                      onChange={(e) => setEditForm({ ...editForm, guardianName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Guardian Phone</label>
                    <input
                      type="tel"
                      value={editForm.guardianPhone}
                      onChange={(e) => setEditForm({ ...editForm, guardianPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1">Notes / Special Instructions</label>
                  <textarea
                    rows={2}
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="submit" className="px-5 py-2.5 rounded-xl font-semibold gold-gradient text-xs" style={{ color: '#0a1628' }}>
                    Save Updated Details
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-white/40 mb-1">Student Email</p>
                  <p className="text-white font-medium">{activeApp.applicantEmail}</p>
                </div>
                <div>
                  <p className="text-white/40 mb-1">Grade Applying For</p>
                  <p className="text-gold font-bold">{activeApp.gradeApplyingFor}</p>
                </div>
                <div>
                  <p className="text-white/40 mb-1">Guardian Contact</p>
                  <p className="text-white font-medium">{activeApp.guardianName || 'N/A'} ({activeApp.guardianPhone || 'N/A'})</p>
                </div>
                <div>
                  <p className="text-white/40 mb-1">Review Status</p>
                  <p className="text-green-400 font-semibold capitalize">{activeApp.status}</p>
                </div>
              </div>
            )}
          </div>

          {/* 4. Document Upload & Interactive Viewer Section */}
          <div className="bg-navy-800 rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <div>
                <h3 className="text-white font-semibold text-base">Required Verification Documents</h3>
                <p className="text-white/40 text-xs mt-0.5">Upload, view, or replace all required certificates before evaluation.</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gold/10 text-gold">
                {docsUploadedCount} / {docs.length} Uploaded
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {docs.map((doc) => (
                <div key={doc.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-2.5">
                      <FileCheck size={18} className={doc.fileName ? 'text-green-400' : 'text-yellow-400'} />
                      <div>
                        <p className="text-white font-semibold text-xs leading-snug">{doc.title}</p>
                        <p className="text-[10px] text-white/40 mt-0.5">
                          {doc.fileName ? `${doc.fileName} (${doc.size || '1.0 MB'})` : 'Pending upload'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    {doc.fileName ? (
                      <>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="text-[11px] text-gold hover:underline flex items-center gap-1 font-medium"
                          >
                            <Eye size={12} /> View Document
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer text-[10px] text-white/50 hover:text-white underline">
                            Replace
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              className="hidden"
                              onChange={(e) => handleFileUpload(doc.id, e)}
                            />
                          </label>
                          <button
                            onClick={() => handleRemoveDoc(doc.id)}
                            className="text-[10px] text-red-400 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer text-[11px] font-semibold text-gold hover:underline flex items-center gap-1">
                        {uploadingDoc === doc.id ? (
                          <><Loader2 size={12} className="animate-spin" /> Uploading…</>
                        ) : (
                          <><Upload size={12} /> Upload File</>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => handleFileUpload(doc.id, e)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Admission Fee Payment Section */}
          <div className="bg-navy-800 rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <div>
                <h3 className="text-white font-semibold text-base">Admission Processing Fee</h3>
                <p className="text-white/40 text-xs mt-0.5">KES 2,500 non-refundable evaluation fee.</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${feePaid ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                {feePaid ? '✓ Fee Settled' : 'Payment Required'}
              </span>
            </div>

            {feePaid ? (
              <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                <CheckCircle size={28} className="text-green-400 mx-auto mb-2" />
                <h4 className="text-white font-semibold text-sm">Admission Processing Fee Paid</h4>
                <p className="text-white/50 text-xs mt-1">Receipt Ref: <span className="text-gold font-mono">RCPT-2026-8839</span></p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setPaymentMethod('mpesa')}
                    className={`flex-1 py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                      paymentMethod === 'mpesa' ? 'bg-gold/15 border-gold text-gold' : 'bg-white/5 border-white/10 text-white/60'
                    }`}
                  >
                    <CreditCard size={15} /> Direct Online Payment (M-Pesa / Card)
                  </button>
                  <button
                    onClick={() => setPaymentMethod('upload')}
                    className={`flex-1 py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                      paymentMethod === 'upload' ? 'bg-gold/15 border-gold text-gold' : 'bg-white/5 border-white/10 text-white/60'
                    }`}
                  >
                    <Upload size={15} /> Upload Payment Receipt / Slip
                  </button>
                </div>

                <form onSubmit={handlePayFee} className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-4">
                  {paymentMethod === 'mpesa' ? (
                    <div>
                      <label className="block text-xs text-white/60 mb-1">M-Pesa Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        placeholder="e.g. 0712345678"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold max-w-sm"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Upload Bank Deposit Slip / Payment Proof *</label>
                      <input
                        type="file"
                        required
                        accept=".pdf,.png,.jpg"
                        onChange={(e) => setProofFile(e.target.files?.[0]?.name || null)}
                        className="block w-full text-xs text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gold file:text-navy-900 hover:file:opacity-90"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={payLoading}
                    className="px-6 py-2.5 rounded-xl font-semibold gold-gradient text-xs flex items-center gap-2 disabled:opacity-60"
                    style={{ color: '#0a1628' }}
                  >
                    {payLoading ? <><Loader2 size={14} className="animate-spin" /> Processing Payment…</> : `Pay KES 2,500 Fee`}
                  </button>
                </form>
              </div>
            )}
          </div>
        </>
      )}

      {/* Document View / Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center" style={{ color: '#0a1628' }}>
                  <FileCheck size={20} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{previewDoc.title}</h3>
                  <p className="text-white/40 text-xs">{previewDoc.mimeType || 'Document'}</p>
                </div>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Simulated Document Viewer */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center mb-6">
              <FileText size={48} className="text-gold mx-auto mb-3" />
              <p className="text-white font-semibold text-sm mb-1">{previewDoc.fileName}</p>
              <p className="text-white/40 text-xs">Size: {previewDoc.size || '1.2 MB'} · Uploaded {previewDoc.uploadedAt}</p>
              <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400 inline-block font-semibold">
                ✓ Document Verified & Stored
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleRemoveDoc(previewDoc.id)}
                className="px-4 py-2 rounded-xl border border-red-500/20 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Delete Document
              </button>
              <button
                onClick={() => { alert(`Downloading ${previewDoc.fileName}`); }}
                className="px-5 py-2 rounded-xl font-semibold gold-gradient text-xs flex items-center gap-1.5"
                style={{ color: '#0a1628' }}
              >
                <Download size={14} /> Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
