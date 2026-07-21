import { ProcurementService } from './procurement.service';
import { ProcurementStoreService } from '../infrastructure/procurement-store.service';
import { FilteringService } from '../../../shared/query/filtering.service';
import { PaginationService } from '../../../shared/query/pagination.service';
import { SearchService } from '../../../shared/query/search.service';
import { SortingService } from '../../../shared/query/sorting.service';
import { PlatformStateService } from '../../../core/platform-state/platform-state.service';
import { AuditRecorderService } from '../../../core/audit/audit-recorder.service';
import { PlatformLoggerService } from '../../../core/logging/platform-logger.service';

describe('ProcurementService', () => {
  const createService = () => {
    const platformState = new PlatformStateService();
    const auditRecorder = new AuditRecorderService(platformState);
    const store = new ProcurementStoreService(platformState);
    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as unknown as PlatformLoggerService;
    const service = new ProcurementService(
      store,
      new SearchService(),
      new FilteringService(),
      new SortingService(),
      new PaginationService(),
      auditRecorder,
      mockLogger,
    );

    return { platformState, service };
  };

  it('lists seeded suppliers for a tenant', () => {
    const { platformState, service } = createService();
    const tenant = platformState.getTenantBySlug('miami-academy');
    const suppliers = service.listSuppliers(tenant!.id);

    expect(suppliers.items.length).toBeGreaterThan(0);
  });

  it('creates and updates suppliers', () => {
    const { platformState, service } = createService();
    const tenant = platformState.getTenantBySlug('miami-academy');

    const created = service.createSupplier(tenant!.id, null, {
      name: 'Acme Heavy Industries',
      contactName: 'Wile E. Coyote',
      email: 'wile@acme.local',
      phoneNumber: '+15551234',
      status: 'active',
    });

    expect(created.name).toBe('Acme Heavy Industries');
    expect(created.email).toBe('wile@acme.local');

    const updated = service.updateSupplier(tenant!.id, null, created.id, {
      status: 'inactive',
    });

    expect(updated.status).toBe('inactive');
  });

  it('runs purchase request workflow through approval', () => {
    const { platformState, service } = createService();
    const tenant = platformState.getTenantBySlug('miami-academy');

    const pr = service.createPurchaseRequest(tenant!.id, 'USER-1', null, {
      title: 'New Office Chairs',
      description: 'Ergonomic chairs for main office',
      items: [
        { name: 'Chair A', quantity: 5, estimatedUnitCost: 150 },
      ],
    });

    expect(pr.status).toBe('draft');

    const submitted = service.submitPurchaseRequest(tenant!.id, null, pr.id);
    expect(submitted.status).toBe('pending_approval');

    const approved = service.approvePurchaseRequest(tenant!.id, null, pr.id);
    expect(approved.status).toBe('approved');
  });

  it('handles purchase order and GRN lifecycle', () => {
    const { platformState, service } = createService();
    const tenant = platformState.getTenantBySlug('miami-academy');
    const supplier = service.listSuppliers(tenant!.id).items[0];

    const po = service.createPurchaseOrder(tenant!.id, null, {
      supplierId: supplier!.id,
      items: [
        { name: 'Paper Reams', quantity: 20, unitCost: 5 },
        { name: 'Pens Box', quantity: 5, unitCost: 10 },
      ],
    });

    expect(po.status).toBe('draft');
    expect(po.totalAmount).toBe(150);

    const sent = service.sendPurchaseOrder(tenant!.id, null, po.id);
    expect(sent.status).toBe('sent');

    const grn = service.createGRN(tenant!.id, null, po.id, {
      receivedItems: [
        { name: 'Paper Reams', quantityReceived: 10 },
      ],
      notes: 'First batch delivered',
    });

    expect(grn.grnNumber).toBeDefined();

    const poAfterGrn = service.getPurchaseOrder(tenant!.id, po.id);
    expect(poAfterGrn.status).toBe('partially_received');
    expect(poAfterGrn.items[0].quantityReceived).toBe(10);
  });
});
