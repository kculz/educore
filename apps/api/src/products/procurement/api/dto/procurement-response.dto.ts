import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Supplier ───────────────────────────────────────────────────────────────

export class SupplierBankDetailsDto {
  @ApiProperty()
  bankName!: string;

  @ApiProperty()
  accountName!: string;

  @ApiProperty()
  accountNumber!: string;
}

export class SupplierDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  contactName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ nullable: true })
  phoneNumber!: string | null;

  @ApiPropertyOptional({ nullable: true })
  address!: string | null;

  @ApiPropertyOptional({ nullable: true })
  taxId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  category!: string | null;

  @ApiPropertyOptional({ type: SupplierBankDetailsDto, nullable: true })
  bankDetails!: SupplierBankDetailsDto | null;

  @ApiPropertyOptional({ nullable: true })
  rating!: number | null;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

// ─── Purchase Request ────────────────────────────────────────────────────────

export class PurchaseRequestItemDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  estimatedUnitCost!: number;
}

export class PurchaseRequestDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiPropertyOptional({ nullable: true })
  requesterId!: string | null;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiProperty({ type: [PurchaseRequestItemDto] })
  items!: PurchaseRequestItemDto[];

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ nullable: true })
  approvedBy!: string | null;

  @ApiPropertyOptional({ nullable: true })
  rejectedBy!: string | null;

  @ApiPropertyOptional({ nullable: true })
  rejectionReason!: string | null;

  @ApiPropertyOptional({ nullable: true })
  cancelledAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

// ─── Quotation ───────────────────────────────────────────────────────────────

export class QuotationItemDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitCost!: number;
}

export class QuotationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiPropertyOptional({ nullable: true })
  purchaseRequestId!: string | null;

  @ApiProperty()
  supplierId!: string;

  @ApiProperty()
  quoteReference!: string;

  @ApiProperty({ type: [QuotationItemDto] })
  items!: QuotationItemDto[];

  @ApiProperty()
  totalAmount!: number;

  @ApiPropertyOptional({ nullable: true })
  validUntil!: string | null;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ nullable: true })
  notes!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

// ─── Purchase Order ───────────────────────────────────────────────────────────

export class PurchaseOrderItemDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitCost!: number;

  @ApiProperty()
  quantityReceived!: number;
}

export class PurchaseOrderDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiPropertyOptional({ nullable: true })
  purchaseRequestId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  quotationId!: string | null;

  @ApiProperty()
  supplierId!: string;

  @ApiProperty()
  poNumber!: string;

  @ApiProperty({ type: [PurchaseOrderItemDto] })
  items!: PurchaseOrderItemDto[];

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ nullable: true })
  expectedDeliveryDate!: string | null;

  @ApiPropertyOptional({ nullable: true })
  cancelledAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  cancelReason!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

// ─── GRN ─────────────────────────────────────────────────────────────────────

export class GrnReceivedItemDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  quantityReceived!: number;
}

export class GoodsReceivedNoteDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  purchaseOrderId!: string;

  @ApiProperty()
  grnNumber!: string;

  @ApiProperty()
  receivedAt!: string;

  @ApiProperty({ type: [GrnReceivedItemDto] })
  receivedItems!: GrnReceivedItemDto[];

  @ApiPropertyOptional({ nullable: true })
  receivedBy!: string | null;

  @ApiPropertyOptional({ nullable: true })
  notes!: string | null;

  @ApiProperty()
  createdAt!: string;
}

// ─── Contract ────────────────────────────────────────────────────────────────

export class ContractDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  supplierId!: string;

  @ApiPropertyOptional({ nullable: true })
  purchaseOrderId!: string | null;

  @ApiProperty()
  contractNumber!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiProperty()
  value!: number;

  @ApiProperty()
  startDate!: string;

  @ApiProperty()
  endDate!: string;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ nullable: true })
  signedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  terminatedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  terminationReason!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export class ProcurementDashboardDto {
  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  tenantName!: string;

  @ApiProperty()
  supplierCount!: number;

  @ApiProperty()
  pendingRequestsCount!: number;

  @ApiProperty()
  activePoCount!: number;

  @ApiProperty()
  totalSpent!: number;

  @ApiProperty()
  recentGrnsCount!: number;

  @ApiProperty({ description: 'Total value across all purchase orders' })
  totalPoValue!: number;

  @ApiProperty({ description: 'Number of quotations received' })
  quotationCount!: number;

  @ApiProperty({ description: 'Number of active/draft contracts' })
  contractCount!: number;

  @ApiProperty({ description: 'POs past expected delivery date still not fully received' })
  overduePoCount!: number;

  @ApiProperty({ description: 'Percentage of approved PRs that resulted in a PO' })
  prConversionRate!: number;
}
