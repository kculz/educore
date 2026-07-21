export interface PlatformTenant {
  id: string;
  slug: string;
  name: string;
  status: 'active' | 'suspended';
  enabledProducts: string[];
  featureFlags: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformRole {
  id: string;
  tenantId: string | null;
  code: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PlatformPermission {
  key: string;
  description: string;
  module: string;
}

export interface PlatformProduct {
  code: string;
  name: string;
  description: string;
  version: string;
}

export interface PlatformLicense {
  tenantId: string;
  productCode: string;
  enabled: boolean;
  expiresAt: string | null;
}

export interface PlatformUser {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  status: 'active' | 'invited' | 'disabled';
  roleIds: string[];
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  refreshTokenJti: string | null;
  refreshTokenExpiresAt: string | null;
  mfaEnabled?: boolean;
  mfaSecret?: string | null;
  backupCodes?: string[];
}

export interface PlatformFeatureFlag {
  key: string;
  tenantId: string;
  productCode: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformAuditLog {
  id: string;
  tenantId: string | null;
  userId: string | null;
  action: string;
  resource: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface PlatformNotification {
  id: string;
  tenantId: string;
  channel: 'email';
  recipient: string;
  subject: string;
  template: string;
  payload: Record<string, unknown>;
  status: 'queued' | 'sent' | 'failed';
  createdAt: string;
  sentAt: string | null;
}

export interface PlatformSetting {
  key: string;
  tenantId: string | null;
  value: string;
  updatedAt: string;
}

export interface PlatformStorageObject {
  id: string;
  tenantId: string;
  filename: string;
  contentType: string;
  size: number;
  path: string;
  createdAt: string;
}

export interface PlatformQueueJob {
  id: string;
  queue: string;
  name: string;
  tenantId: string | null;
  payload: Record<string, unknown>;
  status: 'queued' | 'processed' | 'failed';
  createdAt: string;
}

export interface PlatformSnapshot {
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
}

export interface JwtUserPayload {
  sub: string;
  tenantId: string;
  email: string;
  fullName: string;
  roleIds: string[];
  permissions: string[];
  tokenType: 'access';
}

export interface JwtRefreshPayload {
  sub: string;
  tenantId: string;
  tokenType: 'refresh';
  jti: string;
}

