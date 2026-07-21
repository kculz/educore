// All Educore API calls for Kwenda High
// Tenant: miami-academy (demo) — swap via NEXT_PUBLIC_TENANT_ID env var

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '') + '/api';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || 'miami-academy';

function authHeaders(token?: string, productCode = 'platform'): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Tenant-Id': TENANT_ID,
    'X-Product-Code': productCode,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    id: string;
    tenantId: string;
    email: string;
    fullName: string;
    permissions: string[];
    roleIds: string[];
    lastLoginAt: string | null;
  };
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const res = await fetch(`${API_BASE}/v1/auth/login`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Login failed');
  }
  return res.json() as Promise<LoginResult>;
}

export async function getMe(token: string) {
  const res = await fetch(`${API_BASE}/v1/auth/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

// ── Admissions ──────────────────────────────────────────────────────────────

export async function listApplications(token: string) {
  const res = await fetch(`${API_BASE}/v1/admission/applications`, {
    headers: authHeaders(token, 'admission'),
  });
  if (!res.ok) throw new Error('Failed to load applications');
  return res.json();
}

export async function getApplication(token: string, id: string) {
  const res = await fetch(`${API_BASE}/v1/admission/applications/${id}`, {
    headers: authHeaders(token, 'admission'),
  });
  if (!res.ok) throw new Error('Failed to load application');
  return res.json();
}

export async function createApplication(token: string, dto: {
  applicantName: string;
  applicantEmail: string;
  gradeApplyingFor: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  notes?: string;
}) {
  const res = await fetch(`${API_BASE}/v1/admission/applications`, {
    method: 'POST',
    headers: authHeaders(token, 'admission'),
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to submit application');
  }
  return res.json();
}

export async function submitApplication(token: string, id: string) {
  const res = await fetch(`${API_BASE}/v1/admission/applications/${id}/submit`, {
    method: 'POST',
    headers: authHeaders(token, 'admission'),
  });
  if (!res.ok) throw new Error('Failed to submit application');
  return res.json();
}

export async function decideApplication(token: string, id: string, decision: 'approved' | 'rejected' | 'waitlisted', remarks?: string) {
  const res = await fetch(`${API_BASE}/v1/admission/applications/${id}/decide`, {
    method: 'POST',
    headers: authHeaders(token, 'admission'),
    body: JSON.stringify({ decision, remarks }),
  });
  if (!res.ok) throw new Error('Failed to decide application');
  return res.json();
}

export async function listAdmissionRequirements(token: string) {
  const res = await fetch(`${API_BASE}/v1/admission/requirements`, {
    headers: authHeaders(token, 'admission'),
  });
  if (!res.ok) throw new Error('Failed to load requirements');
  return res.json();
}

// ── Fees ────────────────────────────────────────────────────────────────────

export async function listInvoices(token: string) {
  const res = await fetch(`${API_BASE}/v1/fees/invoices`, {
    headers: authHeaders(token, 'fees'),
  });
  if (!res.ok) throw new Error('Failed to load invoices');
  return res.json();
}

export async function getInvoice(token: string, id: string) {
  const res = await fetch(`${API_BASE}/v1/fees/invoices/${id}`, {
    headers: authHeaders(token, 'fees'),
  });
  if (!res.ok) throw new Error('Failed to load invoice');
  return res.json();
}

export async function getStudentBalance(token: string, studentId: string) {
  const res = await fetch(`${API_BASE}/v1/fees/students/${studentId}/balance`, {
    headers: authHeaders(token, 'fees'),
  });
  if (!res.ok) throw new Error('Failed to load balance');
  return res.json();
}

export async function recordPayment(token: string, invoiceId: string, dto: {
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
    throw new Error((err as { message?: string }).message ?? 'Payment failed');
  }
  return res.json();
}

export async function listReceipts(token: string) {
  const res = await fetch(`${API_BASE}/v1/fees/receipts`, {
    headers: authHeaders(token, 'fees'),
  });
  if (!res.ok) throw new Error('Failed to load receipts');
  return res.json();
}

export async function listFeeItems(token: string) {
  const res = await fetch(`${API_BASE}/v1/fees/items`, {
    headers: authHeaders(token, 'fees'),
  });
  if (!res.ok) throw new Error('Failed to load fee items');
  return res.json();
}

// ── Procurement ──────────────────────────────────────────────────────────────

export async function getProcurementDashboard(token: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/dashboard`, {
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to load procurement dashboard');
  return res.json();
}

// Suppliers
export async function listSuppliers(token: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/suppliers`, {
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to load suppliers');
  return res.json();
}

export async function getSupplier(token: string, id: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/suppliers/${id}`, {
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to load supplier details');
  return res.json();
}

export async function createSupplier(token: string, dto: {
  name: string;
  code: string;
  email: string;
  phone: string;
  address?: string;
  category?: string;
}) {
  const res = await fetch(`${API_BASE}/v1/procurement/suppliers`, {
    method: 'POST',
    headers: authHeaders(token, 'procurement'),
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to create supplier');
  }
  return res.json();
}

// Purchase Requests (PR)
export async function listPurchaseRequests(token: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/requests`, {
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to load purchase requests');
  return res.json();
}

export async function getPurchaseRequest(token: string, id: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/requests/${id}`, {
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to load purchase request');
  return res.json();
}

export async function createPurchaseRequest(token: string, dto: {
  title: string;
  description: string;
  department: string;
  estimatedAmount: number;
  items?: Array<{ description: string; quantity: number; unitPrice: number }>;
}) {
  const res = await fetch(`${API_BASE}/v1/procurement/requests`, {
    method: 'POST',
    headers: authHeaders(token, 'procurement'),
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to create purchase request');
  }
  return res.json();
}

export async function submitPurchaseRequest(token: string, id: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/requests/${id}/submit`, {
    method: 'POST',
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to submit purchase request');
  return res.json();
}

export async function approvePurchaseRequest(token: string, id: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/requests/${id}/approve`, {
    method: 'POST',
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to approve purchase request');
  return res.json();
}

export async function rejectPurchaseRequest(token: string, id: string, reason?: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/requests/${id}/reject`, {
    method: 'POST',
    headers: authHeaders(token, 'procurement'),
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error('Failed to reject purchase request');
  return res.json();
}

// Purchase Orders (PO)
export async function listPurchaseOrders(token: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/orders`, {
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to load purchase orders');
  return res.json();
}

export async function getPurchaseOrder(token: string, id: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/orders/${id}`, {
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to load purchase order');
  return res.json();
}

export async function createPurchaseOrder(token: string, dto: {
  purchaseRequestId: string;
  supplierId: string;
  totalAmount: number;
  expectedDeliveryDate?: string;
  items?: Array<{ description: string; quantity: number; unitPrice: number }>;
}) {
  const res = await fetch(`${API_BASE}/v1/procurement/orders`, {
    method: 'POST',
    headers: authHeaders(token, 'procurement'),
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to create purchase order');
  }
  return res.json();
}

export async function sendPurchaseOrder(token: string, id: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/orders/${id}/send`, {
    method: 'POST',
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to send purchase order');
  return res.json();
}

// Goods Received Notes (GRN)
export async function listGRNs(token: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/grns`, {
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to load GRNs');
  return res.json();
}

export async function getGRN(token: string, id: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/grns/${id}`, {
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to load GRN');
  return res.json();
}

export async function createGRN(token: string, poId: string, dto: {
  deliveryNoteNumber: string;
  receivedDate: string;
  remarks?: string;
  items: Array<{ description: string; quantityReceived: number; quantityAccepted: number }>;
}) {
  const res = await fetch(`${API_BASE}/v1/procurement/orders/${poId}/grn`, {
    method: 'POST',
    headers: authHeaders(token, 'procurement'),
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to record GRN');
  }
  return res.json();
}

// Quotations
export async function listQuotations(token: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/quotations`, {
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to load quotations');
  return res.json();
}

export async function createQuotation(token: string, dto: {
  purchaseRequestId: string;
  supplierId: string;
  amount: number;
  validUntil: string;
  notes?: string;
}) {
  const res = await fetch(`${API_BASE}/v1/procurement/quotations`, {
    method: 'POST',
    headers: authHeaders(token, 'procurement'),
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to record quotation');
  }
  return res.json();
}

export async function acceptQuotation(token: string, id: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/quotations/${id}/accept`, {
    method: 'POST',
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to accept quotation');
  return res.json();
}

// Contracts
export async function listContracts(token: string) {
  const res = await fetch(`${API_BASE}/v1/procurement/contracts`, {
    headers: authHeaders(token, 'procurement'),
  });
  if (!res.ok) throw new Error('Failed to load contracts');
  return res.json();
}

export async function createContract(token: string, dto: {
  supplierId: string;
  title: string;
  contractValue: number;
  startDate: string;
  endDate: string;
  terms?: string;
}) {
  const res = await fetch(`${API_BASE}/v1/procurement/contracts`, {
    method: 'POST',
    headers: authHeaders(token, 'procurement'),
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to create contract');
  }
  return res.json();
}
