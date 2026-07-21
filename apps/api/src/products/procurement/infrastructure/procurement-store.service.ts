import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { PlatformStateService } from '../../../core/platform-state/platform-state.service';
import type {
  Supplier,
  PurchaseRequest,
  PurchaseOrder,
  GoodsReceivedNote,
  Quotation,
  Contract,
  ProcurementDashboardSummary,
  PurchaseRequestItem,
  PurchaseOrderItem,
  GoodsReceivedNoteItem,
  QuotationItem,
} from '../domain/procurement.types';
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

function now() {
  return new Date().toISOString();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

@Injectable()
export class ProcurementStoreService {
  private readonly seededTenants = new Set<string>();
  private readonly suppliers = new Map<string, Supplier>();
  private readonly purchaseRequests = new Map<string, PurchaseRequest>();
  private readonly purchaseOrders = new Map<string, PurchaseOrder>();
  private readonly grns = new Map<string, GoodsReceivedNote>();
  private readonly quotations = new Map<string, Quotation>();
  private readonly contracts = new Map<string, Contract>();

  constructor(@Inject(PlatformStateService) private readonly platformState: PlatformStateService) {}

  // ─── Tenant Seeding ────────────────────────────────────────────────────────

  ensureTenantSeed(tenantId: string) {
    if (this.seededTenants.has(tenantId)) {
      return;
    }

    const tenant = this.platformState.getTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Seed sample suppliers
    const seedSuppliers = [
      {
        name: 'Office Depot Corp',
        contact: 'John Doe',
        email: 'john@officedepot.local',
        phone: '+123456789',
        category: 'Stationery & Office',
        address: '123 Main St, Nairobi',
      },
      {
        name: 'Tech Solutions Ltd',
        contact: 'Jane Smith',
        email: 'jane@techsolutions.local',
        phone: '+987654321',
        category: 'IT Equipment',
        address: '45 Tech Park, Westlands',
      },
      {
        name: 'Global Logistics Inc',
        contact: 'Bob Johnson',
        email: 'bob@globallogistics.local',
        phone: '+11223344',
        category: 'Logistics & Delivery',
        address: '78 Industrial Area, Mombasa Rd',
      },
    ];

    for (const sup of seedSuppliers) {
      const record: Supplier = {
        id: randomUUID(),
        tenantId,
        name: sup.name,
        contactName: sup.contact,
        email: sup.email,
        phoneNumber: sup.phone,
        address: sup.address,
        taxId: null,
        category: sup.category,
        bankDetails: null,
        rating: null,
        status: 'active',
        createdAt: now(),
        updatedAt: now(),
      };
      this.suppliers.set(record.id, record);
    }

    this.seededTenants.add(tenantId);
  }

  // ─── Suppliers ─────────────────────────────────────────────────────────────

  listSuppliers(tenantId: string) {
    this.ensureTenantSeed(tenantId);
    return Array.from(this.suppliers.values())
      .filter((s) => s.tenantId === tenantId)
      .map(clone);
  }

  getSupplier(tenantId: string, id: string) {
    this.ensureTenantSeed(tenantId);
    const supplier = this.suppliers.get(id);
    if (!supplier || supplier.tenantId !== tenantId) {
      throw new NotFoundException('Supplier not found');
    }
    return clone(supplier);
  }

  createSupplier(tenantId: string, dto: CreateSupplierDto) {
    this.ensureTenantSeed(tenantId);
    const supplier: Supplier = {
      id: randomUUID(),
      tenantId,
      name: dto.name,
      contactName: dto.contactName ?? null,
      email: dto.email ?? null,
      phoneNumber: dto.phoneNumber ?? null,
      address: dto.address ?? null,
      taxId: dto.taxId ?? null,
      category: dto.category ?? null,
      bankDetails: dto.bankDetails ?? null,
      rating: dto.rating ?? null,
      status: dto.status ?? 'active',
      createdAt: now(),
      updatedAt: now(),
    };
    this.suppliers.set(supplier.id, supplier);
    return clone(supplier);
  }

  updateSupplier(tenantId: string, id: string, dto: Partial<CreateSupplierDto>) {
    this.ensureTenantSeed(tenantId);
    const supplier = this.suppliers.get(id);
    if (!supplier || supplier.tenantId !== tenantId) {
      throw new NotFoundException('Supplier not found');
    }

    if (dto.name !== undefined) supplier.name = dto.name;
    if (dto.contactName !== undefined) supplier.contactName = dto.contactName;
    if (dto.email !== undefined) supplier.email = dto.email;
    if (dto.phoneNumber !== undefined) supplier.phoneNumber = dto.phoneNumber;
    if (dto.address !== undefined) supplier.address = dto.address;
    if (dto.taxId !== undefined) supplier.taxId = dto.taxId;
    if (dto.category !== undefined) supplier.category = dto.category;
    if (dto.bankDetails !== undefined) supplier.bankDetails = dto.bankDetails ?? null;
    if (dto.rating !== undefined) supplier.rating = dto.rating ?? null;
    if (dto.status !== undefined) supplier.status = dto.status;
    supplier.updatedAt = now();

    this.suppliers.set(id, supplier);
    return clone(supplier);
  }

  deleteSupplier(tenantId: string, id: string) {
    this.ensureTenantSeed(tenantId);
    const supplier = this.suppliers.get(id);
    if (!supplier || supplier.tenantId !== tenantId) {
      throw new NotFoundException('Supplier not found');
    }
    // Soft-delete: set inactive and mark deleted timestamp
    supplier.status = 'inactive';
    supplier.updatedAt = now();
    this.suppliers.set(id, supplier);
    return clone(supplier);
  }

  // ─── Purchase Requests ─────────────────────────────────────────────────────

  listPurchaseRequests(tenantId: string) {
    this.ensureTenantSeed(tenantId);
    return Array.from(this.purchaseRequests.values())
      .filter((pr) => pr.tenantId === tenantId)
      .map(clone);
  }

  getPurchaseRequest(tenantId: string, id: string) {
    this.ensureTenantSeed(tenantId);
    const pr = this.purchaseRequests.get(id);
    if (!pr || pr.tenantId !== tenantId) {
      throw new NotFoundException('Purchase request not found');
    }
    return clone(pr);
  }

  createPurchaseRequest(tenantId: string, requesterId: string | null, dto: CreatePurchaseRequestDto) {
    this.ensureTenantSeed(tenantId);
    const pr: PurchaseRequest = {
      id: randomUUID(),
      tenantId,
      requesterId,
      title: dto.title,
      description: dto.description ?? null,
      items: dto.items.map((it) => ({
        name: it.name,
        quantity: it.quantity,
        estimatedUnitCost: it.estimatedUnitCost,
      })),
      status: 'draft',
      approvedBy: null,
      rejectedBy: null,
      rejectionReason: null,
      cancelledAt: null,
      createdAt: now(),
      updatedAt: now(),
    };
    this.purchaseRequests.set(pr.id, pr);
    return clone(pr);
  }

  updatePurchaseRequest(tenantId: string, id: string, dto: UpdatePurchaseRequestDto) {
    this.ensureTenantSeed(tenantId);
    const pr = this.purchaseRequests.get(id);
    if (!pr || pr.tenantId !== tenantId) {
      throw new NotFoundException('Purchase request not found');
    }
    if (pr.status !== 'draft') {
      throw new BadRequestException('Only draft purchase requests can be edited');
    }
    if (dto.title !== undefined) pr.title = dto.title;
    if (dto.description !== undefined) pr.description = dto.description ?? null;
    if (dto.items !== undefined) {
      pr.items = dto.items.map((it) => ({
        name: it.name,
        quantity: it.quantity,
        estimatedUnitCost: it.estimatedUnitCost,
      }));
    }
    pr.updatedAt = now();
    this.purchaseRequests.set(id, pr);
    return clone(pr);
  }

  updatePurchaseRequestStatus(
    tenantId: string,
    id: string,
    status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'cancelled',
    meta?: { actorUserId?: string | null; rejectionReason?: string },
  ) {
    this.ensureTenantSeed(tenantId);
    const pr = this.purchaseRequests.get(id);
    if (!pr || pr.tenantId !== tenantId) {
      throw new NotFoundException('Purchase request not found');
    }
    pr.status = status;
    if (status === 'approved' && meta?.actorUserId) pr.approvedBy = meta.actorUserId;
    if (status === 'rejected') {
      if (meta?.actorUserId) pr.rejectedBy = meta.actorUserId;
      if (meta?.rejectionReason) pr.rejectionReason = meta.rejectionReason;
    }
    if (status === 'cancelled') pr.cancelledAt = now();
    pr.updatedAt = now();
    this.purchaseRequests.set(id, pr);
    return clone(pr);
  }

  // ─── Quotations ────────────────────────────────────────────────────────────

  listQuotations(tenantId: string) {
    this.ensureTenantSeed(tenantId);
    return Array.from(this.quotations.values())
      .filter((q) => q.tenantId === tenantId)
      .map(clone);
  }

  getQuotation(tenantId: string, id: string) {
    this.ensureTenantSeed(tenantId);
    const q = this.quotations.get(id);
    if (!q || q.tenantId !== tenantId) {
      throw new NotFoundException('Quotation not found');
    }
    return clone(q);
  }

  createQuotation(tenantId: string, dto: CreateQuotationDto) {
    this.ensureTenantSeed(tenantId);
    // Validate supplier exists
    this.getSupplier(tenantId, dto.supplierId);

    const year = new Date().getFullYear();
    const count = Array.from(this.quotations.values()).filter((q) => q.tenantId === tenantId).length + 1;
    const quoteReference = dto.quoteReference ?? `QUO-${year}-${String(count).padStart(3, '0')}`;

    const items: QuotationItem[] = dto.items.map((it) => ({
      name: it.name,
      quantity: it.quantity,
      unitCost: it.unitCost,
    }));
    const totalAmount = items.reduce((sum, it) => sum + it.quantity * it.unitCost, 0);

    const quotation: Quotation = {
      id: randomUUID(),
      tenantId,
      purchaseRequestId: dto.purchaseRequestId ?? null,
      supplierId: dto.supplierId,
      quoteReference,
      items,
      totalAmount,
      validUntil: dto.validUntil ?? null,
      status: 'received',
      notes: dto.notes ?? null,
      createdAt: now(),
      updatedAt: now(),
    };
    this.quotations.set(quotation.id, quotation);
    return clone(quotation);
  }

  updateQuotationStatus(tenantId: string, id: string, status: 'received' | 'accepted' | 'rejected') {
    this.ensureTenantSeed(tenantId);
    const q = this.quotations.get(id);
    if (!q || q.tenantId !== tenantId) {
      throw new NotFoundException('Quotation not found');
    }
    // Only one quotation per PR can be accepted
    if (status === 'accepted' && q.purchaseRequestId) {
      const alreadyAccepted = Array.from(this.quotations.values()).some(
        (other) =>
          other.tenantId === tenantId &&
          other.purchaseRequestId === q.purchaseRequestId &&
          other.id !== id &&
          other.status === 'accepted',
      );
      if (alreadyAccepted) {
        throw new ConflictException('Another quotation for this purchase request is already accepted');
      }
    }
    q.status = status;
    q.updatedAt = now();
    this.quotations.set(id, q);
    return clone(q);
  }

  // ─── Purchase Orders ───────────────────────────────────────────────────────

  listPurchaseOrders(tenantId: string) {
    this.ensureTenantSeed(tenantId);
    return Array.from(this.purchaseOrders.values())
      .filter((po) => po.tenantId === tenantId)
      .map(clone);
  }

  getPurchaseOrder(tenantId: string, id: string) {
    this.ensureTenantSeed(tenantId);
    const po = this.purchaseOrders.get(id);
    if (!po || po.tenantId !== tenantId) {
      throw new NotFoundException('Purchase order not found');
    }
    return clone(po);
  }

  createPurchaseOrder(tenantId: string, dto: CreatePurchaseOrderDto) {
    this.ensureTenantSeed(tenantId);
    // Verify supplier
    this.getSupplier(tenantId, dto.supplierId);

    const year = new Date().getFullYear();
    const count = Array.from(this.purchaseOrders.values()).filter((po) => po.tenantId === tenantId).length + 1;
    const poNumber = `PO-${year}-${String(count).padStart(3, '0')}`;

    const items: PurchaseOrderItem[] = dto.items.map((it) => ({
      name: it.name,
      quantity: it.quantity,
      unitCost: it.unitCost,
      quantityReceived: 0,
    }));
    const totalAmount = items.reduce((sum, it) => sum + it.quantity * it.unitCost, 0);

    const po: PurchaseOrder = {
      id: randomUUID(),
      tenantId,
      purchaseRequestId: dto.purchaseRequestId ?? null,
      quotationId: dto.quotationId ?? null,
      supplierId: dto.supplierId,
      poNumber,
      items,
      totalAmount,
      status: 'draft',
      expectedDeliveryDate: dto.expectedDeliveryDate ?? null,
      cancelledAt: null,
      cancelReason: null,
      createdAt: now(),
      updatedAt: now(),
    };
    this.purchaseOrders.set(po.id, po);
    return clone(po);
  }

  updatePurchaseOrderStatus(tenantId: string, id: string, status: PurchaseOrder['status']) {
    this.ensureTenantSeed(tenantId);
    const po = this.purchaseOrders.get(id);
    if (!po || po.tenantId !== tenantId) {
      throw new NotFoundException('Purchase order not found');
    }
    po.status = status;
    po.updatedAt = now();
    this.purchaseOrders.set(id, po);
    return clone(po);
  }

  cancelPurchaseOrder(tenantId: string, id: string, reason?: string) {
    this.ensureTenantSeed(tenantId);
    const po = this.purchaseOrders.get(id);
    if (!po || po.tenantId !== tenantId) {
      throw new NotFoundException('Purchase order not found');
    }
    if (['fully_received', 'cancelled'].includes(po.status)) {
      throw new BadRequestException(`Cannot cancel a purchase order with status '${po.status}'`);
    }
    po.status = 'cancelled';
    po.cancelledAt = now();
    po.cancelReason = reason ?? null;
    po.updatedAt = now();
    this.purchaseOrders.set(id, po);
    return clone(po);
  }

  updatePurchaseOrderDeliveryDate(tenantId: string, id: string, expectedDeliveryDate: string) {
    this.ensureTenantSeed(tenantId);
    const po = this.purchaseOrders.get(id);
    if (!po || po.tenantId !== tenantId) {
      throw new NotFoundException('Purchase order not found');
    }
    po.expectedDeliveryDate = expectedDeliveryDate;
    po.updatedAt = now();
    this.purchaseOrders.set(id, po);
    return clone(po);
  }

  // ─── GRNs ─────────────────────────────────────────────────────────────────

  getGRN(tenantId: string, id: string) {
    this.ensureTenantSeed(tenantId);
    const grn = this.grns.get(id);
    if (!grn || grn.tenantId !== tenantId) {
      throw new NotFoundException('GRN not found');
    }
    return clone(grn);
  }

  createGRN(tenantId: string, poId: string, receivedBy: string | null, dto: CreateGrnDto) {
    this.ensureTenantSeed(tenantId);
    const po = this.purchaseOrders.get(poId);
    if (!po || po.tenantId !== tenantId) {
      throw new NotFoundException('Purchase order not found');
    }

    const year = new Date().getFullYear();
    const count = Array.from(this.grns.values()).filter((g) => g.tenantId === tenantId).length + 1;
    const grnNumber = `GRN-${year}-${String(count).padStart(3, '0')}`;

    const receivedItems: GoodsReceivedNoteItem[] = dto.receivedItems.map((ri) => {
      const poItem = po.items.find((pi) => pi.name === ri.name);
      if (poItem) {
        poItem.quantityReceived += ri.quantityReceived;
      }
      return {
        name: ri.name,
        quantityReceived: ri.quantityReceived,
      };
    });

    // Update PO status
    const allReceived = po.items.every((pi) => pi.quantityReceived >= pi.quantity);
    po.status = allReceived ? 'fully_received' : 'partially_received';
    po.updatedAt = now();
    this.purchaseOrders.set(po.id, po);

    const grn: GoodsReceivedNote = {
      id: randomUUID(),
      tenantId,
      purchaseOrderId: po.id,
      grnNumber,
      receivedAt: now(),
      receivedItems,
      receivedBy,
      notes: dto.notes ?? null,
      createdAt: now(),
    };
    this.grns.set(grn.id, grn);
    return clone(grn);
  }

  listGRNs(tenantId: string) {
    this.ensureTenantSeed(tenantId);
    return Array.from(this.grns.values())
      .filter((g) => g.tenantId === tenantId)
      .map(clone);
  }

  listGRNsByPO(tenantId: string, poId: string) {
    this.ensureTenantSeed(tenantId);
    // Verify PO belongs to tenant
    this.getPurchaseOrder(tenantId, poId);
    return Array.from(this.grns.values())
      .filter((g) => g.tenantId === tenantId && g.purchaseOrderId === poId)
      .map(clone);
  }

  // ─── Contracts ────────────────────────────────────────────────────────────

  listContracts(tenantId: string) {
    this.ensureTenantSeed(tenantId);
    return Array.from(this.contracts.values())
      .filter((c) => c.tenantId === tenantId)
      .map(clone);
  }

  getContract(tenantId: string, id: string) {
    this.ensureTenantSeed(tenantId);
    const c = this.contracts.get(id);
    if (!c || c.tenantId !== tenantId) {
      throw new NotFoundException('Contract not found');
    }
    return clone(c);
  }

  createContract(tenantId: string, dto: CreateContractDto) {
    this.ensureTenantSeed(tenantId);
    // Validate supplier
    this.getSupplier(tenantId, dto.supplierId);

    const year = new Date().getFullYear();
    const count = Array.from(this.contracts.values()).filter((c) => c.tenantId === tenantId).length + 1;
    const contractNumber = `CON-${year}-${String(count).padStart(3, '0')}`;

    const contract: Contract = {
      id: randomUUID(),
      tenantId,
      supplierId: dto.supplierId,
      purchaseOrderId: dto.purchaseOrderId ?? null,
      contractNumber,
      title: dto.title,
      description: dto.description ?? null,
      value: dto.value,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status: 'draft',
      signedAt: null,
      terminatedAt: null,
      terminationReason: null,
      createdAt: now(),
      updatedAt: now(),
    };
    this.contracts.set(contract.id, contract);
    return clone(contract);
  }

  updateContract(tenantId: string, id: string, dto: UpdateContractDto) {
    this.ensureTenantSeed(tenantId);
    const contract = this.contracts.get(id);
    if (!contract || contract.tenantId !== tenantId) {
      throw new NotFoundException('Contract not found');
    }
    if (dto.title !== undefined) contract.title = dto.title;
    if (dto.description !== undefined) contract.description = dto.description ?? null;
    if (dto.value !== undefined) contract.value = dto.value;
    if (dto.startDate !== undefined) contract.startDate = dto.startDate;
    if (dto.endDate !== undefined) contract.endDate = dto.endDate;
    if (dto.status !== undefined) {
      contract.status = dto.status;
      if (dto.status === 'active' && !contract.signedAt) contract.signedAt = now();
      if (dto.status === 'terminated') contract.terminatedAt = now();
    }
    contract.updatedAt = now();
    this.contracts.set(id, contract);
    return clone(contract);
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────

  getDashboardSummary(tenantId: string): ProcurementDashboardSummary {
    this.ensureTenantSeed(tenantId);
    const tenant = this.platformState.getTenantById(tenantId);
    const tenantName = tenant ? tenant.name : 'Unknown';

    const tenantSuppliers = Array.from(this.suppliers.values()).filter((s) => s.tenantId === tenantId);
    const tenantPRs = Array.from(this.purchaseRequests.values()).filter((pr) => pr.tenantId === tenantId);
    const tenantPOs = Array.from(this.purchaseOrders.values()).filter((po) => po.tenantId === tenantId);
    const tenantGRNs = Array.from(this.grns.values()).filter((g) => g.tenantId === tenantId);
    const tenantQuotations = Array.from(this.quotations.values()).filter((q) => q.tenantId === tenantId);
    const tenantContracts = Array.from(this.contracts.values()).filter((c) => c.tenantId === tenantId);

    const supplierCount = tenantSuppliers.filter((s) => s.status === 'active').length;
    const pendingRequestsCount = tenantPRs.filter((pr) => pr.status === 'pending_approval').length;
    const activePoCount = tenantPOs.filter((po) => ['draft', 'sent', 'partially_received'].includes(po.status)).length;

    const completedPos = tenantPOs.filter((po) =>
      ['sent', 'partially_received', 'fully_received'].includes(po.status),
    );
    const totalSpent = tenantPOs
      .filter((po) => po.status === 'fully_received')
      .reduce((sum, po) => sum + po.totalAmount, 0);

    const totalPoValue = tenantPOs
      .filter((po) => po.status !== 'cancelled')
      .reduce((sum, po) => sum + po.totalAmount, 0);

    const recentGrnsCount = tenantGRNs.length;
    const quotationCount = tenantQuotations.length;
    const contractCount = tenantContracts.filter((c) => ['draft', 'active'].includes(c.status)).length;

    // Overdue POs: sent/partially_received but expectedDeliveryDate is in the past
    const today = new Date().toISOString().split('T')[0];
    const overduePoCount = tenantPOs.filter(
      (po) =>
        ['sent', 'partially_received'].includes(po.status) &&
        po.expectedDeliveryDate !== null &&
        po.expectedDeliveryDate < today,
    ).length;

    // PR Conversion rate: % of approved PRs that have a linked PO
    const approvedPRs = tenantPRs.filter((pr) => pr.status === 'approved').length;
    const prsWithPO = tenantPOs
      .filter((po) => po.purchaseRequestId !== null)
      .map((po) => po.purchaseRequestId)
      .filter((v, i, a) => a.indexOf(v) === i).length;
    const prConversionRate = approvedPRs > 0 ? Math.round((prsWithPO / approvedPRs) * 100) : 0;

    return {
      tenantId,
      tenantName,
      supplierCount,
      pendingRequestsCount,
      activePoCount,
      totalSpent,
      recentGrnsCount,
      totalPoValue,
      quotationCount,
      contractCount,
      overduePoCount,
      prConversionRate,
    };
  }
}
