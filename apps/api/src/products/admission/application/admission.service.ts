import { Inject, Injectable } from '@nestjs/common';

import { FilteringService } from '../../../shared/query/filtering.service';
import { PaginationService } from '../../../shared/query/pagination.service';
import { SearchService } from '../../../shared/query/search.service';
import { SortingService } from '../../../shared/query/sorting.service';
import { PlatformStateService } from '../../../core/platform-state/platform-state.service';
import type { PaginatedResult } from '../../../shared/query/query.types';
import { AdmissionStoreService } from '../infrastructure/admission-store.service';
import type { AdmissionDashboardSummary } from '../domain/admission.types';
import type { CreateApplicantDto } from '../api/dto/create-applicant.dto';
import type { CreateApplicationDto } from '../api/dto/create-application.dto';
import type { EnrollStudentDto } from '../api/dto/enroll-student.dto';
import type { ListAdmissionQueryDto } from '../api/dto/list-admission-query.dto';
import type { OfferAdmissionDto } from '../api/dto/offer-admission.dto';
import type { RejectApplicationDto } from '../api/dto/reject-application.dto';
import type { ScheduleInterviewDto } from '../api/dto/schedule-interview.dto';
import type { UpdateApplicantDto } from '../api/dto/update-applicant.dto';
import type { UpdateApplicationDto } from '../api/dto/update-application.dto';
import type { UpdateCycleDto } from '../api/dto/update-cycle.dto';
import type { UpdateProgrammeDto } from '../api/dto/update-programme.dto';

@Injectable()
export class AdmissionService {
  constructor(
    @Inject(AdmissionStoreService) private readonly store: AdmissionStoreService,
    @Inject(SearchService) private readonly search: SearchService,
    @Inject(FilteringService) private readonly filtering: FilteringService,
    @Inject(SortingService) private readonly sorting: SortingService,
    @Inject(PaginationService) private readonly pagination: PaginationService,
    @Inject(PlatformStateService) private readonly platformState: PlatformStateService,
  ) {}

  dashboard(tenantId: string): AdmissionDashboardSummary {
    return this.store.getDashboardSummary(tenantId);
  }

  listCycles(tenantId: string, query: ListAdmissionQueryDto = {}) {
    return this.paginate(
      this.store.listCycleViews(tenantId),
      query,
      ['name', 'academicYear', 'status'],
      'createdAt',
    );
  }

  listProgrammes(tenantId: string, query: ListAdmissionQueryDto = {}) {
    return this.paginate(
      this.store.listProgrammeViews(tenantId),
      query,
      ['name', 'code', 'level'],
      'createdAt',
    );
  }

  updateCycle(tenantId: string, actorUserId: string | null, cycleId: string, dto: UpdateCycleDto) {
    const cycle = this.store.updateCycle(tenantId, cycleId, dto);
    this.recordAudit(tenantId, actorUserId, 'admission.cycle.updated', 'admission-cycle', {
      cycleId: cycle.id,
      status: cycle.status,
    });
    return this.store.getCycle(tenantId, cycle.id);
  }

  updateProgramme(tenantId: string, actorUserId: string | null, programmeId: string, dto: UpdateProgrammeDto) {
    const programme = this.store.updateProgramme(tenantId, programmeId, dto);
    this.recordAudit(tenantId, actorUserId, 'admission.programme.updated', 'admission-programme', {
      programmeId: programme.id,
      code: programme.code,
      active: programme.active,
    });
    return this.store.getProgramme(tenantId, programme.id);
  }

  listApplicants(tenantId: string, query: ListAdmissionQueryDto = {}) {
    return this.paginate(
      this.store.listApplicantViews(tenantId),
      query,
      ['fullName', 'email', 'phoneNumber', 'guardianName'],
      'updatedAt',
    );
  }

  getApplicant(tenantId: string, applicantId: string) {
    return this.store.toApplicantView(this.store.getApplicant(tenantId, applicantId));
  }

  createApplicant(tenantId: string, actorUserId: string | null, dto: CreateApplicantDto) {
    const applicant = this.store.createApplicant(tenantId, dto);
    this.recordAudit(tenantId, actorUserId, 'admission.applicant.created', 'admission-applicant', {
      applicantId: applicant.id,
      name: applicant.firstName,
    });
    return this.store.toApplicantView(applicant);
  }

  updateApplicant(tenantId: string, actorUserId: string | null, applicantId: string, dto: UpdateApplicantDto) {
    const applicant = this.store.updateApplicant(tenantId, applicantId, dto);
    this.recordAudit(tenantId, actorUserId, 'admission.applicant.updated', 'admission-applicant', {
      applicantId: applicant.id,
      status: applicant.status,
    });
    return this.store.toApplicantView(applicant);
  }

  deleteApplicant(tenantId: string, actorUserId: string | null, applicantId: string) {
    const applicant = this.store.deleteApplicant(tenantId, applicantId);
    this.recordAudit(tenantId, actorUserId, 'admission.applicant.withdrawn', 'admission-applicant', {
      applicantId: applicant.id,
    });
    return this.store.toApplicantView(applicant);
  }

  listApplications(tenantId: string, query: ListAdmissionQueryDto = {}) {
    return this.paginate(
      this.store.listApplicationViews(tenantId),
      query,
      ['applicantName', 'programmeName', 'cycleName', 'status', 'studentNumber'],
      'updatedAt',
      ['applicantId', 'cycleId', 'programmeId'],
    );
  }

  getApplication(tenantId: string, applicationId: string) {
    return this.store.getApplicationView(tenantId, applicationId);
  }

  createApplication(tenantId: string, actorUserId: string | null, dto: CreateApplicationDto) {
    const application = this.store.createApplication(tenantId, dto);
    this.recordAudit(tenantId, actorUserId, 'admission.application.created', 'admission-application', {
      applicationId: application.id,
      applicantId: application.applicantId,
    });
    return this.store.getApplicationView(tenantId, application.id);
  }

  updateApplication(tenantId: string, actorUserId: string | null, applicationId: string, dto: UpdateApplicationDto) {
    const application = this.store.updateApplication(tenantId, applicationId, dto);
    this.recordAudit(tenantId, actorUserId, 'admission.application.updated', 'admission-application', {
      applicationId: application.id,
      applicantId: application.applicantId,
      cycleId: application.cycleId,
      programmeId: application.programmeId,
    });
    return this.store.getApplicationView(tenantId, application.id);
  }

  submitApplication(tenantId: string, actorUserId: string | null, applicationId: string) {
    const application = this.store.submitApplication(tenantId, applicationId);
    this.recordAudit(tenantId, actorUserId, 'admission.application.submitted', 'admission-application', {
      applicationId: application.id,
    });
    return this.store.getApplicationView(tenantId, application.id);
  }

  scheduleInterview(
    tenantId: string,
    actorUserId: string | null,
    applicationId: string,
    dto: ScheduleInterviewDto,
  ) {
    const application = this.store.scheduleInterview(tenantId, applicationId, dto);
    this.recordAudit(tenantId, actorUserId, 'admission.application.interview_scheduled', 'admission-application', {
      applicationId: application.id,
      scheduledAt: dto.scheduledAt,
    });
    return this.store.getApplicationView(tenantId, application.id);
  }

  approveApplication(tenantId: string, actorUserId: string | null, applicationId: string) {
    const application = this.store.approveApplication(tenantId, applicationId);
    this.recordAudit(tenantId, actorUserId, 'admission.application.approved', 'admission-application', {
      applicationId: application.id,
    });
    return this.store.getApplicationView(tenantId, application.id);
  }

  rejectApplication(
    tenantId: string,
    actorUserId: string | null,
    applicationId: string,
    dto: RejectApplicationDto,
  ) {
    const application = this.store.rejectApplication(tenantId, applicationId, dto);
    this.recordAudit(tenantId, actorUserId, 'admission.application.rejected', 'admission-application', {
      applicationId: application.id,
      reason: dto.reason,
    });
    return this.store.getApplicationView(tenantId, application.id);
  }

  offerAdmission(
    tenantId: string,
    actorUserId: string | null,
    applicationId: string,
    dto: OfferAdmissionDto,
  ) {
    const application = this.store.offerAdmission(tenantId, applicationId, dto);
    this.recordAudit(tenantId, actorUserId, 'admission.application.offered', 'admission-application', {
      applicationId: application.id,
      offerExpiresAt: dto.offerExpiresAt ?? null,
    });
    return this.store.getApplicationView(tenantId, application.id);
  }

  acceptOffer(tenantId: string, actorUserId: string | null, applicationId: string) {
    const application = this.store.acceptOffer(tenantId, applicationId);
    this.recordAudit(tenantId, actorUserId, 'admission.application.accepted', 'admission-application', {
      applicationId: application.id,
    });
    return this.store.getApplicationView(tenantId, application.id);
  }

  enrollStudent(
    tenantId: string,
    actorUserId: string | null,
    applicationId: string,
    dto: EnrollStudentDto,
  ) {
    const application = this.store.enrollStudent(tenantId, applicationId, dto);
    this.recordAudit(tenantId, actorUserId, 'admission.application.enrolled', 'admission-application', {
      applicationId: application.id,
      studentNumber: application.studentNumber,
    });
    return this.store.getApplicationView(tenantId, application.id);
  }

  private paginate<T extends object>(
    items: T[],
    query: ListAdmissionQueryDto,
    searchFields: string[],
    defaultSortBy: string,
    extraFilters: string[] = [],
  ): PaginatedResult<T> {
    let result = [...items];
    result = this.search.search(result, query.q ?? '', searchFields);

    const filters: Record<string, unknown> = {};
    for (const key of extraFilters) {
      const value = query[key as keyof ListAdmissionQueryDto];
      if (value !== undefined && value !== null && value !== '') {
        filters[key] = value;
      }
    }

    if (query.status !== undefined && query.status !== null && query.status !== '') {
      filters.status = query.status;
    }
    if (query.applicantId !== undefined && query.applicantId !== null && query.applicantId !== '') {
      filters.applicantId = query.applicantId;
    }
    if (query.cycleId !== undefined && query.cycleId !== null && query.cycleId !== '') {
      filters.cycleId = query.cycleId;
    }
    if (query.programmeId !== undefined && query.programmeId !== null && query.programmeId !== '') {
      filters.programmeId = query.programmeId;
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
    this.platformState.recordAudit({
      tenantId,
      userId,
      action,
      resource,
      metadata,
    });
  }
}
