import { getActiveTenantSlug } from './tenant';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '') + '/api';

function authHeaders(token?: string, productCode = 'platform'): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Tenant-Id': getActiveTenantSlug(),
    'X-Product-Code': productCode,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface LoginResult {
  mfaRequired?: boolean;
  userId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: string;
  user?: {
    id: string;
    tenantId: string;
    email: string;
    fullName: string;
    permissions: string[];
    roleIds: string[];
    mfaEnabled?: boolean;
    lastLoginAt: string | null;
  };
}

export async function loginAdmin(email: string, password: string): Promise<LoginResult> {
  const res = await fetch(`${API_BASE}/v1/auth/login`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Admin authentication failed');
  }
  return res.json() as Promise<LoginResult>;
}

export async function verifyMfaLogin(userId: string, code: string): Promise<LoginResult> {
  const res = await fetch(`${API_BASE}/v1/auth/mfa/verify`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ userId, code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Invalid Authenticator OTP or Backup Code');
  }
  return res.json() as Promise<LoginResult>;
}

export async function setupMfa(token: string) {
  const res = await fetch(`${API_BASE}/v1/auth/mfa/setup`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to generate Authenticator setup QR code');
  return res.json();
}

export async function enableMfa(token: string, code: string) {
  const res = await fetch(`${API_BASE}/v1/auth/mfa/enable`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Invalid Authenticator code');
  }
  return res.json();
}

export async function disableMfa(token: string) {
  const res = await fetch(`${API_BASE}/v1/auth/mfa/disable`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to disable MFA');
  return res.json();
}

// ── Admin Admissions ────────────────────────────────────────────────────────

export async function listAdminApplications(token: string) {
  const res = await fetch(`${API_BASE}/v1/admission/applications`, {
    headers: authHeaders(token, 'admission'),
  });
  if (!res.ok) throw new Error('Failed to load applications');
  return res.json();
}

export async function getAdminApplication(token: string, id: string) {
  const res = await fetch(`${API_BASE}/v1/admission/applications/${id}`, {
    headers: authHeaders(token, 'admission'),
  });
  if (!res.ok) throw new Error('Failed to load application details');
  return res.json();
}

export async function decideAdminApplication(token: string, id: string, decision: 'approved' | 'rejected' | 'offered', remarks?: string) {
  const res = await fetch(`${API_BASE}/v1/admission/applications/${id}/decide`, {
    method: 'POST',
    headers: authHeaders(token, 'admission'),
    body: JSON.stringify({ decision, remarks }),
  });
  if (!res.ok) throw new Error('Failed to decide application');
  return res.json();
}

export async function enrollStudent(token: string, id: string) {
  const res = await fetch(`${API_BASE}/v1/admission/applications/${id}/enroll`, {
    method: 'POST',
    headers: authHeaders(token, 'admission'),
  });
  if (!res.ok) throw new Error('Failed to enroll student');
  return res.json();
}

// ── Admin Fees & Billing ───────────────────────────────────────────────────

export async function listAdminInvoices(token: string) {
  const res = await fetch(`${API_BASE}/v1/fees/invoices`, {
    headers: authHeaders(token, 'fees'),
  });
  if (!res.ok) throw new Error('Failed to load invoices');
  return res.json();
}

export async function recordAdminPayment(token: string, invoiceId: string, dto: {
  amount: number;
  paymentMethod: string;
  transactionReference: string;
}) {
  const res = await fetch(`${API_BASE}/v1/fees/invoices/${invoiceId}/payments`, {
    method: 'POST',
    headers: authHeaders(token, 'fees'),
    body: JSON.stringify({ ...dto, status: 'completed' }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to record payment');
  }
  return res.json();
}

export async function listAdminReceipts(token: string) {
  const res = await fetch(`${API_BASE}/v1/fees/receipts`, {
    headers: authHeaders(token, 'fees'),
  });
  if (!res.ok) throw new Error('Failed to load receipts');
  return res.json();
}

// ── Admin Procurement ───────────────────────────────────────────────────────

export async function getAdminProcurementDashboard(token: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/dashboard`, {
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to load procurement dashboard');
  return res.json();
}

export async function listAdminPurchaseRequests(token: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/requests`, {
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to load purchase requests');
  return res.json();
}

export async function approveAdminPurchaseRequest(token: string, id: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/requests/${id}/approve`, {
    method: 'POST',
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to approve request');
  return res.json();
}

export async function rejectAdminPurchaseRequest(token: string, id: string, reason?: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/requests/${id}/reject`, {
    method: 'POST',
    headers: authHeaders(token, 'procurement'),
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error('Failed to reject request');
  return res.json();
}

export async function listAdminPurchaseOrders(token: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/orders`, {
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to load purchase orders');
  return res.json();
}

export async function sendAdminPurchaseOrder(token: string, id: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/orders/${id}/send`, {
    method: 'POST',
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to send purchase order');
  return res.json();
}

export async function listAdminSuppliers(token: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/suppliers`, {
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to load suppliers');
  return res.json();
}

export async function listAdminQuotations(token: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/quotations`, {
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to load quotations');
  return res.json();
}

export async function acceptAdminQuotation(token: string, id: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/quotations/${id}/accept`, {
    method: 'POST',
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to accept quotation');
  return res.json();
}

export async function listAdminContracts(token: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/contracts`, {
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to load contracts');
  return res.json();
}

export async function listAdminGRNs(token: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/grns`, {
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to load GRNs');
  return res.json();
}
