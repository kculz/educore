import { FeesService } from './fees.service';
import { FeesStoreService } from '../infrastructure/fees-store.service';
import { InternalGatewayProvider } from '../infrastructure/payment-providers/internal-gateway.provider';
import { FilteringService } from '../../../shared/query/filtering.service';
import { PaginationService } from '../../../shared/query/pagination.service';
import { SearchService } from '../../../shared/query/search.service';
import { SortingService } from '../../../shared/query/sorting.service';
import { PlatformStateService } from '../../../core/platform-state/platform-state.service';
import { AuditRecorderService } from '../../../core/audit/audit-recorder.service';

describe('FeesService', () => {
  const createService = () => {
    const platformState = new PlatformStateService();
    const auditRecorder = new AuditRecorderService(platformState);
    const store = new FeesStoreService(platformState);
    const internalProvider = new InternalGatewayProvider();
    const service = new FeesService(
      store,
      internalProvider,
      new SearchService(),
      new FilteringService(),
      new SortingService(),
      new PaginationService(),
      auditRecorder,
    );

    return { platformState, service };
  };

  it('lists seeded fee structures and invoices for a tenant', () => {
    const { platformState, service } = createService();
    const tenant = platformState.getTenantBySlug('miami-academy');
    const structures = service.listFeeStructures(tenant!.id);
    const invoices = service.listInvoices(tenant!.id);

    expect(structures.items.length).toBeGreaterThan(0);
    expect(invoices.items.length).toBeGreaterThan(0);
  });

  it('creates and updates fee structures', () => {
    const { platformState, service } = createService();
    const tenant = platformState.getTenantBySlug('miami-academy');

    const created = service.createFeeStructure(tenant!.id, null, {
      name: 'Computer Lab Fee',
      academicYear: '2026/2027',
      amount: 150,
      status: 'active',
    });

    expect(created.name).toBe('Computer Lab Fee');
    expect(created.amount).toBe(150);

    const updated = service.updateFeeStructure(tenant!.id, null, created.id, {
      amount: 175,
      status: 'archived',
    });

    expect(updated.amount).toBe(175);
    expect(updated.status).toBe('archived');
  });

  it('creates invoices and processes payments', async () => {
    const { platformState, service } = createService();
    const tenant = platformState.getTenantBySlug('miami-academy');

    const invoice = service.createInvoice(tenant!.id, null, {
      studentId: 'STU-100',
      dueDate: '2026-12-31',
      lines: [
        { description: 'Tuition', amount: 1000 },
        { description: 'Sports', amount: 100 },
      ],
    });

    expect(invoice.invoiceNumber).toBeDefined();
    expect(invoice.amount).toBe(1100);
    expect(invoice.status).toBe('unpaid');

    const payment = await service.payInvoice(tenant!.id, null, invoice.id, {
      amount: 500,
      paymentMethod: 'internal',
    });

    expect(payment.status).toBe('completed');
    expect(payment.amount).toBe(500);

    const updatedInvoice = service.getInvoice(tenant!.id, invoice.id);
    expect(updatedInvoice.amountPaid).toBe(500);
    expect(updatedInvoice.status).toBe('partially_paid');

    const studentBalance = service.getStudentBalance(tenant!.id, 'STU-100');
    expect(studentBalance.balance).toBe(600);
  });

  it('calculates dashboard metrics', () => {
    const { platformState, service } = createService();
    const tenant = platformState.getTenantBySlug('miami-academy');
    const dashboard = service.dashboard(tenant!.id);

    expect(dashboard.tenantName).toBe('Miami Academy');
    expect(dashboard.invoiceCount).toBeGreaterThan(0);
  });
});
