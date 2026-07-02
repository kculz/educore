'use client';

import Link from 'next/link';
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';

import {
  acceptAdmissionOffer,
  API_BASE_URL,
  approveAdmissionApplication,
  createAdmissionApplicant,
  createAdmissionApplication,
  deleteAdmissionApplicant,
  EduCoreApiError,
  enrollAdmissionStudent,
  getAdmissionDashboard,
  getApiHealth,
  getPublicTenants,
  createAdmissionCycle,
  createAdmissionProgramme,
  listAdmissionApplicants,
  listAdmissionApplications,
  listAdmissionCycles,
  listAdmissionProgrammes,
  loginToPlatform,
  offerAdmission,
  rejectAdmissionApplication,
  scheduleAdmissionInterview,
  submitAdmissionApplication,
  updateAdmissionApplicant,
  updateAdmissionApplication,
  updateAdmissionCycle,
  updateAdmissionProgramme,
  type AdmissionApplicant,
  type AdmissionApplicantStatus,
  type AdmissionApplication,
  type AdmissionApplicationStatus,
  type AdmissionCycle,
  type AdmissionCycleStatus,
  type AdmissionDashboard,
  type AdmissionGender,
  type AdmissionProgramme,
  type AdmissionSession,
  type ApiHealthResponse,
  type ApiPaginatedResponse,
  type ApiTenant,
  type CreateApplicantInput,
  type CreateCycleInput,
  type CreateProgrammeInput,
  type UpdateApplicationInput,
  type UpdateApplicantInput,
} from '@web/lib/educore-api';
import {
  badgeTone,
  formatDate,
  formatDateTime,
  formatNumber,
  statusLabel,
} from '@web/lib/formatters';
import {
  hasAnyText,
  optionalText,
  parsePositiveInteger,
  requiredText,
} from '@web/lib/form-values';
import { buildTenantPath } from '@web/lib/tenant-domains';
import styles from './admission-workspace.module.css';

const SESSION_KEY = 'educore.admission.session';
const LIST_LIMIT = 6;

const INITIAL_LOGIN = {
  tenantId: '',
  email: 'admin@educore.local',
  password: 'Password123!',
};

const INITIAL_QUERY = {
  applicantSearch: '',
  applicantPage: 1,
  applicationSearch: '',
  applicationStatus: '',
  applicationPage: 1,
};

const APPLICANT_STATUSES: AdmissionApplicantStatus[] = [
  'draft',
  'submitted',
  'approved',
  'rejected',
  'offered',
  'accepted',
  'enrolled',
  'withdrawn',
];

const INITIAL_APPLICANT_FORM: ApplicantFormState = {
  firstName: '',
  lastName: '',
  otherNames: '',
  email: '',
  phoneNumber: '',
  dateOfBirth: '',
  gender: '',
  guardianFullName: '',
  guardianRelationship: '',
  guardianEmail: '',
  guardianPhoneNumber: '',
  status: 'draft',
};

const INITIAL_APPLICATION_FORM = {
  applicantId: '',
  programmeId: '',
  cycleId: '',
  submissionNotes: '',
};

const INITIAL_CYCLE_FORM = {
  academicYear: '',
  name: '',
  startDate: '',
  endDate: '',
  status: 'draft' as AdmissionCycleStatus,
};

const INITIAL_PROGRAMME_FORM = {
  code: '',
  name: '',
  level: '',
  capacity: '',
  active: true,
};

const CYCLE_STATUSES: AdmissionCycleStatus[] = ['draft', 'open', 'closed', 'archived'];

const APPLICATION_STATUSES: Array<{ value: AdmissionApplicationStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'interview_scheduled', label: 'Interview scheduled' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'offered', label: 'Offered' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'enrolled', label: 'Enrolled' },
];

type WorkspaceQuery = typeof INITIAL_QUERY;
type LoginFormState = typeof INITIAL_LOGIN;
type ApplicationFormState = typeof INITIAL_APPLICATION_FORM;
type ApplicantFormMode = 'create' | 'edit';
type CycleFormState = typeof INITIAL_CYCLE_FORM;
type ProgrammeFormState = typeof INITIAL_PROGRAMME_FORM;

type ApplicantFormState = {
  firstName: string;
  lastName: string;
  otherNames: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: AdmissionGender | '';
  guardianFullName: string;
  guardianRelationship: string;
  guardianEmail: string;
  guardianPhoneNumber: string;
  status: AdmissionApplicantStatus;
};

type FlashMessage = {
  kind: 'success' | 'error';
  message: string;
};

type WorkspaceState = {
  dashboard: AdmissionDashboard;
  applicants: ApiPaginatedResponse<AdmissionApplicant>;
  applications: ApiPaginatedResponse<AdmissionApplication>;
  cycles: ApiPaginatedResponse<AdmissionCycle>;
  programmes: ApiPaginatedResponse<AdmissionProgramme>;
  loadedAt: string;
};

type ApplicationAction =
  | 'submit'
  | 'schedule'
  | 'approve'
  | 'reject'
  | 'offer'
  | 'accept'
  | 'enroll';

type AdmissionWorkspaceProps = {
  preferredTenantSlug?: string;
  tenantName?: string;
};

function statusToneClass(status: string) {
  switch (badgeTone(status)) {
    case 'success':
      return styles.pillSuccess;
    case 'warning':
      return styles.pillWarning;
    case 'danger':
      return styles.pillDanger;
    case 'muted':
      return styles.pillMuted;
    default:
      return styles.pillNeutral;
  }
}

function buildApplicantBaseInput(form: ApplicantFormState) {
  const gender = optionalText(form.gender);

  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    otherNames: optionalText(form.otherNames) ?? null,
    email: optionalText(form.email) ?? null,
    phoneNumber: optionalText(form.phoneNumber) ?? null,
    dateOfBirth: optionalText(form.dateOfBirth) ?? null,
    gender: gender ? (gender as AdmissionGender) : null,
  };
}

function buildGuardianInput(form: ApplicantFormState, mode: ApplicantFormMode) {
  const guardianHasData = hasAnyText([
    form.guardianFullName,
    form.guardianRelationship,
    form.guardianEmail,
    form.guardianPhoneNumber,
  ]);

  if (!guardianHasData) {
    return mode === 'edit' ? null : undefined;
  }

  const message = 'Guardian full name and relationship are required when adding guardian details.';

  return {
    fullName: requiredText(form.guardianFullName, message),
    relationship: requiredText(form.guardianRelationship, message),
    email: optionalText(form.guardianEmail) ?? null,
    phoneNumber: optionalText(form.guardianPhoneNumber) ?? null,
  };
}

function buildApplicantCreateInput(form: ApplicantFormState): CreateApplicantInput {
  return {
    ...buildApplicantBaseInput(form),
    guardian: buildGuardianInput(form, 'create'),
  };
}

function buildApplicantUpdateInput(form: ApplicantFormState): UpdateApplicantInput {
  return {
    ...buildApplicantBaseInput(form),
    guardian: buildGuardianInput(form, 'edit'),
    status: form.status,
  };
}

function applicantFormFromApplicant(applicant: AdmissionApplicant): ApplicantFormState {
  return {
    firstName: applicant.firstName,
    lastName: applicant.lastName,
    otherNames: applicant.otherNames ?? '',
    email: applicant.email ?? '',
    phoneNumber: applicant.phoneNumber ?? '',
    dateOfBirth: applicant.dateOfBirth ?? '',
    gender: applicant.gender ?? '',
    guardianFullName: applicant.guardian?.fullName ?? '',
    guardianRelationship: applicant.guardian?.relationship ?? '',
    guardianEmail: applicant.guardian?.email ?? '',
    guardianPhoneNumber: applicant.guardian?.phoneNumber ?? '',
    status: applicant.status,
  };
}

function buildApplicationCreateInput(form: ApplicationFormState) {
  return {
    applicantId: form.applicantId.trim(),
    programmeId: form.programmeId.trim(),
    cycleId: optionalText(form.cycleId) ?? null,
    submissionNotes: optionalText(form.submissionNotes) ?? null,
  };
}

function buildApplicationUpdateInput(form: ApplicationFormState): UpdateApplicationInput {
  return {
    applicantId: form.applicantId.trim(),
    programmeId: form.programmeId.trim(),
    cycleId: optionalText(form.cycleId),
    submissionNotes: optionalText(form.submissionNotes) ?? null,
  };
}

function cycleFormFromCycle(cycle: AdmissionCycle): CycleFormState {
  return {
    academicYear: cycle.academicYear,
    name: cycle.name,
    startDate: cycle.startDate,
    endDate: cycle.endDate ?? '',
    status: cycle.status,
  };
}

function buildCycleInput(form: CycleFormState): CreateCycleInput {
  const message = 'Academic year, cycle name, and start date are required.';
  const academicYear = requiredText(form.academicYear, message);
  const name = requiredText(form.name, message);
  const startDate = requiredText(form.startDate, message);

  return {
    academicYear,
    name,
    startDate,
    endDate: optionalText(form.endDate) ?? null,
    status: form.status,
  };
}

function programmeFormFromProgramme(programme: AdmissionProgramme): ProgrammeFormState {
  return {
    code: programme.code,
    name: programme.name,
    level: programme.level,
    capacity: String(programme.capacity),
    active: programme.active,
  };
}

function buildProgrammeInput(form: ProgrammeFormState): CreateProgrammeInput {
  const message = 'Programme code, name, and level are required.';
  const code = requiredText(form.code, message);
  const name = requiredText(form.name, message);
  const level = requiredText(form.level, message);
  const capacity = parsePositiveInteger(form.capacity, 'Programme capacity must be at least 1.');

  return {
    code,
    name,
    level,
    capacity,
    active: form.active,
  };
}

function applicationFormFromApplication(application: AdmissionApplication): ApplicationFormState {
  return {
    applicantId: application.applicantId,
    programmeId: application.programmeId,
    cycleId: application.cycleId,
    submissionNotes: application.submissionNotes ?? '',
  };
}

function readStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdmissionSession;
  } catch {
    return null;
  }
}

function persistSession(session: AdmissionSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearStoredSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function AdmissionWorkspace({ preferredTenantSlug, tenantName }: AdmissionWorkspaceProps = {}) {
  const [booting, setBooting] = useState(true);
  const [tenants, setTenants] = useState<ApiTenant[]>([]);
  const [health, setHealth] = useState<ApiHealthResponse | null>(null);
  const [session, setSession] = useState<AdmissionSession | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [flash, setFlash] = useState<FlashMessage | null>(null);
  const [busy, setBusy] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginFormState>(INITIAL_LOGIN);
  const [query, setQuery] = useState<WorkspaceQuery>(INITIAL_QUERY);
  const [applicantForm, setApplicantForm] = useState<ApplicantFormState>(INITIAL_APPLICANT_FORM);
  const [editingApplicantId, setEditingApplicantId] = useState<string | null>(null);
  const [cycleForm, setCycleForm] = useState<CycleFormState>(INITIAL_CYCLE_FORM);
  const [editingCycleId, setEditingCycleId] = useState<string | null>(null);
  const [applicationForm, setApplicationForm] = useState<ApplicationFormState>(INITIAL_APPLICATION_FORM);
  const [editingApplicationId, setEditingApplicationId] = useState<string | null>(null);
  const [editingApplicationSnapshot, setEditingApplicationSnapshot] = useState<AdmissionApplication | null>(null);
  const [programmeForm, setProgrammeForm] = useState<ProgrammeFormState>(INITIAL_PROGRAMME_FORM);
  const [editingProgrammeId, setEditingProgrammeId] = useState<string | null>(null);
  const applicantFormRef = useRef<HTMLDivElement | null>(null);
  const cycleFormRef = useRef<HTMLDivElement | null>(null);
  const applicationFormRef = useRef<HTMLDivElement | null>(null);
  const programmeFormRef = useRef<HTMLDivElement | null>(null);
  const tenantMode = Boolean(preferredTenantSlug);
  const normalizedPreferredTenantSlug = preferredTenantSlug?.trim().toLowerCase() ?? null;
  const isEditingApplicant = editingApplicantId !== null;
  const isEditingCycle = editingCycleId !== null;
  const isEditingApplication = editingApplicationId !== null;
  const isEditingProgramme = editingProgrammeId !== null;

  const refreshWorkspace = async (targetSession: AdmissionSession, targetQuery: WorkspaceQuery = query) => {
    setWorkspaceLoading(true);
    setWorkspaceError(null);

    try {
      const [dashboard, cycles, programmes, applicants, applications] = await Promise.all([
        getAdmissionDashboard(targetSession),
        listAdmissionCycles(targetSession, { page: 1, limit: 4, sortBy: 'updatedAt', sortOrder: 'desc' }),
        listAdmissionProgrammes(targetSession, { page: 1, limit: 6, sortBy: 'createdAt', sortOrder: 'desc' }),
        listAdmissionApplicants(targetSession, {
          q: optionalText(targetQuery.applicantSearch),
          page: targetQuery.applicantPage,
          limit: LIST_LIMIT,
          sortBy: 'updatedAt',
          sortOrder: 'desc',
        }),
        listAdmissionApplications(targetSession, {
          q: optionalText(targetQuery.applicationSearch),
          status: optionalText(targetQuery.applicationStatus),
          page: targetQuery.applicationPage,
          limit: LIST_LIMIT,
          sortBy: 'updatedAt',
          sortOrder: 'desc',
        }),
      ]);

      setWorkspace({
        dashboard,
        cycles,
        programmes,
        applicants,
        applications,
        loadedAt: new Date().toISOString(),
      });
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error.message : 'Unable to load the admission portal.');
    } finally {
      setWorkspaceLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const [tenantsResult, healthResult] = await Promise.allSettled([getPublicTenants(), getApiHealth()]);

        if (!active) {
          return;
        }

        if (tenantsResult.status === 'fulfilled') {
          setTenants(tenantsResult.value);
          const tenantMatch = normalizedPreferredTenantSlug
            ? tenantsResult.value.find((tenant) => tenant.slug.toLowerCase() === normalizedPreferredTenantSlug) ?? null
            : null;
          const defaultTenant = tenantMatch ?? tenantsResult.value[0] ?? null;

          if (defaultTenant) {
            setLoginForm((current) =>
              current.tenantId ? current : { ...current, tenantId: defaultTenant.id },
            );
          }

          if (normalizedPreferredTenantSlug && !tenantMatch) {
            setFlash({
              kind: 'error',
              message: `No active tenant matches the ${preferredTenantSlug} domain.`,
            });
          }
        } else {
          setFlash({
            kind: 'error',
            message:
              tenantsResult.reason instanceof Error
                ? tenantsResult.reason.message
                : 'Unable to load the tenant directory.',
          });
        }

        if (healthResult.status === 'fulfilled') {
          setHealth(healthResult.value);
        } else {
          setFlash({
            kind: 'error',
            message:
              healthResult.reason instanceof Error
                ? healthResult.reason.message
                : 'Unable to reach the platform health endpoint.',
          });
        }

        const storedSession = readStoredSession();
        if (storedSession) {
          const storedTenant = tenantsResult.status === 'fulfilled'
            ? tenantsResult.value.find(
                (tenant) =>
                  tenant.id === storedSession.tenantId ||
                  tenant.slug.toLowerCase() === storedSession.tenantSlug.toLowerCase(),
              ) ?? null
            : null;
          const matchesPreferredTenant = !normalizedPreferredTenantSlug
            ? true
            : storedSession.tenantSlug.toLowerCase() === normalizedPreferredTenantSlug ||
              storedTenant?.slug.toLowerCase() === normalizedPreferredTenantSlug;

          if (matchesPreferredTenant) {
            setSession(storedSession);
            setLoginForm({
              tenantId: storedSession.tenantId,
              email: storedSession.user.email,
              password: '',
            });
            await refreshWorkspace(storedSession, INITIAL_QUERY);
          } else {
            clearStoredSession();
            setFlash({
              kind: 'error',
              message: `This domain is reserved for ${preferredTenantSlug}. Sign in with that tenant account.`,
            });
          }
        }
      } finally {
        if (active) {
          setBooting(false);
        }
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!flash) {
      return;
    }

    const timeout = window.setTimeout(() => setFlash(null), 6000);
    return () => window.clearTimeout(timeout);
  }, [flash]);

  useEffect(() => {
    if (!workspace || !editingApplicationId) {
      return;
    }

    const currentApplication = workspace.applications.items.find((application) => application.id === editingApplicationId);
    if (currentApplication && currentApplication.status !== 'draft') {
      setApplicationForm(INITIAL_APPLICATION_FORM);
      setEditingApplicationId(null);
      setEditingApplicationSnapshot(null);
    }
  }, [workspace, editingApplicationId]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFlash(null);

    try {
      const response = await loginToPlatform({
        tenantId: loginForm.tenantId.trim(),
        email: loginForm.email.trim(),
        password: loginForm.password,
      });
      const tenant = tenants.find((entry) => entry.id === loginForm.tenantId.trim());
      const nextSession: AdmissionSession = {
        tenantId: response.user.tenantId,
        tenantName: tenant?.name ?? response.user.tenantId,
        tenantSlug: tenant?.slug ?? response.user.tenantId,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user,
      };

      setSession(nextSession);
      persistSession(nextSession);
      setLoginForm((current) => ({
        ...current,
        password: '',
      }));
      setFlash({
        kind: 'success',
        message: `Connected to ${nextSession.tenantName}. Welcome back, ${response.user.fullName}.`,
      });
      await refreshWorkspace(nextSession, query);
    } catch (error) {
      const message =
        error instanceof EduCoreApiError || error instanceof Error
          ? error.message
          : 'Unable to sign in to the admission portal.';
      setFlash({ kind: 'error', message });
    } finally {
      setBusy(false);
    }
  }

  async function handleRefresh() {
    if (!session) {
      return;
    }

    await refreshWorkspace(session, query);
  }

  function handleLogout() {
    clearStoredSession();
    setSession(null);
    setWorkspace(null);
    setWorkspaceError(null);
    setQuery(INITIAL_QUERY);
    setApplicantForm(INITIAL_APPLICANT_FORM);
    setEditingApplicantId(null);
    setCycleForm(INITIAL_CYCLE_FORM);
    setEditingCycleId(null);
    setApplicationForm(INITIAL_APPLICATION_FORM);
    setEditingApplicationId(null);
    setEditingApplicationSnapshot(null);
    setProgrammeForm(INITIAL_PROGRAMME_FORM);
    setEditingProgrammeId(null);
    setFlash({
      kind: 'success',
      message: 'Session cleared. Sign back in to continue the admission workflow.',
    });
  }

  function handleApplicantEdit(applicant: AdmissionApplicant) {
    setApplicantForm(applicantFormFromApplicant(applicant));
    setEditingApplicantId(applicant.id);
    setApplicationForm((current) => ({
      ...current,
      applicantId: applicant.id,
    }));
    applicantFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleApplicantFormReset() {
    setApplicantForm(INITIAL_APPLICANT_FORM);
    setEditingApplicantId(null);
  }

  function handleCycleEdit(cycle: AdmissionCycle) {
    setCycleForm(cycleFormFromCycle(cycle));
    setEditingCycleId(cycle.id);
    cycleFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleCycleUseInApplication(cycle: AdmissionCycle) {
    setApplicationForm((current) => ({
      ...current,
      cycleId: cycle.id,
    }));
    setFlash({
      kind: 'success',
      message: `${cycle.name} is selected in the application form.`,
    });
    applicationFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleCycleFormReset() {
    setCycleForm(INITIAL_CYCLE_FORM);
    setEditingCycleId(null);
  }

  function handleApplicationEdit(application: AdmissionApplication) {
    setApplicationForm(applicationFormFromApplication(application));
    setEditingApplicationId(application.id);
    setEditingApplicationSnapshot(application);
    applicationFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleApplicationFormReset() {
    setApplicationForm(INITIAL_APPLICATION_FORM);
    setEditingApplicationId(null);
    setEditingApplicationSnapshot(null);
  }

  function handleProgrammeEdit(programme: AdmissionProgramme) {
    setProgrammeForm(programmeFormFromProgramme(programme));
    setEditingProgrammeId(programme.id);
    programmeFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleProgrammeUseInApplication(programme: AdmissionProgramme) {
    setApplicationForm((current) => ({
      ...current,
      programmeId: programme.id,
    }));
    setFlash({
      kind: 'success',
      message: `${programme.code} is selected in the application form.`,
    });
    applicationFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleProgrammeFormReset() {
    setProgrammeForm(INITIAL_PROGRAMME_FORM);
    setEditingProgrammeId(null);
  }

  async function handleApplicantSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    setBusy(true);
    setFlash(null);

    try {
      const editingApplicant = isEditingApplicant;
      const applicantId = editingApplicantId;
      const payload = buildApplicantBaseInput(applicantForm);
      if (!payload.firstName || !payload.lastName) {
        throw new Error('Applicant first name and last name are required.');
      }
      if (editingApplicant && !applicantId) {
        throw new Error('Unable to determine the applicant being edited.');
      }
      const targetApplicantId = applicantId as string;

      const saved = editingApplicant
        ? await updateAdmissionApplicant(session, targetApplicantId, buildApplicantUpdateInput(applicantForm))
        : await createAdmissionApplicant(session, buildApplicantCreateInput(applicantForm));

      setApplicantForm(INITIAL_APPLICANT_FORM);
      setEditingApplicantId(null);
      setApplicationForm((current) => ({
        ...current,
        applicantId: saved.id,
      }));
      setFlash({
        kind: 'success',
        message: editingApplicant
          ? `${saved.fullName} was updated in the applicant register.`
          : `${saved.fullName} was added to the applicant register.`,
      });
      await refreshWorkspace(session, query);
    } catch (error) {
      const message =
        error instanceof EduCoreApiError || error instanceof Error
          ? error.message
          : isEditingApplicant
            ? 'Unable to update the applicant record.'
            : 'Unable to create the applicant record.';
      setFlash({ kind: 'error', message });
    } finally {
      setBusy(false);
    }
  }

  async function handleCycleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    setBusy(true);
    setFlash(null);

    try {
      const payload = buildCycleInput(cycleForm);
      const editingCycle = isEditingCycle;
      const saved = editingCycle && editingCycleId
        ? await updateAdmissionCycle(session, editingCycleId, payload)
        : await createAdmissionCycle(session, payload);

      handleCycleFormReset();
      setFlash({
        kind: 'success',
        message: editingCycle ? `${saved.name} was updated.` : `${saved.name} was created.`,
      });
      await refreshWorkspace(session, query);
    } catch (error) {
      const message =
        error instanceof EduCoreApiError || error instanceof Error
          ? error.message
          : isEditingCycle
            ? 'Unable to update the cycle.'
            : 'Unable to create the cycle.';
      setFlash({ kind: 'error', message });
    } finally {
      setBusy(false);
    }
  }

  async function handleApplicationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    setBusy(true);
    setFlash(null);

    try {
      if (!applicationForm.applicantId || !applicationForm.programmeId) {
        throw new Error('Select both an applicant and a programme before saving the application.');
      }

      const editingApplication = isEditingApplication;
      const applicationId = editingApplicationId;
      if (editingApplication && !applicationId) {
        throw new Error('Unable to determine the application being edited.');
      }

      const saved = editingApplication
        ? await updateAdmissionApplication(session, applicationId as string, buildApplicationUpdateInput(applicationForm))
        : await createAdmissionApplication(session, buildApplicationCreateInput(applicationForm));

      if (editingApplication) {
        handleApplicationFormReset();
      } else {
        setApplicationForm((current) => ({
          ...current,
          submissionNotes: '',
        }));
      }
      setFlash({
        kind: 'success',
        message: editingApplication
          ? `Application ${saved.id.slice(0, 8)} was updated for ${saved.applicantName}.`
          : `Application ${saved.id.slice(0, 8)} was created for ${saved.applicantName}.`,
      });
      await refreshWorkspace(session, query);
    } catch (error) {
      const message =
        error instanceof EduCoreApiError || error instanceof Error
          ? error.message
          : isEditingApplication
            ? 'Unable to update the application.'
            : 'Unable to create the application.';
      setFlash({ kind: 'error', message });
    } finally {
      setBusy(false);
    }
  }

  async function handleProgrammeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    setBusy(true);
    setFlash(null);

    try {
      const payload = buildProgrammeInput(programmeForm);
      const editingProgramme = isEditingProgramme;
      const saved = editingProgramme && editingProgrammeId
        ? await updateAdmissionProgramme(session, editingProgrammeId, payload)
        : await createAdmissionProgramme(session, payload);

      handleProgrammeFormReset();
      setFlash({
        kind: 'success',
        message: editingProgramme ? `${saved.code} was updated.` : `${saved.code} was created.`,
      });
      await refreshWorkspace(session, query);
    } catch (error) {
      const message =
        error instanceof EduCoreApiError || error instanceof Error
          ? error.message
          : isEditingProgramme
            ? 'Unable to update the programme.'
            : 'Unable to create the programme.';
      setFlash({ kind: 'error', message });
    } finally {
      setBusy(false);
    }
  }

  async function handleApplicantSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const applicantSearch = String(formData.get('applicantSearch') ?? '').trim();
    const nextQuery = {
      ...query,
      applicantSearch,
      applicantPage: 1,
    };
    setQuery(nextQuery);
    await refreshWorkspace(session, nextQuery);
  }

  async function handleApplicationSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const applicationSearch = String(formData.get('applicationSearch') ?? '').trim();
    const applicationStatus = String(formData.get('applicationStatus') ?? '').trim();
    const nextQuery = {
      ...query,
      applicationSearch,
      applicationStatus,
      applicationPage: 1,
    };
    setQuery(nextQuery);
    await refreshWorkspace(session, nextQuery);
  }

  async function handleApplicantPage(direction: 'prev' | 'next') {
    if (!session || !workspace) {
      return;
    }

    const page =
      direction === 'prev' ? Math.max(1, workspace.applicants.meta.page - 1) : workspace.applicants.meta.page + 1;
    const nextQuery = {
      ...query,
      applicantPage: page,
    };
    setQuery(nextQuery);
    await refreshWorkspace(session, nextQuery);
  }

  async function handleApplicationPage(direction: 'prev' | 'next') {
    if (!session || !workspace) {
      return;
    }

    const page =
      direction === 'prev'
        ? Math.max(1, workspace.applications.meta.page - 1)
        : workspace.applications.meta.page + 1;
    const nextQuery = {
      ...query,
      applicationPage: page,
    };
    setQuery(nextQuery);
    await refreshWorkspace(session, nextQuery);
  }

  async function handleApplicantDelete(applicantId: string, applicantName: string) {
    if (!session || !window.confirm(`Withdraw ${applicantName}? This keeps the record reversible.`)) {
      return;
    }

    setBusy(true);
    setFlash(null);

    try {
      await deleteAdmissionApplicant(session, applicantId);
      if (editingApplicantId === applicantId) {
        handleApplicantFormReset();
      }
      setApplicationForm((current) =>
        current.applicantId === applicantId ? { ...current, applicantId: '' } : current,
      );
      setFlash({ kind: 'success', message: `${applicantName} was withdrawn.` });
      await refreshWorkspace(session, query);
    } catch (error) {
      const message =
        error instanceof EduCoreApiError || error instanceof Error
          ? error.message
          : 'Unable to withdraw the applicant.';
      setFlash({ kind: 'error', message });
    } finally {
      setBusy(false);
    }
  }

  async function handleApplicationAction(action: ApplicationAction, application: AdmissionApplication) {
    if (!session) {
      return;
    }

    let scheduleInput: {
      scheduledAt: string;
      location: string;
      interviewer: string;
      notes: string | null;
    } | null = null;
    let rejectReason: string | null = null;
    let offerExpiresAt: string | null = null;
    let studentNumber: string | null = null;

    if (action === 'schedule') {
      const scheduledAt = window.prompt('Interview time (ISO or local date/time)', new Date().toISOString().slice(0, 16));
      if (!scheduledAt) {
        return;
      }
      const location = window.prompt('Interview location', 'Main campus')?.trim();
      if (!location) {
        return;
      }
      const interviewer = window.prompt('Interviewer name', session.user.fullName)?.trim();
      if (!interviewer) {
        return;
      }
      const notes = window.prompt('Interview notes (optional)', '')?.trim() ?? '';
      scheduleInput = {
        scheduledAt,
        location,
        interviewer,
        notes: notes.length > 0 ? notes : null,
      };
    }

    if (action === 'reject') {
      const reason = window.prompt('Reason for rejection', 'Application did not meet the intake criteria')?.trim();
      if (!reason) {
        return;
      }
      rejectReason = reason;
    }

    if (action === 'offer') {
      const expires = window.prompt('Offer expiry date (optional, YYYY-MM-DD)', '')?.trim() ?? '';
      offerExpiresAt = expires.length > 0 ? expires : null;
    }

    if (action === 'enroll') {
      const number = window.prompt('Student number (optional)', '')?.trim() ?? '';
      studentNumber = number.length > 0 ? number : null;
    }

    setBusy(true);
    setFlash(null);

    try {
      switch (action) {
        case 'submit':
          await submitAdmissionApplication(session, application.id);
          break;
        case 'schedule':
          if (!scheduleInput) {
            return;
          }
          await scheduleAdmissionInterview(session, application.id, scheduleInput);
          break;
        case 'approve':
          await approveAdmissionApplication(session, application.id);
          break;
        case 'reject':
          if (!rejectReason) {
            return;
          }
          await rejectAdmissionApplication(session, application.id, { reason: rejectReason });
          break;
        case 'offer':
          await offerAdmission(session, application.id, {
            offerExpiresAt,
          });
          break;
        case 'accept':
          await acceptAdmissionOffer(session, application.id);
          break;
        case 'enroll':
          await enrollAdmissionStudent(session, application.id, {
            studentNumber,
          });
          break;
      }

      setFlash({
        kind: 'success',
        message: `${application.applicantName} moved to ${statusLabel(
          action === 'submit'
            ? 'submitted'
            : action === 'schedule'
              ? 'interview scheduled'
              : action === 'approve'
                ? 'approved'
                : action === 'reject'
                  ? 'rejected'
                  : action === 'offer'
                    ? 'offered'
          : action === 'accept'
            ? 'accepted'
            : 'enrolled',
        )}.`,
      });
      await refreshWorkspace(session, query);
      if (editingApplicationId === application.id) {
        handleApplicationFormReset();
      }
    } catch (error) {
      const message =
        error instanceof EduCoreApiError || error instanceof Error
          ? error.message
          : 'Unable to update the application.';
      setFlash({ kind: 'error', message });
    } finally {
      setBusy(false);
    }
  }

  const preferredTenant = normalizedPreferredTenantSlug
    ? tenants.find((tenant) => tenant.slug.toLowerCase() === normalizedPreferredTenantSlug) ?? null
    : null;
  const sessionTenant = session ? tenants.find((tenant) => tenant.id === session.tenantId) ?? null : null;
  const selectedTenant = preferredTenant ?? sessionTenant;
  const selectedApplicantVisible = Boolean(
    workspace?.applicants.items.some(
      (applicant) => applicant.id === applicationForm.applicantId,
    ),
  );
  const selectedProgrammeVisible = Boolean(
    workspace?.programmes.items.some(
      (programme) => programme.id === applicationForm.programmeId,
    ),
  );
  const selectedCycleVisible = Boolean(
    workspace?.cycles.items.some((cycle) => cycle.id === applicationForm.cycleId),
  );
  const applicationApplicantFallback =
    isEditingApplication && editingApplicationSnapshot && !selectedApplicantVisible && applicationForm.applicantId
      ? editingApplicationSnapshot.applicantName
      : null;
  const applicationProgrammeFallback =
    isEditingApplication && editingApplicationSnapshot && !selectedProgrammeVisible && applicationForm.programmeId
      ? editingApplicationSnapshot.programmeName
      : null;
  const applicationCycleFallback =
    isEditingApplication && editingApplicationSnapshot && !selectedCycleVisible && applicationForm.cycleId
      ? editingApplicationSnapshot.cycleName
      : null;
  const apiOnline = Boolean(health);
  const tenantHomeHref = normalizedPreferredTenantSlug
    ? buildTenantPath(normalizedPreferredTenantSlug)
    : session?.tenantSlug
      ? buildTenantPath(session.tenantSlug)
      : '/';

  return (
    <main className={styles.page}>
      <div className={styles.backdrop} />
      <div className={styles.layout}>
        <aside className={styles.rail}>
          <div className={styles.brand}>
            <div className={styles.brandMark}>EC</div>
            <div>
              <div className={styles.brandName}>EduCore Admission</div>
              <div className={styles.brandMeta}>{tenantMode ? 'Tenant portal' : 'Admissions portal'}</div>
            </div>
          </div>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelKicker}>Access</p>
                <h2 className={styles.panelTitle}>
                  {session
                    ? tenantMode
                      ? `${tenantName ?? session.tenantName} session`
                      : 'Portal session'
                    : tenantMode
                      ? 'Tenant sign in'
                      : 'Connect to a tenant'}
                </h2>
              </div>
              <span className={`${styles.pill} ${apiOnline ? styles.pillSuccess : styles.pillMuted}`}>
                {apiOnline ? 'API online' : 'API offline'}
              </span>
            </div>

            {session ? (
              <div className={styles.stack}>
                <div className={styles.sessionCard}>
                  <div className={styles.sessionLabel}>Tenant</div>
                  <div className={styles.sessionValue}>{session.tenantName}</div>
                  <div className={styles.sessionMeta}>{session.tenantSlug}</div>
                </div>
                <div className={styles.sessionCard}>
                  <div className={styles.sessionLabel}>Signed in as</div>
                  <div className={styles.sessionValue}>{session.user.fullName}</div>
                  <div className={styles.sessionMeta}>{session.user.email}</div>
                </div>
                <div className={styles.buttonRow}>
                  <button className={styles.buttonSecondary} type="button" onClick={handleRefresh} disabled={busy || workspaceLoading}>
                    Refresh
                  </button>
                  <button className={styles.buttonDanger} type="button" onClick={handleLogout} disabled={busy}>
                    Sign out
                  </button>
                </div>
              </div>
            ) : tenantMode ? (
              <form className={styles.formStack} onSubmit={handleLogin}>
                <div className={styles.sessionCard}>
                  <div className={styles.sessionLabel}>Tenant domain</div>
                  <div className={styles.sessionValue}>{tenantName ?? selectedTenant?.name ?? preferredTenantSlug}</div>
                  <div className={styles.sessionMeta}>{preferredTenantSlug}</div>
                </div>
                <div className={styles.fieldGrid}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      className={styles.input}
                      value={loginForm.email}
                      onChange={(event) =>
                        setLoginForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      placeholder="admin@educore.local"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="password">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      className={styles.input}
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      placeholder="Password123!"
                    />
                  </div>
                </div>
                <button className={styles.button} type="submit" disabled={busy || loginForm.tenantId.trim().length === 0}>
                  {busy ? 'Signing in...' : 'Open portal'}
                </button>
              </form>
            ) : (
              <form className={styles.formStack} onSubmit={handleLogin}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="tenantId">
                    Tenant
                  </label>
                  {tenants.length > 0 ? (
                    <select
                      id="tenantId"
                      className={styles.input}
                      value={loginForm.tenantId}
                      onChange={(event) =>
                        setLoginForm((current) => ({
                          ...current,
                          tenantId: event.target.value,
                        }))
                      }
                    >
                      <option value="">Select a tenant</option>
                      {tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name} ({tenant.slug})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="tenantId"
                      className={styles.input}
                      value={loginForm.tenantId}
                      onChange={(event) =>
                        setLoginForm((current) => ({
                          ...current,
                          tenantId: event.target.value,
                        }))
                      }
                      placeholder="Tenant id"
                    />
                  )}
                </div>
                <div className={styles.fieldGrid}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      className={styles.input}
                      value={loginForm.email}
                      onChange={(event) =>
                        setLoginForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      placeholder="admin@educore.local"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="password">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      className={styles.input}
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      placeholder="Password123!"
                    />
                  </div>
                </div>
                <button className={styles.button} type="submit" disabled={busy || loginForm.tenantId.trim().length === 0}>
                  {busy ? 'Signing in...' : 'Open portal'}
                </button>
              </form>
            )}
          </section>

          {tenantMode ? (
            <>
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <p className={styles.panelKicker}>Tenant</p>
                    <h2 className={styles.panelTitle}>{tenantName ?? selectedTenant?.name ?? 'Tenant domain'}</h2>
                  </div>
                  <span className={styles.pill}>{selectedTenant?.slug ?? preferredTenantSlug ?? 'Tenant'}</span>
                </div>

                <div className={styles.stack}>
                  <div className={styles.sessionCard}>
                    <div className={styles.sessionLabel}>Domain</div>
                    <div className={styles.sessionValue}>{selectedTenant?.slug ?? preferredTenantSlug}</div>
                    <div className={styles.sessionMeta}>Branded tenant access</div>
                  </div>
                  <div className={styles.sessionCard}>
                    <div className={styles.sessionLabel}>Enabled products</div>
                    <div className={styles.sessionValue}>
                      {selectedTenant?.enabledProducts.filter((product) => product !== 'platform').join(' · ') ||
                        'Admission'}
                    </div>
                    <div className={styles.sessionMeta}>Launch products from this domain</div>
                  </div>
                </div>
              </section>

              <Link className={styles.linkCard} href={tenantHomeHref}>
                Return to tenant home
              </Link>
            </>
          ) : (
            <>
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <p className={styles.panelKicker}>Platform</p>
                    <h2 className={styles.panelTitle}>System snapshot</h2>
                  </div>
                  <span className={styles.pill}>v0.1.0</span>
                </div>

                {health ? (
                  <div className={styles.quickStats}>
                    <div className={styles.quickStat}>
                      <span className={styles.quickStatLabel}>Environment</span>
                      <strong className={styles.quickStatValue}>{health.env}</strong>
                    </div>
                    <div className={styles.quickStat}>
                      <span className={styles.quickStatLabel}>Tenants</span>
                      <strong className={styles.quickStatValue}>{formatNumber(health.snapshot.tenants)}</strong>
                    </div>
                    <div className={styles.quickStat}>
                      <span className={styles.quickStatLabel}>Users</span>
                      <strong className={styles.quickStatValue}>{formatNumber(health.snapshot.users)}</strong>
                    </div>
                    <div className={styles.quickStat}>
                      <span className={styles.quickStatLabel}>Audits</span>
                      <strong className={styles.quickStatValue}>{formatNumber(health.snapshot.audits)}</strong>
                    </div>
                  </div>
                ) : (
                  <p className={styles.helperText}>The public health endpoint is still loading.</p>
                )}
              </section>

              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <p className={styles.panelKicker}>Seed tenants</p>
                    <h2 className={styles.panelTitle}>Known access points</h2>
                  </div>
                </div>
                <div className={styles.chipRow}>
                  {tenants.length > 0 ? (
                    tenants.map((tenant) => (
                      <span key={tenant.id} className={styles.chip}>
                        {tenant.name}
                      </span>
                    ))
                  ) : (
                    <span className={styles.helperText}>Waiting for tenant discovery.</span>
                  )}
                </div>
              </section>

              <Link className={styles.linkCard} href="/">
                Return to platform overview
              </Link>
            </>
          )}
        </aside>

        <section className={styles.main}>
          <header className={styles.topbar}>
            <div>
              <p className={styles.panelKicker}>{tenantMode ? 'Tenant portal' : 'Admission portal'}</p>
              <h1 className={styles.topbarTitle}>
                {session
                  ? `${session.tenantName} admissions desk`
                  : tenantMode
                    ? `${tenantName ?? selectedTenant?.name ?? 'Tenant'} portal`
                    : 'Admission portal preview'}
              </h1>
              <p className={styles.topbarCopy}>
                {tenantMode
                  ? 'A tenant-branded portal for intake, application review, interviews, offers, and enrollment.'
                  : 'A focused front office portal for intake, application review, interviews, offers, and enrollment.'}
              </p>
            </div>
            <div className={styles.topbarActions}>
              <span className={`${styles.pill} ${apiOnline ? styles.pillSuccess : styles.pillDanger}`}>
                {apiOnline ? `Connected to ${API_BASE_URL}` : 'No API connection'}
              </span>
              {session && selectedTenant ? (
                <span className={styles.pill}>{selectedTenant.enabledProducts.join(' · ')}</span>
              ) : null}
            </div>
          </header>

          {flash ? (
            <div
              className={`${styles.banner} ${
                flash.kind === 'success' ? styles.bannerSuccess : styles.bannerError
              }`}
            >
              {flash.message}
            </div>
          ) : null}

          {workspaceError ? <div className={`${styles.banner} ${styles.bannerError}`}>{workspaceError}</div> : null}

          <section className={styles.hero}>
            <div>
              <p className={styles.panelKicker}>{tenantMode ? 'Tenant dashboard' : 'Admission dashboard'}</p>
              <h2 className={styles.heroTitle}>
                {session
                  ? 'Manage the full intake pipeline from a single screen.'
                  : tenantMode
                    ? `Sign in to unlock ${tenantName ?? selectedTenant?.name ?? 'this tenant'} admissions.`
                    : 'Sign in to unlock the live admission workflow.'}
              </h2>
              <p className={styles.heroCopy}>
                {session
                  ? `The dashboard below is reading directly from the admission API for ${session.tenantName}.`
                  : tenantMode
                    ? 'Use the tenant account to connect to the live portal and keep staff work inside the branded domain.'
                    : 'Choose a tenant, sign in with the seeded admin account, and the UI will connect to the live admission APIs.'}
              </p>
            </div>
            <div className={styles.heroAside}>
              <div className={styles.inlineStat}>
                <span className={styles.quickStatLabel}>{tenantMode ? 'Tenant' : 'Backend'}</span>
                <strong className={styles.quickStatValue}>{tenantMode ? tenantName ?? selectedTenant?.name ?? 'Tenant' : health?.appName ?? 'EduCore API'}</strong>
              </div>
              <div className={styles.inlineStat}>
                <span className={styles.quickStatLabel}>Loaded at</span>
                <strong className={styles.quickStatValue}>
                  {workspace ? formatDateTime(workspace.loadedAt) : 'Waiting'}
                </strong>
              </div>
            </div>
          </section>

          {session && workspace ? (
            <>
              <section className={styles.metricGrid}>
                <MetricCard label="Applicants" value={workspace.dashboard.applicants} hint="Active applicants in the tenant" />
                <MetricCard label="Applications" value={workspace.dashboard.applications} hint="Total application records" />
                <MetricCard
                  label="Submitted"
                  value={workspace.dashboard.submittedApplications}
                  hint="Non-draft applications"
                />
                <MetricCard label="Approved" value={workspace.dashboard.approved} hint="Applications ready for offers" />
                <MetricCard label="Offered" value={workspace.dashboard.offered} hint="Offers issued to applicants" />
                <MetricCard
                  label="Acceptance rate"
                  value={`${workspace.dashboard.acceptanceRate}%`}
                  hint="Accepted as a share of submitted applications"
                />
              </section>

              <section className={styles.split}>
                <div className={styles.panel} ref={applicantFormRef}>
                  <div className={styles.panelHeader}>
                    <div>
                      <p className={styles.panelKicker}>Applicant intake</p>
                      <h2 className={styles.panelTitle}>{isEditingApplicant ? 'Edit applicant' : 'Create applicant'}</h2>
                    </div>
                    <span className={`${styles.pill} ${isEditingApplicant ? styles.pillWarning : styles.pillSuccess}`}>
                      {isEditingApplicant ? 'Editing existing record' : 'New applicant'}
                    </span>
                  </div>
                  {isEditingApplicant ? (
                    <div className={styles.banner}>
                      <strong>Editing an existing applicant</strong>
                      <p className={styles.helperText}>
                        Update the live record below. Clearing the guardian fields will remove the linked guardian on save.
                      </p>
                    </div>
                  ) : (
                    <p className={styles.helperText}>
                      New applicants begin in draft status and can be linked to an application immediately after saving.
                    </p>
                  )}
                  <form className={styles.formStack} onSubmit={handleApplicantSubmit}>
                    <div className={styles.fieldGrid}>
                      <Field label="First name">
                        <input
                          className={styles.input}
                          value={applicantForm.firstName}
                          onChange={(event) =>
                            setApplicantForm((current) => ({
                              ...current,
                              firstName: event.target.value,
                            }))
                          }
                          placeholder="Jane"
                        />
                      </Field>
                      <Field label="Last name">
                        <input
                          className={styles.input}
                          value={applicantForm.lastName}
                          onChange={(event) =>
                            setApplicantForm((current) => ({
                              ...current,
                              lastName: event.target.value,
                            }))
                          }
                          placeholder="Doe"
                        />
                      </Field>
                    </div>
                    <div className={styles.fieldGrid}>
                      <Field label="Other names">
                        <input
                          className={styles.input}
                          value={applicantForm.otherNames}
                          onChange={(event) =>
                            setApplicantForm((current) => ({
                              ...current,
                              otherNames: event.target.value,
                            }))
                          }
                          placeholder="Optional middle names"
                        />
                      </Field>
                      <Field label="Gender">
                        <select
                          className={styles.select}
                          value={applicantForm.gender}
                          onChange={(event) =>
                            setApplicantForm((current) => ({
                              ...current,
                              gender: event.target.value as AdmissionGender | '',
                            }))
                          }
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                      </Field>
                    </div>
                    <div className={styles.fieldGrid}>
                      <Field label="Email">
                        <input
                          className={styles.input}
                          value={applicantForm.email}
                          onChange={(event) =>
                            setApplicantForm((current) => ({
                              ...current,
                              email: event.target.value,
                            }))
                          }
                          placeholder="jane@example.com"
                        />
                      </Field>
                      <Field label="Phone number">
                        <input
                          className={styles.input}
                          value={applicantForm.phoneNumber}
                          onChange={(event) =>
                            setApplicantForm((current) => ({
                              ...current,
                              phoneNumber: event.target.value,
                            }))
                          }
                          placeholder="+263..."
                        />
                      </Field>
                    </div>
                    <div className={styles.fieldGrid}>
                      <Field label="Date of birth">
                        <input
                          className={styles.input}
                          value={applicantForm.dateOfBirth}
                          onChange={(event) =>
                            setApplicantForm((current) => ({
                              ...current,
                              dateOfBirth: event.target.value,
                            }))
                          }
                          placeholder="2012-03-14"
                        />
                      </Field>
                      <div />
                    </div>

                    <div className={styles.softDivider} />

                    <div className={styles.fieldGrid}>
                      <Field label="Guardian full name">
                        <input
                          className={styles.input}
                          value={applicantForm.guardianFullName}
                          onChange={(event) =>
                            setApplicantForm((current) => ({
                              ...current,
                              guardianFullName: event.target.value,
                            }))
                          }
                          placeholder="Primary guardian"
                        />
                      </Field>
                      <Field label="Relationship">
                        <input
                          className={styles.input}
                          value={applicantForm.guardianRelationship}
                          onChange={(event) =>
                            setApplicantForm((current) => ({
                              ...current,
                              guardianRelationship: event.target.value,
                            }))
                          }
                          placeholder="Parent / guardian"
                        />
                      </Field>
                    </div>
                    <div className={styles.fieldGrid}>
                      <Field label="Guardian email">
                        <input
                          className={styles.input}
                          value={applicantForm.guardianEmail}
                          onChange={(event) =>
                            setApplicantForm((current) => ({
                              ...current,
                              guardianEmail: event.target.value,
                            }))
                          }
                          placeholder="guardian@example.com"
                        />
                      </Field>
                      <Field label="Guardian phone">
                        <input
                          className={styles.input}
                          value={applicantForm.guardianPhoneNumber}
                          onChange={(event) =>
                            setApplicantForm((current) => ({
                              ...current,
                              guardianPhoneNumber: event.target.value,
                            }))
                          }
                          placeholder="+263..."
                        />
                      </Field>
                    </div>

                    {isEditingApplicant ? (
                      <Field label="Applicant status">
                        <select
                          className={styles.select}
                          value={applicantForm.status}
                          onChange={(event) =>
                            setApplicantForm((current) => ({
                              ...current,
                              status: event.target.value as AdmissionApplicantStatus,
                            }))
                          }
                        >
                          {APPLICANT_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {statusLabel(status)}
                            </option>
                          ))}
                        </select>
                      </Field>
                    ) : null}

                    <div className={styles.buttonRow}>
                      <button
                        className={styles.buttonSecondary}
                        type="button"
                        onClick={handleApplicantFormReset}
                        disabled={busy}
                      >
                        {isEditingApplicant ? 'Cancel editing' : 'Clear form'}
                      </button>
                      <button className={styles.button} type="submit" disabled={busy}>
                        {busy
                          ? isEditingApplicant
                            ? 'Saving changes...'
                            : 'Saving applicant...'
                          : isEditingApplicant
                            ? 'Save changes'
                            : 'Create applicant'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className={styles.panel} ref={applicationFormRef}>
                  <div className={styles.panelHeader}>
                    <div>
                      <p className={styles.panelKicker}>Application flow</p>
                      <h2 className={styles.panelTitle}>{isEditingApplication ? 'Edit application' : 'Create application'}</h2>
                    </div>
                    <span className={`${styles.pill} ${isEditingApplication ? styles.pillWarning : styles.pillSuccess}`}>
                      {isEditingApplication ? 'Editing draft application' : 'New application'}
                    </span>
                  </div>
                  {isEditingApplication ? (
                    <div className={styles.banner}>
                      <strong>Editing a draft application</strong>
                      <p className={styles.helperText}>
                        Only draft applications can be updated here. Once the application is submitted, the edit mode will close.
                      </p>
                    </div>
                  ) : (
                    <p className={styles.helperText}>
                      Draft applications can be created, adjusted, and then submitted into the review pipeline.
                    </p>
                  )}
                  <form className={styles.formStack} onSubmit={handleApplicationSubmit}>
                    <div className={styles.fieldGrid}>
                      <Field label="Applicant">
                        <select
                          className={styles.select}
                          value={applicationForm.applicantId}
                          onChange={(event) =>
                            setApplicationForm((current) => ({
                              ...current,
                              applicantId: event.target.value,
                            }))
                          }
                        >
                          <option value="">Select applicant</option>
                          {applicationApplicantFallback ? (
                            <option value={applicationForm.applicantId}>{applicationApplicantFallback}</option>
                          ) : null}
                          {(applicationApplicantFallback
                            ? workspace.applicants.items.filter((applicant) => applicant.id !== applicationForm.applicantId)
                            : workspace.applicants.items
                          ).map((applicant) => (
                            <option key={applicant.id} value={applicant.id}>
                              {applicant.fullName}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Programme">
                        <select
                          className={styles.select}
                          value={applicationForm.programmeId}
                          onChange={(event) =>
                            setApplicationForm((current) => ({
                              ...current,
                              programmeId: event.target.value,
                            }))
                          }
                        >
                          <option value="">Select programme</option>
                          {applicationProgrammeFallback ? (
                            <option value={applicationForm.programmeId}>{applicationProgrammeFallback}</option>
                          ) : null}
                          {(applicationProgrammeFallback
                            ? workspace.programmes.items.filter((programme) => programme.id !== applicationForm.programmeId)
                            : workspace.programmes.items
                          ).map((programme) => (
                            <option key={programme.id} value={programme.id}>
                              {programme.code} - {programme.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field label="Cycle">
                      <select
                        className={styles.select}
                        value={applicationForm.cycleId}
                        onChange={(event) =>
                          setApplicationForm((current) => ({
                            ...current,
                            cycleId: event.target.value,
                          }))
                        }
                      >
                        <option value="">Use the current open cycle</option>
                        {applicationCycleFallback ? (
                          <option value={applicationForm.cycleId}>{applicationCycleFallback}</option>
                        ) : null}
                        {(applicationCycleFallback
                          ? workspace.cycles.items.filter((cycle) => cycle.id !== applicationForm.cycleId)
                          : workspace.cycles.items
                        ).map((cycle) => (
                          <option key={cycle.id} value={cycle.id}>
                            {cycle.name} ({cycle.academicYear})
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Submission notes">
                      <textarea
                        className={styles.textarea}
                        value={applicationForm.submissionNotes}
                        onChange={(event) =>
                          setApplicationForm((current) => ({
                            ...current,
                            submissionNotes: event.target.value,
                          }))
                        }
                        placeholder="Optional notes for the intake officer"
                        rows={6}
                      />
                    </Field>
                    <div className={styles.buttonRow}>
                      <button
                        className={styles.buttonSecondary}
                        type="button"
                        onClick={handleApplicationFormReset}
                        disabled={busy}
                      >
                        {isEditingApplication ? 'Cancel editing' : 'Clear form'}
                      </button>
                      <button className={styles.button} type="submit" disabled={busy}>
                        {busy
                          ? isEditingApplication
                            ? 'Saving changes...'
                            : 'Saving application...'
                          : isEditingApplication
                            ? 'Save changes'
                            : 'Create application'}
                      </button>
                    </div>
                  </form>
                </div>
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div>
                    <p className={styles.panelKicker}>Applicant register</p>
                    <h2 className={styles.sectionTitle}>Applicants</h2>
                    <p className={styles.sectionCopy}>Search the live applicant register and manage withdrawals.</p>
                  </div>
                  <form className={styles.toolbar} onSubmit={handleApplicantSearch}>
                    <input
                      name="applicantSearch"
                      className={styles.input}
                      defaultValue={query.applicantSearch}
                      placeholder="Search applicants"
                    />
                    <button className={styles.buttonSecondary} type="submit">
                      Search
                    </button>
                  </form>
                </div>

                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <Th>Name</Th>
                        <Th>Email</Th>
                        <Th>Guardian</Th>
                        <Th>Status</Th>
                        <Th>Updated</Th>
                        <Th align="right">Action</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {workspace.applicants.items.length === 0 ? (
                        <tr>
                          <td className={styles.emptyCell} colSpan={6}>
                            <EmptyState
                              title="No applicants yet"
                              description="Create the first applicant record from the intake form."
                            />
                          </td>
                        </tr>
                      ) : (
                        workspace.applicants.items.map((applicant) => (
                          <tr key={applicant.id} className={styles.tableRow}>
                            <td className={styles.tableCell}>
                              <strong>{applicant.fullName}</strong>
                              <div className={styles.cellMeta}>{applicant.id.slice(0, 8)}</div>
                            </td>
                            <td className={styles.tableCell}>{applicant.email ?? 'No email'}</td>
                            <td className={styles.tableCell}>{applicant.guardianName ?? 'No guardian added'}</td>
                            <td className={styles.tableCell}>
                              <StatusBadge status={applicant.status} />
                            </td>
                            <td className={styles.tableCell}>{formatDateTime(applicant.updatedAt)}</td>
                            <td className={styles.tableCellRight}>
                              <div className={styles.actionCluster}>
                                <button
                                  className={styles.buttonSecondarySmall}
                                  type="button"
                                  onClick={() => handleApplicantEdit(applicant)}
                                  disabled={busy}
                                >
                                  Edit
                                </button>
                                <button
                                  className={styles.buttonDangerSmall}
                                  type="button"
                                  onClick={() => handleApplicantDelete(applicant.id, applicant.fullName)}
                                  disabled={busy}
                                >
                                  Withdraw
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className={styles.pagination}>
                  <span>
                    Page {workspace.applicants.meta.page} of {workspace.applicants.meta.totalPages || 1}
                    {' · '}
                    {formatNumber(workspace.applicants.meta.total)} applicants
                  </span>
                  <div className={styles.buttonRow}>
                    <button
                      className={styles.buttonSecondary}
                      type="button"
                      onClick={() => handleApplicantPage('prev')}
                      disabled={busy || workspace.applicants.meta.hasPrev === false}
                    >
                      Previous
                    </button>
                    <button
                      className={styles.buttonSecondary}
                      type="button"
                      onClick={() => handleApplicantPage('next')}
                      disabled={busy || workspace.applicants.meta.hasNext === false}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div>
                    <p className={styles.panelKicker}>Application register</p>
                    <h2 className={styles.sectionTitle}>Applications</h2>
                    <p className={styles.sectionCopy}>
                      Move applications through the full pipeline using live backend actions.
                    </p>
                  </div>
                  <form className={styles.toolbar} onSubmit={handleApplicationSearch}>
                    <input
                      name="applicationSearch"
                      className={styles.input}
                      defaultValue={query.applicationSearch}
                      placeholder="Search applications"
                    />
                    <select
                      name="applicationStatus"
                      className={styles.select}
                      defaultValue={query.applicationStatus}
                    >
                      {APPLICATION_STATUSES.map((status) => (
                        <option key={status.value || 'all'} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <button className={styles.buttonSecondary} type="submit">
                      Filter
                    </button>
                  </form>
                </div>

                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <Th>Applicant</Th>
                        <Th>Programme</Th>
                        <Th>Cycle</Th>
                        <Th>Status</Th>
                        <Th>Timeline</Th>
                        <Th align="right">Actions</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {workspace.applications.items.length === 0 ? (
                        <tr>
                          <td className={styles.emptyCell} colSpan={6}>
                            <EmptyState
                              title="No applications yet"
                              description="Create an application from the intake form to begin the admission pipeline."
                            />
                          </td>
                        </tr>
                      ) : (
                        workspace.applications.items.map((application) => (
                          <tr key={application.id} className={styles.tableRow}>
                            <td className={styles.tableCell}>
                              <strong>{application.applicantName}</strong>
                              <div className={styles.cellMeta}>{application.id.slice(0, 8)}</div>
                            </td>
                            <td className={styles.tableCell}>{application.programmeName}</td>
                            <td className={styles.tableCell}>{application.cycleName}</td>
                            <td className={styles.tableCell}>
                              <StatusBadge status={application.status} />
                            </td>
                            <td className={styles.tableCell}>
                              <div className={styles.stackSmall}>
                                <span>{application.submittedAt ? `Submitted ${formatDateTime(application.submittedAt)}` : 'Draft'}</span>
                                <span>{application.updatedAt ? `Updated ${formatDateTime(application.updatedAt)}` : 'Never updated'}</span>
                              </div>
                            </td>
                            <td className={styles.tableCellRight}>
                              <div className={styles.actionCluster}>
                                {application.status === 'draft' ? (
                                  <ActionButton busy={busy} onClick={() => handleApplicationEdit(application)}>
                                    Edit
                                  </ActionButton>
                                ) : null}
                                {application.status === 'draft' ? (
                                  <ActionButton busy={busy} onClick={() => handleApplicationAction('submit', application)}>
                                    Submit
                                  </ActionButton>
                                ) : null}
                                {['submitted', 'interview_scheduled'].includes(application.status) ? (
                                  <>
                                    <ActionButton busy={busy} onClick={() => handleApplicationAction('schedule', application)}>
                                      Interview
                                    </ActionButton>
                                    <ActionButton busy={busy} onClick={() => handleApplicationAction('approve', application)}>
                                      Approve
                                    </ActionButton>
                                    <ActionButton busy={busy} tone="danger" onClick={() => handleApplicationAction('reject', application)}>
                                      Reject
                                    </ActionButton>
                                  </>
                                ) : null}
                                {application.status === 'approved' ? (
                                  <ActionButton busy={busy} onClick={() => handleApplicationAction('offer', application)}>
                                    Offer
                                  </ActionButton>
                                ) : null}
                                {application.status === 'offered' ? (
                                  <ActionButton busy={busy} onClick={() => handleApplicationAction('accept', application)}>
                                    Accept
                                  </ActionButton>
                                ) : null}
                                {['accepted', 'approved', 'offered'].includes(application.status) ? (
                                  <ActionButton busy={busy} onClick={() => handleApplicationAction('enroll', application)}>
                                    Enroll
                                  </ActionButton>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className={styles.pagination}>
                  <span>
                    Page {workspace.applications.meta.page} of {workspace.applications.meta.totalPages || 1}
                    {' · '}
                    {formatNumber(workspace.applications.meta.total)} applications
                  </span>
                  <div className={styles.buttonRow}>
                    <button
                      className={styles.buttonSecondary}
                      type="button"
                      onClick={() => handleApplicationPage('prev')}
                      disabled={busy || workspace.applications.meta.hasPrev === false}
                    >
                      Previous
                    </button>
                    <button
                      className={styles.buttonSecondary}
                      type="button"
                      onClick={() => handleApplicationPage('next')}
                      disabled={busy || workspace.applications.meta.hasNext === false}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </section>

              <section className={styles.split}>
                <div className={styles.panel} ref={cycleFormRef}>
                  <div className={styles.panelHeader}>
                    <div>
                      <p className={styles.panelKicker}>Cycles</p>
                      <h2 className={styles.panelTitle}>{isEditingCycle ? 'Edit cycle' : 'Create cycle'}</h2>
                    </div>
                    <span className={styles.pill}>{workspace.dashboard.activeCycleName ?? 'No active cycle'}</span>
                  </div>
                  {isEditingCycle ? (
                    <div className={styles.banner}>
                      <strong>Editing cycle</strong>
                      <p className={styles.helperText}>
                        Update the live cycle record, then save to keep admissions aligned with the active intake calendar.
                      </p>
                    </div>
                  ) : (
                    <p className={styles.helperText}>
                      Create a new cycle here or choose an existing cycle below to edit its academic year, dates, or status.
                    </p>
                  )}
                  <form className={styles.formStack} onSubmit={handleCycleSubmit}>
                    <div className={styles.fieldGrid}>
                      <Field label="Academic year">
                        <input
                          className={styles.input}
                          value={cycleForm.academicYear}
                          onChange={(event) =>
                            setCycleForm((current) => ({
                              ...current,
                              academicYear: event.target.value,
                            }))
                          }
                          placeholder="2026/2027"
                        />
                      </Field>
                      <Field label="Cycle name">
                        <input
                          className={styles.input}
                          value={cycleForm.name}
                          onChange={(event) =>
                            setCycleForm((current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                          }
                          placeholder="2026 Intake"
                        />
                      </Field>
                    </div>
                    <div className={styles.fieldGrid}>
                      <Field label="Start date">
                        <input
                          type="date"
                          className={styles.input}
                          value={cycleForm.startDate}
                          onChange={(event) =>
                            setCycleForm((current) => ({
                              ...current,
                              startDate: event.target.value,
                            }))
                          }
                        />
                      </Field>
                      <Field label="End date">
                        <input
                          type="date"
                          className={styles.input}
                          value={cycleForm.endDate}
                          onChange={(event) =>
                            setCycleForm((current) => ({
                              ...current,
                              endDate: event.target.value,
                            }))
                          }
                        />
                      </Field>
                    </div>
                    <div className={styles.fieldGrid}>
                      <Field label="Status">
                        <select
                          className={styles.select}
                          value={cycleForm.status}
                          onChange={(event) =>
                            setCycleForm((current) => ({
                              ...current,
                              status: event.target.value as AdmissionCycleStatus,
                            }))
                          }
                        >
                          {CYCLE_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {statusLabel(status)}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <div />
                    </div>
                    <div className={styles.buttonRow}>
                      <button
                        className={styles.buttonSecondary}
                        type="button"
                        onClick={handleCycleFormReset}
                        disabled={busy}
                      >
                        {isEditingCycle ? 'Cancel editing' : 'Clear form'}
                      </button>
                      <button className={styles.button} type="submit" disabled={busy}>
                        {busy
                          ? isEditingCycle
                            ? 'Saving changes...'
                            : 'Creating cycle...'
                          : isEditingCycle
                            ? 'Save changes'
                            : 'Create cycle'}
                      </button>
                    </div>
                  </form>
                  <div className={styles.softDivider} />
                  <div className={styles.workflowList}>
                    {workspace.cycles.items.map((cycle) => (
                      <div key={cycle.id} className={styles.workflowItem}>
                        <div className={styles.workflowStep}>
                          <span className={`${styles.pill} ${statusToneClass(cycle.status)}`}>{statusLabel(cycle.status)}</span>
                        </div>
                        <div className={styles.workflowDetail}>
                          <strong>{cycle.name}</strong>
                          <span>
                            {cycle.academicYear} · {formatDate(cycle.startDate)}{' '}
                            {cycle.endDate ? `to ${formatDate(cycle.endDate)}` : ''}
                          </span>
                        </div>
                        <div className={styles.workflowActions}>
                          <button
                            className={styles.buttonSecondarySmall}
                            type="button"
                            onClick={() => handleCycleUseInApplication(cycle)}
                            disabled={busy}
                          >
                            Use
                          </button>
                          <button
                            className={styles.buttonSecondarySmall}
                            type="button"
                            onClick={() => handleCycleEdit(cycle)}
                            disabled={busy}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.panel} ref={programmeFormRef}>
                  <div className={styles.panelHeader}>
                    <div>
                      <p className={styles.panelKicker}>Programmes</p>
                      <h2 className={styles.panelTitle}>{isEditingProgramme ? 'Edit programme' : 'Create programme'}</h2>
                    </div>
                    <span className={styles.pill}>{formatNumber(workspace.dashboard.programmes)} active</span>
                  </div>
                  {isEditingProgramme ? (
                    <div className={styles.banner}>
                      <strong>Editing programme</strong>
                      <p className={styles.helperText}>
                        Adjust the live programme details, capacity, or active state, then save the changes.
                      </p>
                    </div>
                  ) : (
                    <p className={styles.helperText}>
                      Create a new programme here or pick an existing one below to edit its code, name, capacity, or active status.
                    </p>
                  )}
                  <form className={styles.formStack} onSubmit={handleProgrammeSubmit}>
                    <div className={styles.fieldGrid}>
                      <Field label="Programme code">
                        <input
                          className={styles.input}
                          value={programmeForm.code}
                          onChange={(event) =>
                            setProgrammeForm((current) => ({
                              ...current,
                              code: event.target.value,
                            }))
                          }
                          placeholder="SCI-2026"
                        />
                      </Field>
                      <Field label="Programme name">
                        <input
                          className={styles.input}
                          value={programmeForm.name}
                          onChange={(event) =>
                            setProgrammeForm((current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                          }
                          placeholder="General Science"
                        />
                      </Field>
                    </div>
                    <div className={styles.fieldGrid}>
                      <Field label="Level">
                        <input
                          className={styles.input}
                          value={programmeForm.level}
                          onChange={(event) =>
                            setProgrammeForm((current) => ({
                              ...current,
                              level: event.target.value,
                            }))
                          }
                          placeholder="secondary"
                        />
                      </Field>
                      <Field label="Capacity">
                        <input
                          type="number"
                          min={1}
                          className={styles.input}
                          value={programmeForm.capacity}
                          onChange={(event) =>
                            setProgrammeForm((current) => ({
                              ...current,
                              capacity: event.target.value,
                            }))
                          }
                          placeholder="120"
                        />
                      </Field>
                    </div>
                    <div className={styles.fieldGrid}>
                      <Field label="Active state">
                        <select
                          className={styles.select}
                          value={programmeForm.active ? 'true' : 'false'}
                          onChange={(event) =>
                            setProgrammeForm((current) => ({
                              ...current,
                              active: event.target.value === 'true',
                            }))
                          }
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </Field>
                      <div />
                    </div>
                    <div className={styles.buttonRow}>
                      <button
                        className={styles.buttonSecondary}
                        type="button"
                        onClick={handleProgrammeFormReset}
                        disabled={busy}
                      >
                        {isEditingProgramme ? 'Cancel editing' : 'Clear form'}
                      </button>
                      <button className={styles.button} type="submit" disabled={busy}>
                        {busy
                          ? isEditingProgramme
                            ? 'Saving changes...'
                            : 'Creating programme...'
                          : isEditingProgramme
                            ? 'Save changes'
                            : 'Create programme'}
                      </button>
                    </div>
                  </form>
                  <div className={styles.softDivider} />
                  <div className={styles.workflowList}>
                    {workspace.programmes.items.map((programme) => (
                      <div key={programme.id} className={styles.workflowItem}>
                        <div className={styles.workflowStep}>
                          <span className={`${styles.pill} ${programme.active ? styles.pillSuccess : styles.pillMuted}`}>
                            {programme.code}
                          </span>
                        </div>
                        <div className={styles.workflowDetail}>
                          <strong>{programme.name}</strong>
                          <span>
                            {programme.level} · Capacity {programme.capacity} · {programme.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className={styles.workflowActions}>
                          <button
                            className={styles.buttonSecondarySmall}
                            type="button"
                            onClick={() => handleProgrammeUseInApplication(programme)}
                            disabled={busy}
                          >
                            Use
                          </button>
                          <button
                            className={styles.buttonSecondarySmall}
                            type="button"
                            onClick={() => handleProgrammeEdit(programme)}
                            disabled={busy}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          ) : (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.panelKicker}>Start here</p>
                  <h2 className={styles.sectionTitle}>
                    {tenantMode ? 'A tenant-branded portal is ready to go.' : 'A live API-backed admission UI is ready to go.'}
                  </h2>
                  <p className={styles.sectionCopy}>
                    {tenantMode
                      ? `Sign in with a ${tenantName ?? selectedTenant?.name ?? 'tenant'} account to continue the workflow on this domain.`
                      : 'The seeded admin account is `admin@educore.local` with `Password123!`. Pick a tenant from the list on the left and open the portal.'}
                  </p>
                </div>
              </div>
              <div className={styles.metricGrid}>
                <MetricCard label="Workflow" value="Intake" hint="Applicants, applications, interviews, offers, enrollment" />
                <MetricCard
                  label={tenantMode ? 'Domain' : 'API base'}
                  value={tenantMode ? selectedTenant?.slug ?? preferredTenantSlug ?? 'Tenant' : API_BASE_URL}
                  hint={
                    tenantMode
                      ? 'This page is bound to the tenant domain.'
                      : 'Edit NEXT_PUBLIC_API_BASE_URL to point at another environment'
                  }
                />
                <MetricCard
                  label={tenantMode ? 'Products' : 'Seed tenants'}
                  value={
                    tenantMode
                      ? selectedTenant?.enabledProducts.filter((product) => product !== 'platform').length ?? 0
                      : tenants.length || health?.snapshot.tenants || 0
                  }
                  hint={tenantMode ? 'Enabled products on this domain' : 'Public tenant directory for login'}
                />
              </div>
            </section>
          )}

          {workspaceLoading ? <div className={styles.banner}>Refreshing the admission portal...</div> : null}
          {booting ? <div className={styles.banner}>Bootstrapping admission access...</div> : null}
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: number | string; hint: string }) {
  return (
    <article className={styles.metricCard}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>{typeof value === 'number' ? formatNumber(value) : value}</div>
      <div className={styles.metricHint}>{hint}</div>
    </article>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
    </label>
  );
}

function Th({ children, align = 'left' }: { children: ReactNode; align?: 'left' | 'right' }) {
  return (
    <th className={`${styles.th} ${align === 'right' ? styles.alignRight : ''}`}>
      {children}
    </th>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className={styles.emptyState}>
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`${styles.pill} ${statusToneClass(status)}`}>{statusLabel(status)}</span>;
}

function ActionButton({
  children,
  onClick,
  busy,
  tone = 'neutral',
}: {
  children: ReactNode;
  onClick: () => void;
  busy: boolean;
  tone?: 'neutral' | 'danger';
}) {
  return (
    <button
      className={tone === 'danger' ? styles.buttonDangerSmall : styles.buttonSecondarySmall}
      type="button"
      onClick={onClick}
      disabled={busy}
    >
      {children}
    </button>
  );
}
