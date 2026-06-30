import { AdmissionService } from './admission.service';
import { AdmissionStoreService } from '../infrastructure/admission-store.service';
import { FilteringService } from '../../../shared/query/filtering.service';
import { PaginationService } from '../../../shared/query/pagination.service';
import { SearchService } from '../../../shared/query/search.service';
import { SortingService } from '../../../shared/query/sorting.service';
import { PlatformStateService } from '../../../core/platform-state/platform-state.service';

describe('AdmissionService', () => {
  const createService = () => {
    const platformState = new PlatformStateService();
    const store = new AdmissionStoreService(platformState);
    const service = new AdmissionService(
      store,
      new SearchService(),
      new FilteringService(),
      new SortingService(),
      new PaginationService(),
      platformState,
    );

    return { platformState, service };
  };

  it('lists seeded cycles and programmes for a tenant', () => {
    const { platformState, service } = createService();
    const tenant = platformState.getTenantBySlug('miami-academy');
    const cycles = service.listCycles(tenant!.id);
    const programmes = service.listProgrammes(tenant!.id);

    expect(cycles.items.length).toBeGreaterThan(0);
    expect(programmes.items.length).toBeGreaterThan(0);
  });

  it('creates and submits an application flow', () => {
    const { platformState, service } = createService();
    const tenant = platformState.getTenantBySlug('miami-academy');
    const applicant = service.createApplicant(tenant!.id, null, {
      firstName: 'Jane',
      lastName: 'Doe',
    });
    const programme = service.listProgrammes(tenant!.id).items[0];

    expect(programme).toBeDefined();

    const application = service.createApplication(tenant!.id, null, {
      applicantId: applicant.id,
      programmeId: programme!.id,
    });
    const submitted = service.submitApplication(tenant!.id, null, application.id);

    expect(submitted.status).toBe('submitted');
    expect(submitted.applicantName).toContain('Jane');
  });
});
