import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AccessScope } from '../../../core/platform-access/platform-access.decorator';
import {
  CurrentTenantId,
  CurrentUserId,
} from '../../../core/platform-access/platform-request.decorator';
import { AdmissionService } from '../application/admission.service';
import {
  AdmissionApplicantDto,
  AdmissionApplicationDto,
  AdmissionCycleDto,
  AdmissionDashboardDto,
  AdmissionProgrammeDto,
} from './dto/admission-response.dto';
import type { CreateApplicantDto } from './dto/create-applicant.dto';
import type { CreateApplicationDto } from './dto/create-application.dto';
import type { EnrollStudentDto } from './dto/enroll-student.dto';
import type { ListAdmissionQueryDto } from './dto/list-admission-query.dto';
import type { OfferAdmissionDto } from './dto/offer-admission.dto';
import type { RejectApplicationDto } from './dto/reject-application.dto';
import type { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import type { CreateCycleDto } from './dto/create-cycle.dto';
import type { CreateProgrammeDto } from './dto/create-programme.dto';
import type { UpdateApplicantDto } from './dto/update-applicant.dto';
import type { UpdateApplicationDto } from './dto/update-application.dto';
import type { UpdateCycleDto } from './dto/update-cycle.dto';
import type { UpdateProgrammeDto } from './dto/update-programme.dto';

@ApiTags('Admission')
@ApiBearerAuth()
@Controller({ path: 'admission', version: '1' })
@AccessScope({ productCode: 'admission', permission: 'admission.read' })
export class AdmissionController {
  constructor(@Inject(AdmissionService) private readonly admissionService: AdmissionService) {}

  @Get('dashboard')
  @ApiOkResponse({ type: AdmissionDashboardDto })
  dashboard(@CurrentTenantId() tenantId: string | null) {
    return this.admissionService.dashboard(tenantId ?? '');
  }

  @Get('cycles')
  @ApiOkResponse({ type: AdmissionCycleDto, isArray: true })
  listCycles(@CurrentTenantId() tenantId: string | null, @Query() query: ListAdmissionQueryDto) {
    return this.admissionService.listCycles(tenantId ?? '', query);
  }

  @Post('cycles')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Create a cycle' })
  @ApiOkResponse({ type: AdmissionCycleDto })
  createCycle(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Body() dto: CreateCycleDto,
  ) {
    return this.admissionService.createCycle(tenantId ?? '', actorUserId ?? null, dto);
  }

  @Patch('cycles/:id')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Update a cycle' })
  @ApiOkResponse({ type: AdmissionCycleDto })
  updateCycle(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
    @Body() dto: UpdateCycleDto,
  ) {
    return this.admissionService.updateCycle(tenantId ?? '', actorUserId ?? null, id, dto);
  }

  @Get('programmes')
  @ApiOkResponse({ type: AdmissionProgrammeDto, isArray: true })
  listProgrammes(@CurrentTenantId() tenantId: string | null, @Query() query: ListAdmissionQueryDto) {
    return this.admissionService.listProgrammes(tenantId ?? '', query);
  }

  @Post('programmes')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Create a programme' })
  @ApiOkResponse({ type: AdmissionProgrammeDto })
  createProgramme(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Body() dto: CreateProgrammeDto,
  ) {
    return this.admissionService.createProgramme(tenantId ?? '', actorUserId ?? null, dto);
  }

  @Patch('programmes/:id')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Update a programme' })
  @ApiOkResponse({ type: AdmissionProgrammeDto })
  updateProgramme(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
    @Body() dto: UpdateProgrammeDto,
  ) {
    return this.admissionService.updateProgramme(tenantId ?? '', actorUserId ?? null, id, dto);
  }

  @Get('applicants')
  @ApiOkResponse({ type: AdmissionApplicantDto, isArray: true })
  listApplicants(@CurrentTenantId() tenantId: string | null, @Query() query: ListAdmissionQueryDto) {
    return this.admissionService.listApplicants(tenantId ?? '', query);
  }

  @Get('applicants/:id')
  @ApiOkResponse({ type: AdmissionApplicantDto })
  getApplicant(@CurrentTenantId() tenantId: string | null, @Param('id') id: string) {
    return this.admissionService.getApplicant(tenantId ?? '', id);
  }

  @Post('applicants')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Create an applicant' })
  @ApiOkResponse({ type: AdmissionApplicantDto })
  createApplicant(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Body() dto: CreateApplicantDto,
  ) {
    return this.admissionService.createApplicant(tenantId ?? '', actorUserId ?? null, dto);
  }

  @Patch('applicants/:id')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Update an applicant' })
  @ApiOkResponse({ type: AdmissionApplicantDto })
  updateApplicant(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
    @Body() dto: UpdateApplicantDto,
  ) {
    return this.admissionService.updateApplicant(tenantId ?? '', actorUserId ?? null, id, dto);
  }

  @Delete('applicants/:id')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Withdraw an applicant' })
  @ApiOkResponse({ type: AdmissionApplicantDto })
  deleteApplicant(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
  ) {
    return this.admissionService.deleteApplicant(tenantId ?? '', actorUserId ?? null, id);
  }

  @Get('applications')
  @ApiOkResponse({ type: AdmissionApplicationDto, isArray: true })
  listApplications(@CurrentTenantId() tenantId: string | null, @Query() query: ListAdmissionQueryDto) {
    return this.admissionService.listApplications(tenantId ?? '', query);
  }

  @Get('applications/:id')
  @ApiOkResponse({ type: AdmissionApplicationDto })
  getApplication(@CurrentTenantId() tenantId: string | null, @Param('id') id: string) {
    return this.admissionService.getApplication(tenantId ?? '', id);
  }

  @Post('applications')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Create an application' })
  @ApiOkResponse({ type: AdmissionApplicationDto })
  createApplication(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.admissionService.createApplication(tenantId ?? '', actorUserId ?? null, dto);
  }

  @Patch('applications/:id')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Update a draft application' })
  @ApiOkResponse({ type: AdmissionApplicationDto })
  updateApplication(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.admissionService.updateApplication(tenantId ?? '', actorUserId ?? null, id, dto);
  }

  @Post('applications/:id/submit')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Submit an application' })
  @ApiOkResponse({ type: AdmissionApplicationDto })
  submitApplication(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
  ) {
    return this.admissionService.submitApplication(tenantId ?? '', actorUserId ?? null, id);
  }

  @Post('applications/:id/schedule-interview')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Schedule an interview' })
  @ApiOkResponse({ type: AdmissionApplicationDto })
  scheduleInterview(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
    @Body() dto: ScheduleInterviewDto,
  ) {
    return this.admissionService.scheduleInterview(tenantId ?? '', actorUserId ?? null, id, dto);
  }

  @Post('applications/:id/approve')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Approve an application' })
  @ApiOkResponse({ type: AdmissionApplicationDto })
  approveApplication(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
  ) {
    return this.admissionService.approveApplication(tenantId ?? '', actorUserId ?? null, id);
  }

  @Post('applications/:id/reject')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Reject an application' })
  @ApiOkResponse({ type: AdmissionApplicationDto })
  rejectApplication(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
    @Body() dto: RejectApplicationDto,
  ) {
    return this.admissionService.rejectApplication(tenantId ?? '', actorUserId ?? null, id, dto);
  }

  @Post('applications/:id/offer')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Offer admission' })
  @ApiOkResponse({ type: AdmissionApplicationDto })
  offerAdmission(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
    @Body() dto: OfferAdmissionDto,
  ) {
    return this.admissionService.offerAdmission(tenantId ?? '', actorUserId ?? null, id, dto);
  }

  @Post('applications/:id/accept')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Accept admission offer' })
  @ApiOkResponse({ type: AdmissionApplicationDto })
  acceptOffer(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
  ) {
    return this.admissionService.acceptOffer(tenantId ?? '', actorUserId ?? null, id);
  }

  @Post('applications/:id/enroll')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Enroll the student' })
  @ApiOkResponse({ type: AdmissionApplicationDto })
  enrollStudent(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
    @Body() dto: EnrollStudentDto,
  ) {
    return this.admissionService.enrollStudent(tenantId ?? '', actorUserId ?? null, id, dto);
  }
}
