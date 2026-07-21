'use client';

import Cookies from 'js-cookie';

const TOKEN_KEY = 'educore_saas_access_token';
const REFRESH_KEY = 'educore_saas_refresh_token';
const USER_KEY = 'educore_saas_user';

export interface StoredAdminUser {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  permissions: string[];
  roleIds: string[];
  mfaEnabled?: boolean;
}

export function saveAdminSession(accessToken: string, refreshToken: string, user: StoredAdminUser) {
  Cookies.set(TOKEN_KEY, accessToken, { expires: 1, sameSite: 'lax' });
  Cookies.set(REFRESH_KEY, refreshToken, { expires: 30, sameSite: 'lax' });
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAdminAccessToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function getStoredAdminUser(): StoredAdminUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredAdminUser) : null;
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function hasAdminPermission(user: StoredAdminUser | null, permission: string): boolean {
  if (!user) return false;
  return user.permissions.includes(permission) || user.permissions.includes('platform.write');
}
