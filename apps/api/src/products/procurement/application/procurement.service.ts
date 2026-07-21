import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { FilteringService } from '../../../shared/query/filtering.service';
import { PaginationService } from '../../../shared/query/pagination.service';
import { SearchService } from '../../../shared/query/search.service';
import { SortingService } from '../../../shared/query/sorting.service';
import { AuditRecorderService } from '../../../core/audit/audit-recorder.service';
import { PlatformLoggerService } from '../../../core/logging/platform-logger.service';
import type { PaginatedResult } from '../../../shared/query/query.types';

import { ProcurementStoreService } from '../infrastructure/procurement-store.service';
import type { ProcurementDashboardSummary } from '../domain/procurement.types';
import type {
  CreateSupplierDto,
  CreatePurchaseRequestDto,
  UpdatePurchaseRequestDto,
  CreatePurchaseOrderDto,
  CreateGrnDto,
  CreateQuotationDto,
  CreateContractDto,
  UpdateContractDto,
} from '../api/dto/procurement-requests.dto';
import type { ListProcurementQueryDto } from '../api/dto/list-procurement-query.dto';

@Injectable()
export class ProcurementService {
  constructor(
    @Inject(ProcurementStoreService) private readonly store: ProcurementStoreService,
    @Inject(SearchService) private readonly search: SearchService,
    @Inject(FilteringService) private readonly filtering: FilteringService,
    @Inject(SortingService) private readonly sorting: SortingService,
    @Inject(PaginationService) private readonly pagination: PaginationService,
    @Inject(AuditRecorderService) private readonly audit: AuditRecorderService,
    @Inject(PlatformLoggerService) private readonly logger: PlatformLoggerService,
  ) {}

  // ─── Dashboard ─────────────────────────────────────────────────────────────

  dashboard(tenantId: string): ProcurementDashboardSummary {
    return this.store.getDashboardSummary(tenantId);
  }

  // ─── Suppliers ─────────────────────────────────────────────────────────────

  listSuppliers(tenantId: string, query: ListProcurementQueryDto = {}) {
    return this.paginate(
      this.store.listSuppliers(tenantId),
      query,
      ['name', 'contactName', 'email', 'category'],
      'createdAt',
      ['status'],
    );
  }

  getSupplier(tenantId: string, id: string) {
    return this.store.getSupplier(tenantId, id);
  }

  createSupplier(tenantId: string, actorUserId: string | null, dto: CreateSupplierDto) {
    const supplier = this.store.createSupplier(tenantId, dto);
    this.recordAudit(tenantId, actorUserId, 'procurement.supplier.created', 'supplier', {
      supplierId: supplier.id,
      name: supplier.name,
    });
    return supplier;
  }

  updateSupplier(tenantId: string, actorUserId: string | null, id: string, dto: Partial<CreateSupplierDto>) {
    const supplier = this.store.updateSupplier(tenantId, id, dto);
    this.recordAudit(tenantId, actorUserId, 'procurement.supplier.updated', 'supplier', {
      supplierId: supplier.id,
      name: supplier.name,
    });
    return supplier;
  }

  deleteSupplier(tenantId: string, actorUserId: string | null, id: string) {
    const supplier = this.store.deleteSupplier(tenantId, id);
    this.recordAudit(tenantId, actorUserId, 'procurement.supplier.deactivated', 'supplier', {
      supplierId: supplier.id,
      name: supplier.name,
    });
    return supplier;
  }

  // ─── Purchase Requests ─────────────────────────────────────────────────────

  listPurchaseRequests(tenantId: string, query: ListProcurementQueryDto = {}) {
    return this.paginate(
      this.store.listPurchaseRequests(tenantId),
      query,
      ['title', 'description'],
      'createdAt',
      ['status'],
    );
  }

  getPurchaseRequest(tenantId: string, id: string) {
    return this.store.getPurchaseRequest(tenantId, id);
  }

  createPurchaseRequest(
    tenantId: string,
    requesterId: string | null,
    actorUserId: string | null,
    dto: CreatePurchaseRequestDto,
  ) {
    const pr = this.store.createPurchaseRequest(tenantId, requesterId, dto);
    this.recordAudit(tenantId, actorUserId, 'procurement.request.created', 'purchase-request', {
      purchaseRequestId: pr.id,
      title: pr.title,
    });
    return pr;
  }

  updatePurchaseRequest(tenantId: string, actorUserId: string | null, id: string, dto: UpdatePurchaseRequestDto) {
    const pr = this.store.updatePurchaseRequest(tenantId, id, dto);
    this.recordAudit(tenantId, actorUserId, 'procurement.request.updated', 'purchase-request', {
      purchaseRequestId: id,
    });
    return pr;
  }

  submitPurchaseRequest(tenantId: string, actorUserId: string | null, id: string) {
    const pr = this.store.getPurchaseRequest(tenantId, id);
    if (pr.status !== 'draft') {
      throw new BadRequestException('Can only submit draft requests');
    }
    const updated = this.store.updatePurchaseRequestStatus(tenantId, id, 'pending_approval');
    this.recordAudit(tenantId, actorUserId, 'procurement.request.submitted', 'purchase-request', {
      purchaseRequestId: id,
    });
    return updated;
  }

  approvePurchaseRequest(tenantId: string, actorUserId: string | null, id: string) {
    const pr = this.store.getPurchaseRequest(tenantId, id);
    if (pr.status !== 'pending_approval') {
      throw new BadRequestException('Can only approve pending requests');
    }
    const updated = this.store.updatePurchaseRequestStatus(tenantId, id, 'approved', {
      actorUserId,
    });
    this.recordAudit(tenantId, actorUserId, 'procurement.request.approved', 'purchase-request', {
      purchaseRequestId: id,
      approvedBy: actorUserId,
    });
    return updated;
  }

  rejectPurchaseRequest(tenantId: string, actorUserId: string | null, id: string, reason?: string) {
    const pr = this.store.getPurchaseRequest(tenantId, id);
    if (pr.status !== 'pending_approval') {
      throw new BadRequestException('Can only reject pending requests');
    }
    const updated = this.store.updatePurchaseRequestStatus(tenantId, id, 'rejected', {
      actorUserId,
      rejectionReason: reason,
    });
    this.recordAudit(tenantId, actorUserId, 'procurement.request.rejected', 'purchase-request', {
      purchaseRequestId: id,
      rejectedBy: actorUserId,
      reason,
    });
    return updated;
  }

  cancelPurchaseRequest(tenantId: string, actorUserId: string | null, id: string, reason?: string) {
    const pr = this.store.getPurchaseRequest(tenantId, id);
    if (['approved', 'cancelled'].includes(pr.status)) {
      throw new BadRequestException(`Cannot cancel a purchase request with status '${pr.status}'`);
    }
    const updated = this.store.updatePurchaseRequestStatus(tenantId, id, 'cancelled');
    this.recordAudit(tenantId, actorUserId, 'procurement.request.cancelled', 'purchase-request', {
      purchaseRequestId: id,
      reason,
    });
    return updated;
  }

  // ─── Quotations ────────────────────────────────────────────────────────────

  listQuotations(tenantId: string, query: ListProcurementQueryDto = {}) {
    return this.paginate(
      this.store.listQuotations(tenantId),
      query,
      ['quoteReference', 'supplierId'],
      'createdAt',
      ['status', 'supplierId'],
    );
  }

  getQuotation(tenantId: string, id: string) {
    return this.store.getQuotation(tenantId, id);
  }

  createQuotation(tenantId: string, actorUserId: string | null, dto: CreateQuotationDto) {
    const quotation = this.store.createQuotation(tenantId, dto);
    this.recordAudit(tenantId, actorUserId, 'procurement.quotation.created', 'quotation', {
      quotationId: quotation.id,
      quoteReference: quotation.quoteReference,
      supplierId: quotation.supplierId,
      totalAmount: quotation.totalAmount,
    });
    return quotation;
  }

  acceptQuotation(tenantId: string, actorUserId: string | null, id: string) {
    const quotation = this.store.updateQuotationStatus(tenantId, id, 'accepted');
    this.recordAudit(tenantId, actorUserId, 'procurement.quotation.accepted', 'quotation', {
      quotationId: id,
    });
    return quotation;
  }

  rejectQuotation(tenantId: string, actorUserId: string | null, id: string) {
    const quotation = this.store.updateQuotationStatus(tenantId, id, 'rejected');
    this.recordAudit(tenantId, actorUserId, 'procurement.quotation.rejected', 'quotation', {
      quotationId: id,
    });
    return quotation;
  }

  // ─── Purchase Orders ───────────────────────────────────────────────────────

  listPurchaseOrders(tenantId: string, query: ListProcurementQueryDto = {}) {
    return this.paginate(
      this.store.listPurchaseOrders(tenantId),
      query,
      ['poNumber', 'supplierId'],
      'createdAt',
      ['supplierId', 'status'],
    );
  }

  getPurchaseOrder(tenantId: string, id: string) {
    return this.store.getPurchaseOrder(tenantId, id);
  }

  createPurchaseOrder(tenantId: string, actorUserId: string | null, dto: CreatePurchaseOrderDto) {
    // If referencing PR, check it exists and is approved
    if (dto.purchaseRequestId) {
      const pr = this.store.getPurchaseRequest(tenantId, dto.purchaseRequestId);
      if (pr.status !== 'approved') {
        throw new BadRequestException('Cannot raise a purchase order against an unapproved request');
      }
    }
    // If referencing Quotation, check it exists and is accepted
    if (dto.quotationId) {
      const q = this.store.getQuotation(tenantId, dto.quotationId);
      if (q.status !== 'accepted') {
        throw new BadRequestException('Cannot raise a purchase order against an unaccepted quotation');
      }
    }

    const po = this.store.createPurchaseOrder(tenantId, dto);
    this.recordAudit(tenantId, actorUserId, 'procurement.order.created', 'purchase-order', {
      purchaseOrderId: po.id,
      poNumber: po.poNumber,
      totalAmount: po.totalAmount,
    });
    return po;
  }

  sendPurchaseOrder(tenantId: string, actorUserId: string | null, id: string) {
    const po = this.store.getPurchaseOrder(tenantId, id);
    if (po.status !== 'draft') {
      throw new BadRequestException('Can only send draft purchase orders');
    }
    const updated = this.store.updatePurchaseOrderStatus(tenantId, id, 'sent');
    this.recordAudit(tenantId, actorUserId, 'procurement.order.sent', 'purchase-order', {
      purchaseOrderId: id,
    });
    return updated;
  }

  cancelPurchaseOrder(tenantId: string, actorUserId: string | null, id: string, reason?: string) {
    const po = this.store.cancelPurchaseOrder(tenantId, id, reason);
    this.recordAudit(tenantId, actorUserId, 'procurement.order.cancelled', 'purchase-order', {
      purchaseOrderId: id,
      reason,
    });
    return po;
  }

  setExpectedDeliveryDate(tenantId: string, actorUserId: string | null, id: string, date: string) {
    const po = this.store.updatePurchaseOrderDeliveryDate(tenantId, id, date);
    this.recordAudit(tenantId, actorUserId, 'procurement.order.delivery_date_set', 'purchase-order', {
      purchaseOrderId: id,
      expectedDeliveryDate: date,
    });
    return po;
  }

  // ─── GRNs ─────────────────────────────────────────────────────────────────

  getGRN(tenantId: string, id: string) {
    return this.store.getGRN(tenantId, id);
  }

  createGRN(tenantId: string, actorUserId: string | null, poId: string, dto: CreateGrnDto) {
    const po = this.store.getPurchaseOrder(tenantId, poId);
    if (!['sent', 'partially_received'].includes(po.status)) {
      throw new BadRequestException('Can only receive goods against sent or partially received purchase orders');
    }

    // Validate received item quantities
    for (const ri of dto.receivedItems) {
      const poItem = po.items.find((pi) => pi.name === ri.name);
      if (!poItem) {
        throw new BadRequestException(`Item '${ri.name}' does not exist in Purchase Order`);
      }
      if (poItem.quantityReceived + ri.quantityReceived > poItem.quantity) {
        throw new BadRequestException(`Received quantity for '${ri.name}' exceeds ordered quantity`);
      }
    }

    const grn = this.store.createGRN(tenantId, poId, actorUserId, dto);

    // Mock Inventory Integration log
    this.logger.log(
      `Inventory updated: GRN ${grn.grnNumber} — received ${JSON.stringify(dto.receivedItems)} for tenant ${tenantId}`,
      'ProcurementService',
    );

    this.recordAudit(tenantId, actorUserId, 'procurement.grn.created', 'goods-received-note', {
      grnId: grn.id,
      grnNumber: grn.grnNumber,
      purchaseOrderId: poId,
    });
    this.recordAudit(tenantId, actorUserId, 'procurement.inventory.updated', 'inventory', {
      grnNumber: grn.grnNumber,
      receivedItems: grn.receivedItems,
    });

    return grn;
  }

  listGRNs(tenantId: string, query: ListProcurementQueryDto = {}) {
    return this.paginate(
      this.store.listGRNs(tenantId),
      query,
      ['grnNumber', 'purchaseOrderId'],
      'createdAt',
    );
  }

  listGRNsByPO(tenantId: string, poId: string, query: ListProcurementQueryDto = {}) {
    return this.paginate(
      this.store.listGRNsByPO(tenantId, poId),
      query,
      ['grnNumber'],
      'createdAt',
    );
  }

  // ─── Contracts ────────────────────────────────────────────────────────────

  listContracts(tenantId: string, query: ListProcurementQueryDto = {}) {
    return this.paginate(
      this.store.listContracts(tenantId),
      query,
      ['contractNumber', 'title'],
      'createdAt',
      ['status', 'supplierId'],
    );
  }

  getContract(tenantId: string, id: string) {
    return this.store.getContract(tenantId, id);
  }

  createContract(tenantId: string, actorUserId: string | null, dto: CreateContractDto) {
    const contract = this.store.createContract(tenantId, dto);
    this.recordAudit(tenantId, actorUserId, 'procurement.contract.created', 'contract', {
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      supplierId: contract.supplierId,
      value: contract.value,
    });
    return contract;
  }

  updateContract(tenantId: string, actorUserId: string | null, id: string, dto: UpdateContractDto) {
    const contract = this.store.updateContract(tenantId, id, dto);
    this.recordAudit(tenantId, actorUserId, 'procurement.contract.updated', 'contract', {
      contractId: id,
      status: contract.status,
    });
    return contract;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private paginate<T extends object>(
    items: T[],
    query: ListProcurementQueryDto,
    searchFields: string[],
    defaultSortBy: string,
    extraFilters: string[] = [],
  ): PaginatedResult<T> {
    let result = [...items];
    result = this.search.search(result, query.q ?? '', searchFields);

    const filters: Record<string, unknown> = {};
    for (const key of extraFilters) {
      const value = query[key as keyof ListProcurementQueryDto];
      if (value !== undefined && value !== null && value !== '') {
        filters[key] = value;
      }
    }
    if (query.status !== undefined && query.status !== null && query.status !== '') {
      filters.status = query.status;
    }

    result = this.filtering.filter(result, filters);
    result = this.sorting.sort(result, query.sortBy ?? defaultSortBy, query.sortOrder ?? 'desc');
    return this.pagination.paginate(result, query);
  }

  private recordAudit(
    tenantId: string,
    userId: string | null,
    action: string,
    resource: string,
    metadata: Record<string, unknown>,
  ) {
    this.audit.record({ tenantId, userId, action, resource, metadata });
  }
}
