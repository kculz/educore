export type AdmissionCycleStatus = 'draft' | 'open' | 'closed' | 'archived';

export type AdmissionApplicantStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'offered'
  | 'accepted'
  | 'enrolled'
  | 'withdrawn';

export type AdmissionApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'interview_scheduled'
  | 'approved'
  | 'rejected'
  | 'offered'
  | 'accepted'
  | 'enrolled';

export type AdmissionGender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface AdmissionGuardian {
  id: string;
  tenantId: string;
  applicantId: string;
  fullName: string;
  relationship: string;
  email: string | null;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdmissionApplicant {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  otherNames: string | null;
  email: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  gender: AdmissionGender | null;
  status: AdmissionApplicantStatus;
  guardian: AdmissionGuardian | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdmissionCycle {
  id: string;
  tenantId: string;
  academicYear: string;
  name: string;
  startDate: string;
  endDate: string | null;
  status: AdmissionCycleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdmissionProgramme {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  level: string;
  capacity: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdmissionApplication {
  id: string;
  tenantId: string;
  applicantId: string;
  cycleId: string;
  programmeId: string;
  status: AdmissionApplicationStatus;
  submissionNotes: string | null;
  submittedAt: string | null;
  interviewScheduledAt: string | null;
  interviewAt: string | null;
  interviewLocation: string | null;
  interviewer: string | null;
  interviewNotes: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  offeredAt: string | null;
  offerExpiresAt: string | null;
  acceptedAt: string | null;
  enrolledAt: string | null;
  studentNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdmissionDocument {
  id: string;
  tenantId: string;
  applicantId: string;
  applicationId: string | null;
  name: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface AdmissionInterview {
  id: string;
  tenantId: string;
  applicationId: string;
  scheduledAt: string;
  location: string;
  interviewer: string;
  notes: string | null;
  createdAt: string;
}

export interface AdmissionOfferLetter {
  id: string;
  tenantId: string;
  applicationId: string;
  issuedAt: string;
  expiresAt: string | null;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
}

export interface AdmissionEnrollment {
  id: string;
  tenantId: string;
  applicationId: string;
  studentNumber: string;
  enrolledAt: string;
  status: 'active' | 'inactive';
}

export interface AdmissionDashboardSummary {
  tenantId: string;
  tenantName: string;
  activeCycleName: string | null;
  applicants: number;
  applications: number;
  submittedApplications: number;
  interviewScheduled: number;
  approved: number;
  offered: number;
  accepted: number;
  enrolled: number;
  openCycles: number;
  programmes: number;
  acceptanceRate: number;
}

