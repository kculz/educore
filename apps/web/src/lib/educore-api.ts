const DEFAULT_API_BASE_URL = 'http://localhost:3001/api/v1';

export const API_BASE_URL = ensureTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL);

export const ADMISSION_PRODUCT_CODE = 'admission';
export const PLATFORM_PRODUCT_CODE = 'platform';

export type AdmissionCycleStatus = 'draft' | 'open' | 'closed' | 'archived';

export type AdmissionGender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

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

export interface ApiTenant {
  id: string;
  slug: string;
  name: string;
  enabledProducts: string[];
  status: 'active' | 'suspended';
}

export interface ApiUser {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  status: 'active' | 'invited' | 'disabled';
  roleIds: string[];
  permissions: string[];
  lastLoginAt: string | null;
}

export interface ApiAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: ApiUser;
}

export interface ApiHealthResponse {
  status: 'ok';
  appName: string;
  env: string;
  timestamp: string;
  snapshot: {
    tenants: number;
    users: number;
    roles: number;
    permissions: number;
    products: number;
    licenses: number;
    featureFlags: number;
    audits: number;
    notifications: number;
    storageObjects: number;
    queueJobs: number;
    settings: number;
  };
}

export interface ApiPaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    offset: number;
  };
}

export interface AdmissionGuardian {
  id: string;
  fullName: string;
  relationship: string;
  email: string | null;
  phoneNumber: string | null;
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
  fullName: string;
  status: AdmissionApplicantStatus;
  guardian: AdmissionGuardian | null;
  guardianName: string | null;
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
  applicantName: string;
  cycleName: string;
  programmeName: string;
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

export interface AdmissionDashboard {
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

export interface AdmissionSession {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  accessToken: string;
  refreshToken: string;
  user: ApiUser;
}

export interface AdmissionQuery {
  q?: string;
  status?: string;
  applicantId?: string;
  cycleId?: string;
  programmeId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateGuardianInput {
  fullName: string;
  relationship: string;
  email?: string | null;
  phoneNumber?: string | null;
}

export interface CreateApplicantInput {
  firstName: string;
  lastName: string;
  otherNames?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  gender?: AdmissionGender | null;
  guardian?: CreateGuardianInput | null;
}

export interface UpdateApplicantInput extends Partial<CreateApplicantInput> {
  status?: AdmissionApplicantStatus;
}

export interface CreateCycleInput {
  academicYear: string;
  name: string;
  startDate: string;
  endDate?: string | null;
  status?: AdmissionCycleStatus;
}

export interface UpdateCycleInput extends Partial<CreateCycleInput> {}

export interface CreateProgrammeInput {
  code: string;
  name: string;
  level: string;
  capacity: number;
  active?: boolean;
}

export interface UpdateProgrammeInput extends Partial<CreateProgrammeInput> {}

export interface CreateApplicationInput {
  applicantId: string;
  programmeId: string;
  cycleId?: string | null;
  submissionNotes?: string | null;
}

export interface UpdateApplicationInput {
  applicantId?: string;
  programmeId?: string;
  cycleId?: string | null;
  submissionNotes?: string | null;
}

export interface ScheduleInterviewInput {
  scheduledAt: string;
  location: string;
  interviewer: string;
  notes?: string | null;
}

export interface RejectApplicationInput {
  reason: string;
}

export interface OfferAdmissionInput {
  offerExpiresAt?: string | null;
}

export interface EnrollStudentInput {
  studentNumber?: string | null;
}

export class EduCoreApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'EduCoreApiError';
    this.status = status;
  }
}

export async function getPublicTenants() {
  return requestJson<ApiTenant[]>('/auth/tenants', {
    productCode: PLATFORM_PRODUCT_CODE,
  });
}

export async function getApiHealth() {
  return requestJson<ApiHealthResponse>('/health', {
    productCode: PLATFORM_PRODUCT_CODE,
  });
}

export async function loginToPlatform(input: {
  tenantId: string;
  email: string;
  password: string;
}) {
  return requestJson<ApiAuthResponse>('/auth/login', {
    method: 'POST',
    productCode: PLATFORM_PRODUCT_CODE,
    tenantId: input.tenantId,
    body: JSON.stringify({
      email: input.email,
      password: input.password,
    }),
  });
}

export async function getAdmissionDashboard(session: AdmissionSession) {
  return requestJson<AdmissionDashboard>('/admission/dashboard', {
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
  });
}

export async function listAdmissionApplicants(session: AdmissionSession, query: AdmissionQuery = {}) {
  return requestJson<ApiPaginatedResponse<AdmissionApplicant>>('/admission/applicants', {
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
    query,
  });
}

export async function listAdmissionApplications(session: AdmissionSession, query: AdmissionQuery = {}) {
  return requestJson<ApiPaginatedResponse<AdmissionApplication>>('/admission/applications', {
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
    query,
  });
}

export async function listAdmissionCycles(session: AdmissionSession, query: AdmissionQuery = {}) {
  return requestJson<ApiPaginatedResponse<AdmissionCycle>>('/admission/cycles', {
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
    query,
  });
}

export async function createAdmissionCycle(session: AdmissionSession, input: CreateCycleInput) {
  return requestJson<AdmissionCycle>('/admission/cycles', {
    method: 'POST',
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
    body: JSON.stringify(input),
  });
}

export async function listAdmissionProgrammes(session: AdmissionSession, query: AdmissionQuery = {}) {
  return requestJson<ApiPaginatedResponse<AdmissionProgramme>>('/admission/programmes', {
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
    query,
  });
}

export async function createAdmissionProgramme(session: AdmissionSession, input: CreateProgrammeInput) {
  return requestJson<AdmissionProgramme>('/admission/programmes', {
    method: 'POST',
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
    body: JSON.stringify(input),
  });
}

export async function updateAdmissionCycle(
  session: AdmissionSession,
  cycleId: string,
  input: UpdateCycleInput,
) {
  return requestJson<AdmissionCycle>(`/admission/cycles/${cycleId}`, {
    method: 'PATCH',
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
    body: JSON.stringify(input),
  });
}

export async function updateAdmissionProgramme(
  session: AdmissionSession,
  programmeId: string,
  input: UpdateProgrammeInput,
) {
  return requestJson<AdmissionProgramme>(`/admission/programmes/${programmeId}`, {
    method: 'PATCH',
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
    body: JSON.stringify(input),
  });
}

export async function createAdmissionApplicant(session: AdmissionSession, input: CreateApplicantInput) {
  return requestJson<AdmissionApplicant>('/admission/applicants', {
    method: 'POST',
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
    body: JSON.stringify(input),
  });
}

export async function updateAdmissionApplicant(
  session: AdmissionSession,
  applicantId: string,
  input: UpdateApplicantInput,
) {
  return requestJson<AdmissionApplicant>(`/admission/applicants/${applicantId}`, {
    method: 'PATCH',
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
    body: JSON.stringify(input),
  });
}

export async function deleteAdmissionApplicant(session: AdmissionSession, applicantId: string) {
  return requestJson<AdmissionApplicant>(`/admission/applicants/${applicantId}`, {
    method: 'DELETE',
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
  });
}

export async function createAdmissionApplication(session: AdmissionSession, input: CreateApplicationInput) {
  return requestJson<AdmissionApplication>('/admission/applications', {
    method: 'POST',
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
    body: JSON.stringify(input),
  });
}

export async function updateAdmissionApplication(
  session: AdmissionSession,
  applicationId: string,
  input: UpdateApplicationInput,
) {
  return requestJson<AdmissionApplication>(`/admission/applications/${applicationId}`, {
    method: 'PATCH',
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
    body: JSON.stringify(input),
  });
}

export async function submitAdmissionApplication(session: AdmissionSession, applicationId: string) {
  return requestJson<AdmissionApplication>(`/admission/applications/${applicationId}/submit`, {
    method: 'POST',
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
  });
}

export async function scheduleAdmissionInterview(
  session: AdmissionSession,
  applicationId: string,
  input: ScheduleInterviewInput,
) {
  return requestJson<AdmissionApplication>(`/admission/applications/${applicationId}/schedule-interview`, {
    method: 'POST',
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
    body: JSON.stringify(input),
  });
}

export async function approveAdmissionApplication(session: AdmissionSession, applicationId: string) {
  return requestJson<AdmissionApplication>(`/admission/applications/${applicationId}/approve`, {
    method: 'POST',
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
  });
}

export async function rejectAdmissionApplication(
  session: AdmissionSession,
  applicationId: string,
  input: RejectApplicationInput,
) {
  return requestJson<AdmissionApplication>(`/admission/applications/${applicationId}/reject`, {
    method: 'POST',
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
    body: JSON.stringify(input),
  });
}

export async function offerAdmission(
  session: AdmissionSession,
  applicationId: string,
  input: OfferAdmissionInput,
) {
  return requestJson<AdmissionApplication>(`/admission/applications/${applicationId}/offer`, {
    method: 'POST',
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
    body: JSON.stringify(input),
  });
}

export async function acceptAdmissionOffer(session: AdmissionSession, applicationId: string) {
  return requestJson<AdmissionApplication>(`/admission/applications/${applicationId}/accept`, {
    method: 'POST',
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
  });
}

export async function enrollAdmissionStudent(
  session: AdmissionSession,
  applicationId: string,
  input: EnrollStudentInput,
) {
  return requestJson<AdmissionApplication>(`/admission/applications/${applicationId}/enroll`, {
    method: 'POST',
    tenantId: session.tenantId,
    token: session.accessToken,
    productCode: ADMISSION_PRODUCT_CODE,
    body: JSON.stringify(input),
  });
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  tenantId?: string;
  token?: string;
  productCode?: string;
  query?: AdmissionQuery | Record<string, string | number | boolean | null | undefined>;
  body?: BodyInit | null;
}

async function requestJson<T>(path: string, options: RequestOptions = {}) {
  const url = buildUrl(path, options.query);
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (options.body !== undefined && options.body !== null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }
  if (options.tenantId) {
    headers.set('x-tenant-id', options.tenantId);
  }
  if (options.productCode) {
    headers.set('x-product-code', options.productCode);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store',
    body: options.body,
  });

  if (!response.ok) {
    throw new EduCoreApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(normalizedPath, API_BASE_URL);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') {
        continue;
      }
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function readErrorMessage(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      const payload = (await response.json()) as { message?: unknown; error?: unknown };
      if (typeof payload.message === 'string') {
        return payload.message;
      }
      if (Array.isArray(payload.message)) {
        return payload.message.map(String).join(', ');
      }
      if (typeof payload.error === 'string') {
        return payload.error;
      }
    } catch {
      return response.statusText || 'Request failed';
    }
  }

  try {
    const text = await response.text();
    return text.trim() || response.statusText || 'Request failed';
  } catch {
    return response.statusText || 'Request failed';
  }
}

function ensureTrailingSlash(value: string) {
  return value.endsWith('/') ? value : `${value}/`;
}
