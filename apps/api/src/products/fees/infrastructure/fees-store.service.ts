import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { PlatformStateService } from '../../../core/platform-state/platform-state.service';
import type {
  FeeStructure,
  StudentBilling,
  Invoice,
  Payment,
  Receipt,
  StudentBalance,
  FeesDashboardSummary,
} from '../domain/fees.types';
import type { CreateFeeStructureDto } from '../api/dto/create-fee-structure.dto';
import type { CreateInvoiceDto } from '../api/dto/create-invoice.dto';

function now() {
  return new Date().toISOString();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

@Injectable()
export class FeesStoreService {
  private readonly seededTenants = new Set<string>();
  private readonly feeStructures = new Map<string, FeeStructure>();
  private readonly billings = new Map<string, StudentBilling>();
  private readonly invoices = new Map<string, Invoice>();
  private readonly payments = new Map<string, Payment>();
  private readonly receipts = new Map<string, Receipt>();

  constructor(@Inject(PlatformStateService) private readonly platformState: PlatformStateService) {}

  ensureTenantSeed(tenantId: string) {
    if (this.seededTenants.has(tenantId)) {
      return;
    }

    const tenant = this.platformState.getTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const year = new Date().getFullYear();
    const seedStructures = [
      { name: `Tuition Fee ${year}`, amount: 3500, academicYear: `${year}/${year + 1}` },
      { name: `Development Levy ${year}`, amount: 500, academicYear: `${year}/${year + 1}` },
      { name: `Library & ICT Fee ${year}`, amount: 250, academicYear: `${year}/${year + 1}` },
    ];

    for (const struct of seedStructures) {
      const record: FeeStructure = {
        id: randomUUID(),
        tenantId,
        name: struct.name,
        academicYear: struct.academicYear,
        amount: struct.amount,
        status: 'active',
        createdAt: now(),
        updatedAt: now(),
      };
      this.feeStructures.set(record.id, record);
    }

    // Seed a mock student invoice for testing
    const sampleStudentId = 'STU-MOCK-999';
    const sampleInvoiceId = 'INV-MOCK-999';
    const lines = [
      { description: `Tuition Fee ${year}`, amount: 3500 },
      { description: `Library & ICT Fee ${year}`, amount: 250 },
    ];
    const invoice: Invoice = {
      id: sampleInvoiceId,
      tenantId,
      studentId: sampleStudentId,
      invoiceNumber: 'INV-2026-001',
      lines,
      amount: 3750,
      amountPaid: 0,
      status: 'unpaid',
      dueDate: `${year}-12-31`,
      issuedAt: now(),
      createdAt: now(),
      updatedAt: now(),
    };
    this.invoices.set(invoice.id, invoice);

    this.seededTenants.add(tenantId);
  }

  listFeeStructures(tenantId: string) {
    this.ensureTenantSeed(tenantId);
    return Array.from(this.feeStructures.values())
      .filter((s) => s.tenantId === tenantId)
      .map(clone);
  }

  getFeeStructure(tenantId: string, id: string) {
    this.ensureTenantSeed(tenantId);
    const struct = this.feeStructures.get(id);
    if (!struct || struct.tenantId !== tenantId) {
      throw new NotFoundException('Fee structure not found');
    }
    return clone(struct);
  }

  createFeeStructure(tenantId: string, dto: CreateFeeStructureDto) {
    this.ensureTenantSeed(tenantId);
    const struct: FeeStructure = {
      id: randomUUID(),
      tenantId,
      name: dto.name,
      academicYear: dto.academicYear,
      amount: dto.amount,
      status: dto.status ?? 'active',
      createdAt: now(),
      updatedAt: now(),
    };
    this.feeStructures.set(struct.id, struct);
    return clone(struct);
  }

  updateFeeStructure(tenantId: string, id: string, dto: Partial<CreateFeeStructureDto>) {
    this.ensureTenantSeed(tenantId);
    const struct = this.feeStructures.get(id);
    if (!struct || struct.tenantId !== tenantId) {
      throw new NotFoundException('Fee structure not found');
    }

    if (dto.name !== undefined) struct.name = dto.name;
    if (dto.academicYear !== undefined) struct.academicYear = dto.academicYear;
    if (dto.amount !== undefined) struct.amount = dto.amount;
    if (dto.status !== undefined) struct.status = dto.status;
    struct.updatedAt = now();

    this.feeStructures.set(id, struct);
    return clone(struct);
  }

  listInvoices(tenantId: string) {
    this.ensureTenantSeed(tenantId);
    return Array.from(this.invoices.values())
      .filter((i) => i.tenantId === tenantId)
      .map(clone);
  }

  getInvoice(tenantId: string, id: string) {
    this.ensureTenantSeed(tenantId);
    const invoice = this.invoices.get(id);
    if (!invoice || invoice.tenantId !== tenantId) {
      throw new NotFoundException('Invoice not found');
    }
    return clone(invoice);
  }

  createInvoice(tenantId: string, dto: CreateInvoiceDto) {
    this.ensureTenantSeed(tenantId);
    const totalAmount = dto.lines.reduce((sum, line) => sum + line.amount, 0);
    const year = new Date().getFullYear();
    const count = Array.from(this.invoices.values()).filter((i) => i.tenantId === tenantId).length + 1;
    const invoiceNumber = `INV-${year}-${String(count).padStart(3, '0')}`;

    const invoice: Invoice = {
      id: randomUUID(),
      tenantId,
      studentId: dto.studentId,
      invoiceNumber,
      lines: dto.lines.map((l) => ({ description: l.description, amount: l.amount })),
      amount: totalAmount,
      amountPaid: 0,
      status: 'unpaid',
      dueDate: dto.dueDate,
      issuedAt: now(),
      createdAt: now(),
      updatedAt: now(),
    };
    this.invoices.set(invoice.id, invoice);
    return clone(invoice);
  }

  recordPayment(
    tenantId: string,
    invoiceId: string,
    amount: number,
    paymentMethod: string,
    transactionReference: string,
    status: 'completed' | 'failed' | 'pending',
  ) {
    this.ensureTenantSeed(tenantId);
    const invoice = this.invoices.get(invoiceId);
    if (!invoice || invoice.tenantId !== tenantId) {
      throw new NotFoundException('Invoice not found');
    }

    const payment: Payment = {
      id: randomUUID(),
      tenantId,
      invoiceId,
      amount,
      paymentMethod,
      transactionReference,
      status,
      completedAt: status === 'completed' ? now() : null,
      createdAt: now(),
      updatedAt: now(),
    };
    this.payments.set(payment.id, payment);

    if (status === 'completed') {
      invoice.amountPaid += amount;
      if (invoice.amountPaid >= invoice.amount) {
        invoice.status = 'paid';
      } else {
        invoice.status = 'partially_paid';
      }
      invoice.updatedAt = now();
      this.invoices.set(invoice.id, invoice);

      // Issue receipt
      const year = new Date().getFullYear();
      const count = Array.from(this.receipts.values()).filter((r) => r.tenantId === tenantId).length + 1;
      const receiptNumber = `REC-${year}-${String(count).padStart(3, '0')}`;

      const receipt: Receipt = {
        id: randomUUID(),
        tenantId,
        paymentId: payment.id,
        invoiceId,
        receiptNumber,
        amount,
        issuedAt: now(),
        createdAt: now(),
      };
      this.receipts.set(receipt.id, receipt);
    }

    return clone(payment);
  }

  getStudentBalance(tenantId: string, studentId: string): StudentBalance {
    this.ensureTenantSeed(tenantId);
    const studentInvoices = Array.from(this.invoices.values()).filter(
      (i) => i.tenantId === tenantId && i.studentId === studentId,
    );

    const totalBilled = studentInvoices.reduce((sum, i) => sum + i.amount, 0);
    const totalPaid = studentInvoices.reduce((sum, i) => sum + i.amountPaid, 0);

    return {
      studentId,
      totalBilled,
      totalPaid,
      balance: totalBilled - totalPaid,
    };
  }

  listPayments(tenantId: string) {
    this.ensureTenantSeed(tenantId);
    return Array.from(this.payments.values())
      .filter((p) => p.tenantId === tenantId)
      .map(clone);
  }

  listReceipts(tenantId: string) {
    this.ensureTenantSeed(tenantId);
    return Array.from(this.receipts.values())
      .filter((r) => r.tenantId === tenantId)
      .map(clone);
  }

  getDashboardSummary(tenantId: string): FeesDashboardSummary {
    this.ensureTenantSeed(tenantId);
    const tenant = this.platformState.getTenantById(tenantId);
    const tenantName = tenant ? tenant.name : 'Unknown';

    const tenantInvoices = Array.from(this.invoices.values()).filter((i) => i.tenantId === tenantId);
    const tenantPayments = Array.from(this.payments.values()).filter(
      (p) => p.tenantId === tenantId && p.status === 'completed',
    );

    const totalBilled = tenantInvoices.reduce((sum, i) => sum + i.amount, 0);
    const totalPaid = tenantInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
    const outstandingBalance = totalBilled - totalPaid;
    const invoiceCount = tenantInvoices.length;
    const paymentCount = tenantPayments.length;
    const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;

    return {
      tenantId,
      tenantName,
      totalBilled,
      totalPaid,
      outstandingBalance,
      invoiceCount,
      paymentCount,
      collectionRate,
    };
  }
}
