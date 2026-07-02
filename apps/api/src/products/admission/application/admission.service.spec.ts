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

  it('updates a draft application before submission', () => {
    const { platformState, service } = createService();
    const tenant = platformState.getTenantBySlug('miami-academy');
    const applicant = service.createApplicant(tenant!.id, null, {
      firstName: 'Jane',
      lastName: 'Doe',
    });
    const secondApplicant = service.createApplicant(tenant!.id, null, {
      firstName: 'Amina',
      lastName: 'Moyo',
    });
    const programme = service.listProgrammes(tenant!.id).items[0];
    const secondProgramme = service.listProgrammes(tenant!.id).items[1];

    expect(programme).toBeDefined();
    expect(secondProgramme).toBeDefined();

    const application = service.createApplication(tenant!.id, null, {
      applicantId: applicant.id,
      programmeId: programme!.id,
      submissionNotes: 'Original notes',
    });
    const updated = service.updateApplication(tenant!.id, null, application.id, {
      applicantId: secondApplicant.id,
      programmeId: secondProgramme!.id,
      submissionNotes: 'Updated notes',
    });
    const submitted = service.submitApplication(tenant!.id, null, updated.id);

    expect(updated.applicantId).toBe(secondApplicant.id);
    expect(updated.programmeId).toBe(secondProgramme!.id);
    expect(updated.submissionNotes).toBe('Updated notes');
    expect(submitted.status).toBe('submitted');
    expect(submitted.applicantName).toContain('Amina');
  });

  it('prevents editing submitted applications', () => {
    const { platformState, service } = createService();
    const tenant = platformState.getTenantBySlug('miami-academy');
    const applicant = service.createApplicant(tenant!.id, null, {
      firstName: 'Jane',
      lastName: 'Doe',
    });
    const programme = service.listProgrammes(tenant!.id).items[0];
    const application = service.createApplication(tenant!.id, null, {
      applicantId: applicant.id,
      programmeId: programme!.id,
    });
    service.submitApplication(tenant!.id, null, application.id);

    expect(() =>
      service.updateApplication(tenant!.id, null, application.id, {
        submissionNotes: 'Should fail',
      }),
    ).toThrow('Only draft applications can be edited');
  });
});
