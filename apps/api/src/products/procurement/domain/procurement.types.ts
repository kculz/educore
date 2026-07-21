export type SupplierStatus = 'active' | 'inactive';

export type PurchaseRequestStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'cancelled';

export type PurchaseOrderStatus = 'draft' | 'sent' | 'partially_received' | 'fully_received' | 'cancelled';

export type QuotationStatus = 'received' | 'accepted' | 'rejected';

export type ContractStatus = 'draft' | 'active' | 'expired' | 'terminated';

export interface SupplierBankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phoneNumber: string | null;
  address: string | null;
  taxId: string | null;
  category: string | null;
  bankDetails: SupplierBankDetails | null;
  rating: number | null; // 1-5
  status: SupplierStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRequestItem {
  name: string;
  quantity: number;
  estimatedUnitCost: number;
}

export interface PurchaseRequest {
  id: string;
  tenantId: string;
  requesterId: string | null;
  title: string;
  description: string | null;
  items: PurchaseRequestItem[];
  status: PurchaseRequestStatus;
  approvedBy: string | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  name: string;
  quantity: number;
  unitCost: number;
}

export interface Quotation {
  id: string;
  tenantId: string;
  purchaseRequestId: string | null;
  supplierId: string;
  quoteReference: string;
  items: QuotationItem[];
  totalAmount: number;
  validUntil: string | null;
  status: QuotationStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  name: string;
  quantity: number;
  unitCost: number;
  quantityReceived: number;
}

export interface PurchaseOrder {
  id: string;
  tenantId: string;
  purchaseRequestId: string | null;
  quotationId: string | null;
  supplierId: string;
  poNumber: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: PurchaseOrderStatus;
  expectedDeliveryDate: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoodsReceivedNoteItem {
  name: string;
  quantityReceived: number;
}

export interface GoodsReceivedNote {
  id: string;
  tenantId: string;
  purchaseOrderId: string;
  grnNumber: string;
  receivedAt: string;
  receivedItems: GoodsReceivedNoteItem[];
  receivedBy: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Contract {
  id: string;
  tenantId: string;
  supplierId: string;
  purchaseOrderId: string | null;
  contractNumber: string;
  title: string;
  description: string | null;
  value: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  signedAt: string | null;
  terminatedAt: string | null;
  terminationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProcurementDashboardSummary {
  tenantId: string;
  tenantName: string;
  supplierCount: number;
  pendingRequestsCount: number;
  activePoCount: number;
  totalSpent: number;
  recentGrnsCount: number;
  totalPoValue: number;
  quotationCount: number;
  contractCount: number;
  overduePoCount: number;
  prConversionRate: number; // % of approved PRs that became POs
}
