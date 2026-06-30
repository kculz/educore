import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdmissionGuardianDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  relationship!: string;

  @ApiPropertyOptional({ nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ nullable: true })
  phoneNumber!: string | null;
}

export class AdmissionApplicantDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiPropertyOptional({ nullable: true })
  otherNames!: string | null;

  @ApiPropertyOptional({ nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ nullable: true })
  phoneNumber!: string | null;

  @ApiPropertyOptional({ nullable: true })
  dateOfBirth!: string | null;

  @ApiPropertyOptional({ nullable: true })
  gender!: string | null;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ type: AdmissionGuardianDto, nullable: true })
  guardian!: AdmissionGuardianDto | null;

  @ApiPropertyOptional({ nullable: true })
  deletedAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class AdmissionCycleDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  academicYear!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  startDate!: string;

  @ApiPropertyOptional({ nullable: true })
  endDate!: string | null;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class AdmissionProgrammeDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  level!: string;

  @ApiProperty()
  capacity!: number;

  @ApiProperty()
  active!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class AdmissionApplicationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  applicantId!: string;

  @ApiProperty()
  cycleId!: string;

  @ApiProperty()
  programmeId!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  applicantName!: string;

  @ApiProperty()
  cycleName!: string;

  @ApiProperty()
  programmeName!: string;

  @ApiPropertyOptional({ nullable: true })
  submissionNotes!: string | null;

  @ApiPropertyOptional({ nullable: true })
  submittedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  interviewScheduledAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  interviewAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  interviewLocation!: string | null;

  @ApiPropertyOptional({ nullable: true })
  interviewer!: string | null;

  @ApiPropertyOptional({ nullable: true })
  interviewNotes!: string | null;

  @ApiPropertyOptional({ nullable: true })
  approvedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  rejectedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  rejectionReason!: string | null;

  @ApiPropertyOptional({ nullable: true })
  offeredAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  offerExpiresAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  acceptedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  enrolledAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  studentNumber!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class AdmissionDashboardDto {
  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  tenantName!: string;

  @ApiPropertyOptional({ nullable: true })
  activeCycleName!: string | null;

  @ApiProperty()
  applicants!: number;

  @ApiProperty()
  applications!: number;

  @ApiProperty()
  submittedApplications!: number;

  @ApiProperty()
  interviewScheduled!: number;

  @ApiProperty()
  approved!: number;

  @ApiProperty()
  offered!: number;

  @ApiProperty()
  accepted!: number;

  @ApiProperty()
  enrolled!: number;

  @ApiProperty()
  openCycles!: number;

  @ApiProperty()
  programmes!: number;

  @ApiProperty()
  acceptanceRate!: number;
}

