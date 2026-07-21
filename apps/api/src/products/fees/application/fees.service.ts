import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { FilteringService } from '../../../shared/query/filtering.service';
import { PaginationService } from '../../../shared/query/pagination.service';
import { SearchService } from '../../../shared/query/search.service';
import { SortingService } from '../../../shared/query/sorting.service';
import { AuditRecorderService } from '../../../core/audit/audit-recorder.service';
import type { PaginatedResult } from '../../../shared/query/query.types';

import { FeesStoreService } from '../infrastructure/fees-store.service';
import { InternalGatewayProvider } from '../infrastructure/payment-providers/internal-gateway.provider';
import type { PaymentProvider } from '../domain/payment-provider.interface';
import type { FeesDashboardSummary } from '../domain/fees.types';
import type { CreateFeeStructureDto } from '../api/dto/create-fee-structure.dto';
import type { CreateInvoiceDto } from '../api/dto/create-invoice.dto';
import type { CreatePaymentDto } from '../api/dto/create-payment.dto';
import type { ListFeesQueryDto } from '../api/dto/list-fees-query.dto';

@Injectable()
export class FeesService {
  private readonly providers = new Map<string, PaymentProvider>();

  constructor(
    @Inject(FeesStoreService) private readonly store: FeesStoreService,
    @Inject(InternalGatewayProvider) private readonly internalProvider: InternalGatewayProvider,
    @Inject(SearchService) private readonly search: SearchService,
    @Inject(FilteringService) private readonly filtering: FilteringService,
    @Inject(SortingService) private readonly sorting: SortingService,
    @Inject(PaginationService) private readonly pagination: PaginationService,
    @Inject(AuditRecorderService) private readonly audit: AuditRecorderService,
  ) {
    // Register payment providers
    this.providers.set(this.internalProvider.name, this.internalProvider);
  }

  dashboard(tenantId: string): FeesDashboardSummary {
    return this.store.getDashboardSummary(tenantId);
  }

  listFeeStructures(tenantId: string, query: ListFeesQueryDto = {}) {
    return this.paginate(
      this.store.listFeeStructures(tenantId),
      query,
      ['name', 'academicYear'],
      'createdAt',
    );
  }

  createFeeStructure(tenantId: string, actorUserId: string | null, dto: CreateFeeStructureDto) {
    const struct = this.store.createFeeStructure(tenantId, dto);
    this.recordAudit(tenantId, actorUserId, 'fees.structure.created', 'fee-structure', {
      feeStructureId: struct.id,
      name: struct.name,
      amount: struct.amount,
    });
    return struct;
  }

  getFeeStructure(tenantId: string, id: string) {
    return this.store.getFeeStructure(tenantId, id);
  }

  updateFeeStructure(tenantId: string, actorUserId: string | null, id: string, dto: Partial<CreateFeeStructureDto>) {
    const struct = this.store.updateFeeStructure(tenantId, id, dto);
    this.recordAudit(tenantId, actorUserId, 'fees.structure.updated', 'fee-structure', {
      feeStructureId: struct.id,
      name: struct.name,
      amount: struct.amount,
    });
    return struct;
  }

  listInvoices(tenantId: string, query: ListFeesQueryDto = {}) {
    return this.paginate(
      this.store.listInvoices(tenantId),
      query,
      ['invoiceNumber', 'studentId'],
      'createdAt',
      ['studentId'],
    );
  }

  getInvoice(tenantId: string, id: string) {
    return this.store.getInvoice(tenantId, id);
  }

  createInvoice(tenantId: string, actorUserId: string | null, dto: CreateInvoiceDto) {
    const invoice = this.store.createInvoice(tenantId, dto);
    this.recordAudit(tenantId, actorUserId, 'fees.invoice.created', 'invoice', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
    });
    return invoice;
  }

  async payInvoice(tenantId: string, actorUserId: string | null, invoiceId: string, dto: CreatePaymentDto) {
    const invoice = this.store.getInvoice(tenantId, invoiceId);
    if (invoice.status === 'paid') {
      throw new BadRequestException('Invoice is already fully paid');
    }

    const providerName = dto.paymentMethod.toLowerCase();
    const provider = this.providers.get(providerName) ?? this.internalProvider; // Fallback to internal if none matched

    // Process using provider interface
    const paymentResult = await provider.processPayment(tenantId, invoiceId, dto.amount, {
      actorUserId,
    });

    const status = paymentResult.success ? 'completed' : 'failed';
    const payment = this.store.recordPayment(
      tenantId,
      invoiceId,
      dto.amount,
      provider.name,
      paymentResult.transactionReference || 'N/A',
      status,
    );

    this.recordAudit(tenantId, actorUserId, 'fees.payment.recorded', 'payment', {
      paymentId: payment.id,
      invoiceId,
      amount: dto.amount,
      status,
      error: paymentResult.error,
    });

    return payment;
  }

  getStudentBalance(tenantId: string, studentId: string) {
    return this.store.getStudentBalance(tenantId, studentId);
  }

  listPayments(tenantId: string, query: ListFeesQueryDto = {}) {
    return this.paginate(
      this.store.listPayments(tenantId),
      query,
      ['transactionReference', 'invoiceId'],
      'createdAt',
    );
  }

  listReceipts(tenantId: string, query: ListFeesQueryDto = {}) {
    return this.paginate(
      this.store.listReceipts(tenantId),
      query,
      ['receiptNumber', 'paymentId', 'invoiceId'],
      'createdAt',
    );
  }

  private paginate<T extends object>(
    items: T[],
    query: ListFeesQueryDto,
    searchFields: string[],
    defaultSortBy: string,
    extraFilters: string[] = [],
  ): PaginatedResult<T> {
    let result = [...items];
    result = this.search.search(result, query.q ?? '', searchFields);

    const filters: Record<string, unknown> = {};
    for (const key of extraFilters) {
      const value = query[key as keyof ListFeesQueryDto];
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
