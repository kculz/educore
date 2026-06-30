import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { AccessScope } from '../../../core/platform-access/platform-access.decorator';
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
import type { UpdateApplicantDto } from './dto/update-applicant.dto';

type RequestWithContext = Request & {
  platformContext?: {
    tenantId: string;
  };
  user?: {
    sub: string;
  };
};

@ApiTags('Admission')
@ApiBearerAuth()
@Controller({ path: 'admission', version: '1' })
@AccessScope({ productCode: 'admission', permission: 'admission.read' })
export class AdmissionController {
  constructor(@Inject(AdmissionService) private readonly admissionService: AdmissionService) {}

  @Get('dashboard')
  @ApiOkResponse({ type: AdmissionDashboardDto })
  dashboard(@Req() request: RequestWithContext) {
    return this.admissionService.dashboard(this.tenantId(request));
  }

  @Get('cycles')
  @ApiOkResponse({ type: AdmissionCycleDto, isArray: true })
  listCycles(@Req() request: RequestWithContext, @Query() query: ListAdmissionQueryDto) {
    return this.admissionService.listCycles(this.tenantId(request), query);
  }

  @Get('programmes')
  @ApiOkResponse({ type: AdmissionProgrammeDto, isArray: true })
  listProgrammes(@Req() request: RequestWithContext, @Query() query: ListAdmissionQueryDto) {
    return this.admissionService.listProgrammes(this.tenantId(request), query);
  }

  @Get('applicants')
  @ApiOkResponse({ type: AdmissionApplicantDto, isArray: true })
  listApplicants(@Req() request: RequestWithContext, @Query() query: ListAdmissionQueryDto) {
    return this.admissionService.listApplicants(this.tenantId(request), query);
  }

  @Get('applicants/:id')
  @ApiOkResponse({ type: AdmissionApplicantDto })
  getApplicant(@Req() request: RequestWithContext, @Param('id') id: string) {
    return this.admissionService.getApplicant(this.tenantId(request), id);
  }

  @Post('applicants')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Create an applicant' })
  @ApiOkResponse({ type: AdmissionApplicantDto })
  createApplicant(@Req() request: RequestWithContext, @Body() dto: CreateApplicantDto) {
    return this.admissionService.createApplicant(this.tenantId(request), this.actorUserId(request), dto);
  }

  @Patch('applicants/:id')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Update an applicant' })
  @ApiOkResponse({ type: AdmissionApplicantDto })
  updateApplicant(@Req() request: RequestWithContext, @Param('id') id: string, @Body() dto: UpdateApplicantDto) {
    return this.admissionService.updateApplicant(this.tenantId(request), this.actorUserId(request), id, dto);
  }

  @Delete('applicants/:id')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Withdraw an applicant' })
  @ApiOkResponse({ type: AdmissionApplicantDto })
  deleteApplicant(@Req() request: RequestWithContext, @Param('id') id: string) {
    return this.admissionService.deleteApplicant(this.tenantId(request), this.actorUserId(request), id);
  }

  @Get('applications')
  @ApiOkResponse({ type: AdmissionApplicationDto, isArray: true })
  listApplications(@Req() request: RequestWithContext, @Query() query: ListAdmissionQueryDto) {
    return this.admissionService.listApplications(this.tenantId(request), query);
  }

  @Get('applications/:id')
  @ApiOkResponse({ type: AdmissionApplicationDto })
  getApplication(@Req() request: RequestWithContext, @Param('id') id: string) {
    return this.admissionService.getApplication(this.tenantId(request), id);
  }

  @Post('applications')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Create an application' })
  @ApiOkResponse({ type: AdmissionApplicationDto })
  createApplication(@Req() request: RequestWithContext, @Body() dto: CreateApplicationDto) {
    return this.admissionService.createApplication(this.tenantId(request), this.actorUserId(request), dto);
  }

  @Post('applications/:id/submit')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Submit an application' })
  @ApiOkResponse({ type: AdmissionApplicationDto })
  submitApplication(@Req() request: RequestWithContext, @Param('id') id: string) {
    return this.admissionService.submitApplication(this.tenantId(request), this.actorUserId(request), id);
  }

  @Post('applications/:id/schedule-interview')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Schedule an interview' })
  @ApiOkResponse({ type: AdmissionApplicationDto })
  scheduleInterview(
    @Req() request: RequestWithContext,
    @Param('id') id: string,
    @Body() dto: ScheduleInterviewDto,
  ) {
    return this.admissionService.scheduleInterview(this.tenantId(request), this.actorUserId(request), id, dto);
  }

  @Post('applications/:id/approve')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Approve an application' })
  @ApiOkResponse({ type: AdmissionApplicationDto })
  approveApplication(@Req() request: RequestWithContext, @Param('id') id: string) {
    return this.admissionService.approveApplication(this.tenantId(request), this.actorUserId(request), id);
  }

  @Post('applications/:id/reject')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Reject an application' })
  @ApiOkResponse({ type: AdmissionApplicationDto })
  rejectApplication(
    @Req() request: RequestWithContext,
    @Param('id') id: string,
    @Body() dto: RejectApplicationDto,
  ) {
    return this.admissionService.rejectApplication(this.tenantId(request), this.actorUserId(request), id, dto);
  }

  @Post('applications/:id/offer')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Offer admission' })
  @ApiOkResponse({ type: AdmissionApplicationDto })
  offerAdmission(
    @Req() request: RequestWithContext,
    @Param('id') id: string,
    @Body() dto: OfferAdmissionDto,
  ) {
    return this.admissionService.offerAdmission(this.tenantId(request), this.actorUserId(request), id, dto);
  }

  @Post('applications/:id/accept')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Accept admission offer' })
  @ApiOkResponse({ type: AdmissionApplicationDto })
  acceptOffer(@Req() request: RequestWithContext, @Param('id') id: string) {
    return this.admissionService.acceptOffer(this.tenantId(request), this.actorUserId(request), id);
  }

  @Post('applications/:id/enroll')
  @AccessScope({ productCode: 'admission', permission: 'admission.write' })
  @ApiOperation({ summary: 'Enroll the student' })
  @ApiOkResponse({ type: AdmissionApplicationDto })
  enrollStudent(
    @Req() request: RequestWithContext,
    @Param('id') id: string,
    @Body() dto: EnrollStudentDto,
  ) {
    return this.admissionService.enrollStudent(this.tenantId(request), this.actorUserId(request), id, dto);
  }

  private tenantId(request: RequestWithContext) {
    return request.platformContext?.tenantId ?? request.header('x-tenant-id') ?? '';
  }

  private actorUserId(request: RequestWithContext) {
    return request.user?.sub ?? null;
  }
}
