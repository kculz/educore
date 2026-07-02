import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { PlatformStateService } from '../../../core/platform-state/platform-state.service';
import type {
  AdmissionApplicant,
  AdmissionApplication,
  AdmissionCycle,
  AdmissionDashboardSummary,
  AdmissionGuardian,
  AdmissionProgramme,
} from '../domain/admission.types';
import type { CreateApplicantDto } from '../api/dto/create-applicant.dto';
import type { CreateApplicationDto } from '../api/dto/create-application.dto';
import type { CreateGuardianDto } from '../api/dto/create-guardian.dto';
import type { EnrollStudentDto } from '../api/dto/enroll-student.dto';
import type { OfferAdmissionDto } from '../api/dto/offer-admission.dto';
import type { RejectApplicationDto } from '../api/dto/reject-application.dto';
import type { ScheduleInterviewDto } from '../api/dto/schedule-interview.dto';
import type { UpdateApplicantDto } from '../api/dto/update-applicant.dto';
import type { UpdateApplicationDto } from '../api/dto/update-application.dto';

function now() {
  return new Date().toISOString();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

@Injectable()
export class AdmissionStoreService {
  private readonly seededTenants = new Set<string>();
  private readonly cycles = new Map<string, AdmissionCycle>();
  private readonly programmes = new Map<string, AdmissionProgramme>();
  private readonly applicants = new Map<string, AdmissionApplicant>();
  private readonly applications = new Map<string, AdmissionApplication>();

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
    const cycle: AdmissionCycle = {
      id: randomUUID(),
      tenantId,
      academicYear: `${year}/${year + 1}`,
      name: `${tenant.name} Admission ${year}`,
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      status: 'open',
      createdAt: now(),
      updatedAt: now(),
    };
    this.cycles.set(cycle.id, cycle);

    const seedProgrammes: Array<Pick<AdmissionProgramme, 'code' | 'name' | 'level' | 'capacity'>> = [
      { code: 'SCI', name: 'General Science', level: 'secondary', capacity: 120 },
      { code: 'BUS', name: 'Business Studies', level: 'secondary', capacity: 90 },
      { code: 'ART', name: 'Arts and Humanities', level: 'secondary', capacity: 80 },
    ];

    for (const programme of seedProgrammes) {
      const record: AdmissionProgramme = {
        id: randomUUID(),
        tenantId,
        code: `${programme.code}-${year}`,
        name: programme.name,
        level: programme.level,
        capacity: programme.capacity,
        active: true,
        createdAt: now(),
        updatedAt: now(),
      };
      this.programmes.set(record.id, record);
    }

    this.seededTenants.add(tenantId);
  }

  listCycles(tenantId: string) {
    this.ensureTenantSeed(tenantId);
    return this.collectByTenant(this.cycles, tenantId);
  }

  listProgrammes(tenantId: string) {
    this.ensureTenantSeed(tenantId);
    return this.collectByTenant(this.programmes, tenantId);
  }

  listApplicants(tenantId: string) {
    this.ensureTenantSeed(tenantId);
    return this.collectByTenant(this.applicants, tenantId);
  }

  getApplicant(tenantId: string, applicantId: string) {
    this.ensureTenantSeed(tenantId);
    const applicant = this.applicants.get(applicantId);
    this.assertTenantScopedRecord(applicant, tenantId, 'Applicant not found');
    return clone(applicant);
  }

  createApplicant(tenantId: string, input: CreateApplicantDto) {
    this.ensureTenantSeed(tenantId);
    this.assertApplicantEmailAvailable(tenantId, input.email ?? null);
    const guardian = input.guardian ? this.buildGuardian(tenantId, input.guardian) : null;
    const applicant: AdmissionApplicant = {
      id: randomUUID(),
      tenantId,
      firstName: input.firstName,
      lastName: input.lastName,
      otherNames: input.otherNames ?? null,
      email: input.email ?? null,
      phoneNumber: input.phoneNumber ?? null,
      dateOfBirth: input.dateOfBirth ?? null,
      gender: input.gender ?? null,
      status: 'draft',
      guardian,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    };
    if (guardian) {
      guardian.applicantId = applicant.id;
    }
    this.applicants.set(applicant.id, applicant);
    return clone(applicant);
  }

  updateApplicant(tenantId: string, applicantId: string, input: UpdateApplicantDto) {
    this.ensureTenantSeed(tenantId);
    const applicant = this.mustGetApplicant(tenantId, applicantId);
    if (input.email !== undefined && input.email !== applicant.email) {
      this.assertApplicantEmailAvailable(tenantId, input.email ?? null, applicantId);
    }

    if (input.firstName !== undefined) applicant.firstName = input.firstName;
    if (input.lastName !== undefined) applicant.lastName = input.lastName;
    if (input.otherNames !== undefined) applicant.otherNames = input.otherNames ?? null;
    if (input.email !== undefined) applicant.email = input.email ?? null;
    if (input.phoneNumber !== undefined) applicant.phoneNumber = input.phoneNumber ?? null;
    if (input.dateOfBirth !== undefined) applicant.dateOfBirth = input.dateOfBirth ?? null;
    if (input.gender !== undefined) applicant.gender = input.gender ?? null;
    if (input.status !== undefined) applicant.status = input.status;
    if (input.guardian !== undefined) {
      applicant.guardian = input.guardian ? this.buildGuardian(tenantId, input.guardian, applicant.id) : null;
    }

    applicant.updatedAt = now();
    this.applicants.set(applicant.id, applicant);
    return clone(applicant);
  }

  deleteApplicant(tenantId: string, applicantId: string) {
    const applicant = this.mustGetApplicant(tenantId, applicantId);
    applicant.status = 'withdrawn';
    applicant.deletedAt = now();
    applicant.updatedAt = now();
    this.applicants.set(applicant.id, applicant);
    return clone(applicant);
  }

  listApplications(tenantId: string) {
    this.ensureTenantSeed(tenantId);
    return this.collectByTenant(this.applications, tenantId);
  }

  getApplication(tenantId: string, applicationId: string) {
    this.ensureTenantSeed(tenantId);
    const application = this.applications.get(applicationId);
    this.assertTenantScopedRecord(application, tenantId, 'Application not found');
    return clone(application);
  }

  createApplication(tenantId: string, input: CreateApplicationDto) {
    this.ensureTenantSeed(tenantId);
    const applicant = this.mustGetApplicant(tenantId, input.applicantId);
    if (applicant.deletedAt) {
      throw new ConflictException('Applicant has been withdrawn');
    }

    const programme = this.mustGetProgramme(tenantId, input.programmeId);
    const cycle = input.cycleId ? this.mustGetCycle(tenantId, input.cycleId) : this.getOpenCycle(tenantId);
    this.assertApplicationCombinationAvailable(tenantId, applicant.id, cycle.id, programme.id);

    const application: AdmissionApplication = {
      id: randomUUID(),
      tenantId,
      applicantId: applicant.id,
      cycleId: cycle.id,
      programmeId: programme.id,
      status: 'draft',
      submissionNotes: input.submissionNotes ?? null,
      submittedAt: null,
      interviewScheduledAt: null,
      interviewAt: null,
      interviewLocation: null,
      interviewer: null,
      interviewNotes: null,
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: null,
      offeredAt: null,
      offerExpiresAt: null,
      acceptedAt: null,
      enrolledAt: null,
      studentNumber: null,
      createdAt: now(),
      updatedAt: now(),
    };
    this.applications.set(application.id, application);
    return clone(application);
  }

  updateApplication(tenantId: string, applicationId: string, input: UpdateApplicationDto) {
    this.ensureTenantSeed(tenantId);
    const application = this.mustGetApplication(tenantId, applicationId);
    if (application.status !== 'draft') {
      throw new ConflictException('Only draft applications can be edited');
    }

    const applicantId = input.applicantId ?? application.applicantId;
    const programmeId = input.programmeId ?? application.programmeId;
    const cycleId = input.cycleId ?? application.cycleId;

    const applicant = this.mustGetApplicant(tenantId, applicantId);
    if (applicant.deletedAt) {
      throw new ConflictException('Applicant has been withdrawn');
    }
    this.mustGetProgramme(tenantId, programmeId);
    this.mustGetCycle(tenantId, cycleId);
    this.assertApplicationCombinationAvailable(tenantId, applicantId, cycleId, programmeId, application.id);

    if (input.applicantId !== undefined) {
      application.applicantId = applicantId;
    }
    if (input.programmeId !== undefined) {
      application.programmeId = programmeId;
    }
    if (input.cycleId !== undefined) {
      application.cycleId = cycleId;
    }
    if (input.submissionNotes !== undefined) {
      application.submissionNotes = input.submissionNotes ?? null;
    }

    application.updatedAt = now();
    this.applications.set(application.id, application);
    return clone(application);
  }

  submitApplication(tenantId: string, applicationId: string) {
    const application = this.mustGetApplication(tenantId, applicationId);
    if (application.status !== 'draft') {
      throw new ConflictException('Only draft applications can be submitted');
    }

    application.status = 'submitted';
    application.submittedAt = now();
    application.updatedAt = now();
    this.applications.set(application.id, application);
    return clone(application);
  }

  scheduleInterview(tenantId: string, applicationId: string, input: ScheduleInterviewDto) {
    const application = this.mustGetApplication(tenantId, applicationId);
    if (application.status === 'rejected' || application.status === 'enrolled') {
      throw new ConflictException('This application can no longer be scheduled for interview');
    }

    application.status = 'interview_scheduled';
    application.interviewScheduledAt = now();
    application.interviewAt = input.scheduledAt;
    application.interviewLocation = input.location;
    application.interviewer = input.interviewer;
    application.interviewNotes = input.notes ?? null;
    application.updatedAt = now();
    this.applications.set(application.id, application);
    return clone(application);
  }

  approveApplication(tenantId: string, applicationId: string) {
    const application = this.mustGetApplication(tenantId, applicationId);
    application.status = 'approved';
    application.approvedAt = now();
    application.updatedAt = now();
    this.applications.set(application.id, application);
    return clone(application);
  }

  rejectApplication(tenantId: string, applicationId: string, input: RejectApplicationDto) {
    const application = this.mustGetApplication(tenantId, applicationId);
    application.status = 'rejected';
    application.rejectedAt = now();
    application.rejectionReason = input.reason;
    application.updatedAt = now();
    this.applications.set(application.id, application);
    return clone(application);
  }

  offerAdmission(tenantId: string, applicationId: string, input: OfferAdmissionDto) {
    const application = this.mustGetApplication(tenantId, applicationId);
    application.status = 'offered';
    application.offeredAt = now();
    application.offerExpiresAt = input.offerExpiresAt ?? null;
    application.updatedAt = now();
    this.applications.set(application.id, application);
    return clone(application);
  }

  acceptOffer(tenantId: string, applicationId: string) {
    const application = this.mustGetApplication(tenantId, applicationId);
    if (application.status !== 'offered') {
      throw new ConflictException('Only offered applications can be accepted');
    }

    application.status = 'accepted';
    application.acceptedAt = now();
    application.updatedAt = now();
    this.applications.set(application.id, application);
    return clone(application);
  }

  enrollStudent(tenantId: string, applicationId: string, input: EnrollStudentDto) {
    const application = this.mustGetApplication(tenantId, applicationId);
    if (!['accepted', 'offered', 'approved'].includes(application.status)) {
      throw new ConflictException('Only approved or offered applications can be enrolled');
    }

    application.status = 'enrolled';
    application.enrolledAt = now();
    application.studentNumber = input.studentNumber ?? this.generateStudentNumber(tenantId);
    application.updatedAt = now();
    this.applications.set(application.id, application);
    const applicant = this.mustGetApplicant(tenantId, application.applicantId);
    applicant.status = 'enrolled';
    applicant.updatedAt = now();
    this.applicants.set(applicant.id, applicant);
    return clone(application);
  }

  getDashboardSummary(tenantId: string): AdmissionDashboardSummary {
    this.ensureTenantSeed(tenantId);
    const tenant = this.platformState.getTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const applicants = this.listApplicants(tenantId);
    const applications = this.listApplications(tenantId);
    const cycles = this.listCycles(tenantId);
    const programmes = this.listProgrammes(tenantId);

    const submittedApplications = applications.filter((application) => application.status !== 'draft').length;
    const interviewScheduled = applications.filter((application) => application.status === 'interview_scheduled').length;
    const approved = applications.filter((application) => application.status === 'approved').length;
    const offered = applications.filter((application) => application.status === 'offered').length;
    const accepted = applications.filter((application) => application.status === 'accepted').length;
    const enrolled = applications.filter((application) => application.status === 'enrolled').length;

    return {
      tenantId,
      tenantName: tenant.name,
      activeCycleName: cycles.find((cycle) => cycle.status === 'open')?.name ?? null,
      applicants: applicants.filter((applicant) => applicant.status !== 'withdrawn').length,
      applications: applications.length,
      submittedApplications,
      interviewScheduled,
      approved,
      offered,
      accepted,
      enrolled,
      openCycles: cycles.filter((cycle) => cycle.status === 'open').length,
      programmes: programmes.filter((programme) => programme.active).length,
      acceptanceRate: submittedApplications === 0 ? 0 : Math.round((accepted / submittedApplications) * 100),
    };
  }

  getCycle(tenantId: string, cycleId: string) {
    this.ensureTenantSeed(tenantId);
    const cycle = this.cycles.get(cycleId);
    this.assertTenantScopedRecord(cycle, tenantId, 'Cycle not found');
    return clone(cycle);
  }

  getProgramme(tenantId: string, programmeId: string) {
    this.ensureTenantSeed(tenantId);
    const programme = this.programmes.get(programmeId);
    this.assertTenantScopedRecord(programme, tenantId, 'Programme not found');
    return clone(programme);
  }

  getApplicationView(tenantId: string, applicationId: string) {
    const application = this.getApplication(tenantId, applicationId);
    return this.toApplicationView(application);
  }

  listApplicantViews(tenantId: string) {
    return this.listApplicants(tenantId).map((applicant) => this.toApplicantView(applicant));
  }

  listApplicationViews(tenantId: string) {
    return this.listApplications(tenantId).map((application) => this.toApplicationView(application));
  }

  listCycleViews(tenantId: string) {
    return this.listCycles(tenantId);
  }

  listProgrammeViews(tenantId: string) {
    return this.listProgrammes(tenantId);
  }

  toApplicantView(applicant: AdmissionApplicant) {
    const guardianName = applicant.guardian?.fullName ?? null;
    return {
      ...applicant,
      fullName: this.buildFullName(applicant.firstName, applicant.otherNames, applicant.lastName),
      guardianName,
    };
  }

  toApplicationView(application: AdmissionApplication) {
    const applicant = this.mustGetApplicant(application.tenantId, application.applicantId);
    const cycle = this.mustGetCycle(application.tenantId, application.cycleId);
    const programme = this.mustGetProgramme(application.tenantId, application.programmeId);
    return {
      ...application,
      applicantName: this.buildFullName(applicant.firstName, applicant.otherNames, applicant.lastName),
      cycleName: cycle.name,
      programmeName: programme.name,
    };
  }

  private buildFullName(firstName: string, otherNames: string | null, lastName: string) {
    return [firstName, otherNames, lastName].filter(Boolean).join(' ');
  }

  private buildGuardian(tenantId: string, input: CreateGuardianDto, applicantId: string | null = null): AdmissionGuardian {
    return {
      id: randomUUID(),
      tenantId,
      applicantId: applicantId ?? '',
      fullName: input.fullName,
      relationship: input.relationship,
      email: input.email ?? null,
      phoneNumber: input.phoneNumber ?? null,
      createdAt: now(),
      updatedAt: now(),
    };
  }

  private generateStudentNumber(tenantId: string) {
    const tenant = this.platformState.getTenantById(tenantId);
    const prefix = tenant?.slug.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 6) || 'EDU';
    const count = this.listApplications(tenantId).filter((application) => application.status === 'enrolled').length + 1;
    return `${prefix}-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
  }

  private getOpenCycle(tenantId: string) {
    const cycles = this.listCycles(tenantId);
    return cycles.find((cycle) => cycle.status === 'open') ?? cycles[0] ?? this.mustGetCycle(tenantId, '');
  }

  private mustGetApplicant(tenantId: string, applicantId: string) {
    const applicant = this.applicants.get(applicantId);
    this.assertTenantScopedRecord(applicant, tenantId, 'Applicant not found');
    return applicant;
  }

  private mustGetApplication(tenantId: string, applicationId: string) {
    const application = this.applications.get(applicationId);
    this.assertTenantScopedRecord(application, tenantId, 'Application not found');
    return application;
  }

  private mustGetCycle(tenantId: string, cycleId: string) {
    const cycle = this.cycles.get(cycleId);
    this.assertTenantScopedRecord(cycle, tenantId, 'Cycle not found');
    return cycle;
  }

  private mustGetProgramme(tenantId: string, programmeId: string) {
    const programme = this.programmes.get(programmeId);
    this.assertTenantScopedRecord(programme, tenantId, 'Programme not found');
    return programme;
  }

  private assertApplicantEmailAvailable(tenantId: string, email: string | null, applicantId?: string) {
    if (!email) {
      return;
    }

    const normalized = email.toLowerCase();
    const duplicate = Array.from(this.applicants.values()).find((candidate) => {
      if (candidate.tenantId !== tenantId) {
        return false;
      }

      if (applicantId && candidate.id === applicantId) {
        return false;
      }

      return candidate.deletedAt === null && candidate.email?.toLowerCase() === normalized;
    });

    if (duplicate) {
      throw new ConflictException(`Applicant already exists with email: ${email}`);
    }
  }

  private collectByTenant<T extends { tenantId: string }>(collection: Map<string, T>, tenantId: string) {
    return Array.from(collection.values())
      .filter((entry) => entry.tenantId === tenantId)
      .map(clone);
  }

  private assertApplicationCombinationAvailable(
    tenantId: string,
    applicantId: string,
    cycleId: string,
    programmeId: string,
    applicationId?: string,
  ) {
    const duplicate = Array.from(this.applications.values()).find((candidate) => {
      if (candidate.tenantId !== tenantId) {
        return false;
      }

      if (applicationId && candidate.id === applicationId) {
        return false;
      }

      return (
        candidate.applicantId === applicantId &&
        candidate.cycleId === cycleId &&
        candidate.programmeId === programmeId &&
        candidate.status !== 'enrolled'
      );
    });

    if (duplicate) {
      throw new ConflictException('Application already exists for this applicant, programme, and cycle');
    }
  }

  private assertTenantScopedRecord<T extends { tenantId: string } | undefined | null>(
    record: T,
    tenantId: string,
    message: string,
  ): asserts record is T extends null | undefined ? never : T {
    if (!record || record.tenantId !== tenantId) {
      throw new NotFoundException(message);
    }
  }
}
