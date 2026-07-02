import { AdmissionService } from './admission.service';
import { AdmissionStoreService } from '../infrastructure/admission-store.service';
import { FilteringService } from '../../../shared/query/filtering.service';
import { PaginationService } from '../../../shared/query/pagination.service';
import { SearchService } from '../../../shared/query/search.service';
import { SortingService } from '../../../shared/query/sorting.service';
import { PlatformStateService } from '../../../core/platform-state/platform-state.service';
import { AuditRecorderService } from '../../../core/audit/audit-recorder.service';

describe('AdmissionService', () => {
  const createService = () => {
    const platformState = new PlatformStateService();
    const auditRecorder = new AuditRecorderService(platformState);
    const store = new AdmissionStoreService(platformState);
    const service = new AdmissionService(
      store,
      new SearchService(),
      new FilteringService(),
      new SortingService(),
      new PaginationService(),
      auditRecorder,
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

  it('creates cycles and programmes', () => {
    const { platformState, service } = createService();
    const tenant = platformState.getTenantBySlug('miami-academy');
    const initialCycles = service.listCycles(tenant!.id).items.length;
    const initialProgrammes = service.listProgrammes(tenant!.id).items.length;

    const cycle = service.createCycle(tenant!.id, null, {
      academicYear: '2026/2027',
      name: '2026 Intake',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      status: 'open',
    });
    const programme = service.createProgramme(tenant!.id, null, {
      code: 'ENG-2026',
      name: 'Engineering',
      level: 'tertiary',
      capacity: 75,
      active: true,
    });

    expect(cycle.academicYear).toBe('2026/2027');
    expect(cycle.status).toBe('open');
    expect(programme.code).toBe('ENG-2026');
    expect(programme.active).toBe(true);
    expect(service.listCycles(tenant!.id).items.length).toBe(initialCycles + 1);
    expect(service.listProgrammes(tenant!.id).items.length).toBe(initialProgrammes + 1);
  });

  it('updates cycles and programmes', () => {
    const { platformState, service } = createService();
    const tenant = platformState.getTenantBySlug('miami-academy');
    const cycle = service.listCycles(tenant!.id).items[0];
    const programme = service.listProgrammes(tenant!.id).items[0];

    expect(cycle).toBeDefined();
    expect(programme).toBeDefined();

    const updatedCycle = service.updateCycle(tenant!.id, null, cycle!.id, {
      name: 'Updated Admission Cycle',
      status: 'closed',
    });
    const updatedProgramme = service.updateProgramme(tenant!.id, null, programme!.id, {
      code: 'SCI-UPDATED',
      name: 'Updated Science',
      level: 'tertiary',
      capacity: 150,
      active: false,
    });

    expect(updatedCycle.name).toBe('Updated Admission Cycle');
    expect(updatedCycle.status).toBe('closed');
    expect(updatedProgramme.code).toBe('SCI-UPDATED');
    expect(updatedProgramme.name).toBe('Updated Science');
    expect(updatedProgramme.level).toBe('tertiary');
    expect(updatedProgramme.capacity).toBe(150);
    expect(updatedProgramme.active).toBe(false);
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
