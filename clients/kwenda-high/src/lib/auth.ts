'use client';

import Cookies from 'js-cookie';

const TOKEN_KEY = 'kh_access_token';
const REFRESH_KEY = 'kh_refresh_token';
const USER_KEY = 'kh_user';

export interface StoredUser {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  permissions: string[];
  roleIds: string[];
  isApplicant?: boolean;
  applicationId?: string;
  applicationStatus?: 'submitted' | 'under_review' | 'offered' | 'enrolled' | 'rejected';
}

export function saveSession(accessToken: string, refreshToken: string, user: StoredUser) {
  Cookies.set(TOKEN_KEY, accessToken, { expires: 1, sameSite: 'lax' });
  Cookies.set(REFRESH_KEY, refreshToken, { expires: 30, sameSite: 'lax' });
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function saveApplicantSession(applicant: {
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
}) {
  const mockToken = `applicant_${applicant.applicationId}`;
  const user: StoredUser = {
    id: applicant.applicationId,
    tenantId: 'miami-academy',
    email: applicant.applicantEmail,
    fullName: applicant.applicantName,
    permissions: ['admission.read'],
    roleIds: ['applicant_role'],
    isApplicant: true,
    applicationId: applicant.applicationId,
    applicationStatus: 'submitted',
  };
  Cookies.set(TOKEN_KEY, mockToken, { expires: 7, sameSite: 'lax' });
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAccessToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function hasPermission(user: StoredUser | null, permission: string): boolean {
  if (!user) return false;
  // If user is an applicant, restrict everything except admission.read until approved & enrolled
  if (user.isApplicant && user.applicationStatus !== 'enrolled') {
    return permission === 'admission.read';
  }
  return user.permissions.includes(permission) || user.permissions.includes('platform.write');
}
