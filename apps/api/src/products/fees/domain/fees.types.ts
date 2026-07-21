export type FeeStructureStatus = 'active' | 'archived';

export type InvoiceStatus = 'unpaid' | 'partially_paid' | 'paid' | 'void';

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface FeeStructure {
  id: string;
  tenantId: string;
  name: string;
  academicYear: string;
  amount: number;
  status: FeeStructureStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StudentBilling {
  id: string;
  tenantId: string;
  studentId: string;
  feeStructureId: string;
  billingCycle: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLine {
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  tenantId: string;
  studentId: string;
  invoiceNumber: string;
  lines: InvoiceLine[];
  amount: number;
  amountPaid: number;
  status: InvoiceStatus;
  dueDate: string;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  transactionReference: string;
  status: PaymentStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  tenantId: string;
  paymentId: string;
  invoiceId: string;
  receiptNumber: string;
  amount: number;
  issuedAt: string;
  createdAt: string;
}

export interface StudentBalance {
  studentId: string;
  totalBilled: number;
  totalPaid: number;
  balance: number;
}

export interface FeesDashboardSummary {
  tenantId: string;
  tenantName: string;
  totalBilled: number;
  totalPaid: number;
  outstandingBalance: number;
  invoiceCount: number;
  paymentCount: number;
  collectionRate: number; // percentage
}
