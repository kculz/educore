import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { hashPassword } from '../auth/password.util';
import type {
  JwtUserPayload,
  PlatformAuditLog,
  PlatformFeatureFlag,
  PlatformLicense,
  PlatformNotification,
  PlatformPermission,
  PlatformProduct,
  PlatformQueueJob,
  PlatformRole,
  PlatformSetting,
  PlatformSnapshot,
  PlatformStorageObject,
  PlatformTenant,
  PlatformUser,
} from './platform-state.types';

function now() {
  return new Date().toISOString();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

@Injectable()
export class PlatformStateService {
  private readonly tenants = new Map<string, PlatformTenant>();
  private readonly roles = new Map<string, PlatformRole>();
  private readonly permissions = new Map<string, PlatformPermission>();
  private readonly products = new Map<string, PlatformProduct>();
  private readonly licenses = new Map<string, PlatformLicense>();
  private readonly users = new Map<string, PlatformUser>();
  private readonly featureFlags = new Map<string, PlatformFeatureFlag>();
  private readonly audits: PlatformAuditLog[] = [];
  private readonly notifications: PlatformNotification[] = [];
  private readonly settings = new Map<string, PlatformSetting>();
  private readonly storageObjects = new Map<string, PlatformStorageObject>();
  private readonly queueJobs: PlatformQueueJob[] = [];

  constructor() {
    this.seed();
  }

  snapshot(): PlatformSnapshot {
    return {
      tenants: this.tenants.size,
      users: this.users.size,
      roles: this.roles.size,
      permissions: this.permissions.size,
      products: this.products.size,
      licenses: this.licenses.size,
      featureFlags: this.featureFlags.size,
      audits: this.audits.length,
      notifications: this.notifications.length,
      storageObjects: this.storageObjects.size,
      queueJobs: this.queueJobs.length,
      settings: this.settings.size,
    };
  }

  listTenants() {
    return Array.from(this.tenants.values()).map(clone);
  }

  getTenantById(id: string) {
    const tenant = this.tenants.get(id);
    return tenant ? clone(tenant) : null;
  }

  getTenantBySlug(slug: string) {
    const tenant = Array.from(this.tenants.values()).find((candidate) => candidate.slug === slug);
    return tenant ? clone(tenant) : null;
  }

  createTenant(input: Pick<PlatformTenant, 'slug' | 'name'>) {
    if (this.getTenantBySlug(input.slug)) {
      throw new ConflictException(`Tenant slug already exists: ${input.slug}`);
    }

    const tenant: PlatformTenant = {
      id: randomUUID(),
      slug: input.slug,
      name: input.name,
      status: 'active',
      enabledProducts: ['platform'],
      featureFlags: {},
      createdAt: now(),
      updatedAt: now(),
    };

    this.tenants.set(tenant.id, tenant);
    this.setLicense(tenant.id, 'platform', true, null);
    this.recordAudit({
      tenantId: tenant.id,
      userId: null,
      action: 'tenant.created',
      resource: 'tenant',
      metadata: { name: tenant.name, slug: tenant.slug },
    });
    return clone(tenant);
  }

  updateTenantProducts(tenantId: string, products: string[]) {
    const tenant = this.mustGetTenant(tenantId);
    tenant.enabledProducts = Array.from(new Set(['platform', ...products]));
    tenant.updatedAt = now();
    this.tenants.set(tenantId, tenant);
    this.recordAudit({
      tenantId,
      userId: null,
      action: 'tenant.products.updated',
      resource: 'tenant',
      metadata: { products: tenant.enabledProducts },
    });
    return clone(tenant);
  }

  listUsers(tenantId?: string) {
    return Array.from(this.users.values())
      .filter((user) => (tenantId ? user.tenantId === tenantId : true))
      .map(clone);
  }

  getUserById(id: string) {
    const user = this.users.get(id);
    return user ? clone(user) : null;
  }

  getUserByEmail(tenantId: string, email: string) {
    const normalizedEmail = email.toLowerCase();
    const user = Array.from(this.users.values()).find(
      (candidate) => candidate.tenantId === tenantId && candidate.email === normalizedEmail,
    );
    return user ? clone(user) : null;
  }

  createUser(input: {
    tenantId: string;
    email: string;
    fullName: string;
    password: string;
    roleIds?: string[];
  }) {
    if (this.getUserByEmail(input.tenantId, input.email)) {
      throw new ConflictException(`User already exists for tenant: ${input.email}`);
    }

    const digest = hashPassword(input.password);
    const user: PlatformUser = {
      id: randomUUID(),
      tenantId: input.tenantId,
      email: input.email.toLowerCase(),
      fullName: input.fullName,
      status: 'active',
      roleIds: input.roleIds ?? [],
      passwordSalt: digest.salt,
      passwordHash: digest.hash,
      createdAt: now(),
      updatedAt: now(),
      lastLoginAt: null,
      refreshTokenJti: null,
      refreshTokenExpiresAt: null,
    };

    this.users.set(user.id, user);
    this.recordAudit({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'user.created',
      resource: 'user',
      metadata: { email: user.email, fullName: user.fullName },
    });
    return clone(user);
  }

  updateUser(userId: string, input: Partial<Pick<PlatformUser, 'fullName' | 'status' | 'roleIds'>>) {
    const user = this.mustGetUser(userId);
    if (input.fullName !== undefined) user.fullName = input.fullName;
    if (input.status !== undefined) user.status = input.status;
    if (input.roleIds !== undefined) user.roleIds = [...input.roleIds];
    user.updatedAt = now();
    this.users.set(userId, user);
    this.recordAudit({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'user.updated',
      resource: 'user',
      metadata: { fullName: user.fullName, status: user.status, roleIds: user.roleIds },
    });
    return clone(user);
  }

  markUserLogin(userId: string) {
    const user = this.mustGetUser(userId);
    user.lastLoginAt = now();
    user.updatedAt = now();
    this.users.set(userId, user);
    return clone(user);
  }

  listRoles(tenantId?: string) {
    return Array.from(this.roles.values())
      .filter((role) => (tenantId ? role.tenantId === tenantId : true))
      .map(clone);
  }

  getRoleById(id: string) {
    const role = this.roles.get(id);
    return role ? clone(role) : null;
  }

  getRoleByCode(tenantId: string | null, code: string) {
    const role = Array.from(this.roles.values()).find(
      (candidate) => candidate.tenantId === tenantId && candidate.code === code,
    );
    return role ? clone(role) : null;
  }

  createRole(input: { tenantId: string | null; code: string; name: string; permissions: string[] }) {
    if (this.getRoleByCode(input.tenantId, input.code)) {
      throw new ConflictException(`Role code already exists: ${input.code}`);
    }

    const role: PlatformRole = {
      id: randomUUID(),
      tenantId: input.tenantId,
      code: input.code,
      name: input.name,
      permissions: [...new Set(input.permissions)],
      createdAt: now(),
      updatedAt: now(),
    };
    this.roles.set(role.id, role);
    this.recordAudit({
      tenantId: role.tenantId,
      userId: null,
      action: 'role.created',
      resource: 'role',
      metadata: { code: role.code, name: role.name },
    });
    return clone(role);
  }

  updateRole(roleId: string, input: Partial<Pick<PlatformRole, 'name' | 'permissions'>>) {
    const role = this.mustGetRole(roleId);
    if (input.name !== undefined) role.name = input.name;
    if (input.permissions !== undefined) role.permissions = [...new Set(input.permissions)];
    role.updatedAt = now();
    this.roles.set(roleId, role);
    this.recordAudit({
      tenantId: role.tenantId,
      userId: null,
      action: 'role.updated',
      resource: 'role',
      metadata: { code: role.code, permissions: role.permissions },
    });
    return clone(role);
  }

  listPermissions() {
    return Array.from(this.permissions.values()).map(clone);
  }

  listProducts() {
    return Array.from(this.products.values()).map(clone);
  }

  getProduct(code: string) {
    const product = this.products.get(code);
    return product ? clone(product) : null;
  }

  listLicenses(tenantId?: string) {
    return Array.from(this.licenses.values())
      .filter((license) => (tenantId ? license.tenantId === tenantId : true))
      .map(clone);
  }

  getLicense(tenantId: string, productCode: string) {
    const license = this.licenses.get(this.licenseKey(tenantId, productCode));
    return license ? clone(license) : null;
  }

  setLicense(tenantId: string, productCode: string, enabled: boolean, expiresAt: string | null) {
    const normalizedEnabled = productCode === 'platform' ? true : enabled;
    const license: PlatformLicense = {
      tenantId,
      productCode,
      enabled: normalizedEnabled,
      expiresAt,
    };
    this.licenses.set(this.licenseKey(tenantId, productCode), license);
    this.recordAudit({
      tenantId,
      userId: null,
      action: 'license.updated',
      resource: 'license',
      metadata: { productCode, enabled: normalizedEnabled, expiresAt },
    });
    return clone(license);
  }

  isProductEnabled(tenantId: string, productCode: string) {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return false;
    }

    if (productCode === 'platform') {
      return true;
    }

    return tenant.enabledProducts.includes(productCode);
  }

  isLicenseEnabled(tenantId: string, productCode: string) {
    if (productCode === 'platform') {
      return Boolean(this.tenants.get(tenantId));
    }

    const license = this.licenses.get(this.licenseKey(tenantId, productCode));
    if (!license) {
      return false;
    }

    if (!license.enabled) {
      return false;
    }

    if (!license.expiresAt) {
      return true;
    }

    return new Date(license.expiresAt).getTime() > Date.now();
  }

  listFeatureFlags(tenantId?: string, productCode?: string) {
    return Array.from(this.featureFlags.values())
      .filter((flag) => (tenantId ? flag.tenantId === tenantId : true))
      .filter((flag) => (productCode ? flag.productCode === productCode : true))
      .map(clone);
  }

  getFeatureFlag(tenantId: string, productCode: string, key: string) {
    const flag = this.featureFlags.get(this.featureKey(tenantId, productCode, key));
    return flag ? clone(flag) : null;
  }

  setFeatureFlag(tenantId: string, productCode: string, key: string, enabled: boolean) {
    const featureFlag: PlatformFeatureFlag = {
      key,
      tenantId,
      productCode,
      enabled,
      createdAt: now(),
      updatedAt: now(),
    };
    this.featureFlags.set(this.featureKey(tenantId, productCode, key), featureFlag);
    this.recordAudit({
      tenantId,
      userId: null,
      action: 'feature.updated',
      resource: 'feature-flag',
      metadata: { productCode, key, enabled },
    });
    return clone(featureFlag);
  }

  listAudits(tenantId?: string) {
    return clone(
      this.audits.filter((entry) => (tenantId ? entry.tenantId === tenantId : true)),
    );
  }

  recordAudit(input: {
    tenantId: string | null;
    userId: string | null;
    action: string;
    resource: string;
    metadata: Record<string, unknown>;
  }) {
    const audit: PlatformAuditLog = {
      id: randomUUID(),
      tenantId: input.tenantId,
      userId: input.userId,
      action: input.action,
      resource: input.resource,
      metadata: input.metadata,
      createdAt: now(),
    };
    this.audits.unshift(audit);
    return clone(audit);
  }

  listNotifications(tenantId?: string) {
    return clone(
      this.notifications.filter((notification) =>
        tenantId ? notification.tenantId === tenantId : true,
      ),
    );
  }

  createNotification(input: {
    tenantId: string;
    recipient: string;
    subject: string;
    template: string;
    payload: Record<string, unknown>;
    channel?: 'email';
  }) {
    const notification: PlatformNotification = {
      id: randomUUID(),
      tenantId: input.tenantId,
      channel: input.channel ?? 'email',
      recipient: input.recipient,
      subject: input.subject,
      template: input.template,
      payload: input.payload,
      status: 'queued',
      createdAt: now(),
      sentAt: null,
    };
    this.notifications.unshift(notification);
    this.recordAudit({
      tenantId: input.tenantId,
      userId: null,
      action: 'notification.created',
      resource: 'notification',
      metadata: { recipient: input.recipient, template: input.template },
    });
    return clone(notification);
  }

  markNotificationSent(id: string) {
    const notification = this.notifications.find((entry) => entry.id === id);
    if (!notification) {
      return null;
    }
    notification.status = 'sent';
    notification.sentAt = now();
    return clone(notification);
  }

  listSettings(tenantId?: string) {
    return Array.from(this.settings.values())
      .filter((setting) => (tenantId ? setting.tenantId === tenantId : true))
      .map(clone);
  }

  getSetting(key: string, tenantId: string | null = null) {
    const setting = this.settings.get(this.settingKey(tenantId, key));
    return setting ? clone(setting) : null;
  }

  setSetting(key: string, value: string, tenantId: string | null = null) {
    const setting: PlatformSetting = {
      key,
      tenantId,
      value,
      updatedAt: now(),
    };
    this.settings.set(this.settingKey(tenantId, key), setting);
    this.recordAudit({
      tenantId,
      userId: null,
      action: 'setting.updated',
      resource: 'setting',
      metadata: { key, value },
    });
    return clone(setting);
  }

  listStorageObjects(tenantId?: string) {
    return Array.from(this.storageObjects.values())
      .filter((object) => (tenantId ? object.tenantId === tenantId : true))
      .map(clone);
  }

  saveStorageObject(input: {
    tenantId: string;
    filename: string;
    contentType: string;
    size: number;
    path: string;
  }) {
    const object: PlatformStorageObject = {
      id: randomUUID(),
      tenantId: input.tenantId,
      filename: input.filename,
      contentType: input.contentType,
      size: input.size,
      path: input.path,
      createdAt: now(),
    };
    this.storageObjects.set(object.id, object);
    this.recordAudit({
      tenantId: input.tenantId,
      userId: null,
      action: 'storage.saved',
      resource: 'storage',
      metadata: { filename: input.filename, contentType: input.contentType, size: input.size },
    });
    return clone(object);
  }

  getStorageObject(id: string) {
    const object = this.storageObjects.get(id);
    return object ? clone(object) : null;
  }

  recordQueueJob(input: {
    queue: string;
    name: string;
    tenantId: string | null;
    payload: Record<string, unknown>;
    status?: 'queued' | 'processed' | 'failed';
  }) {
    const job: PlatformQueueJob = {
      id: randomUUID(),
      queue: input.queue,
      name: input.name,
      tenantId: input.tenantId,
      payload: input.payload,
      status: input.status ?? 'queued',
      createdAt: now(),
    };
    this.queueJobs.unshift(job);
    this.recordAudit({
      tenantId: input.tenantId,
      userId: null,
      action: 'queue.job.created',
      resource: 'queue',
      metadata: { queue: input.queue, name: input.name },
    });
    return clone(job);
  }

  listQueueJobs(queue?: string) {
    return clone(this.queueJobs.filter((job) => (queue ? job.queue === queue : true)));
  }

  getJwtUserPayload(user: PlatformUser): JwtUserPayload {
    const permissions = new Set<string>();
    for (const roleId of user.roleIds) {
      const role = this.roles.get(roleId);
      if (!role) continue;
      for (const permission of role.permissions) {
        permissions.add(permission);
      }
    }

    return {
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      fullName: user.fullName,
      roleIds: [...user.roleIds],
      permissions: [...permissions],
      tokenType: 'access',
    };
  }

  setRefreshToken(userId: string, jti: string, expiresAt: string) {
    const user = this.mustGetUser(userId);
    user.refreshTokenJti = jti;
    user.refreshTokenExpiresAt = expiresAt;
    user.updatedAt = now();
    this.users.set(userId, user);
    return clone(user);
  }

  clearRefreshToken(userId: string) {
    const user = this.mustGetUser(userId);
    user.refreshTokenJti = null;
    user.refreshTokenExpiresAt = null;
    user.updatedAt = now();
    this.users.set(userId, user);
    return clone(user);
  }

  seed() {
    const permissionDefs: Array<PlatformPermission> = [
      { key: 'platform.read', description: 'Read platform services', module: 'platform' },
      { key: 'platform.write', description: 'Write platform services', module: 'platform' },
      { key: 'tenants.read', description: 'Read tenants', module: 'tenants' },
      { key: 'tenants.write', description: 'Write tenants', module: 'tenants' },
      { key: 'users.read', description: 'Read users', module: 'users' },
      { key: 'users.write', description: 'Write users', module: 'users' },
      { key: 'roles.read', description: 'Read roles', module: 'roles' },
      { key: 'roles.write', description: 'Write roles', module: 'roles' },
      { key: 'permissions.read', description: 'Read permissions', module: 'permissions' },
      { key: 'products.read', description: 'Read products', module: 'products' },
      { key: 'products.write', description: 'Write products', module: 'products' },
      { key: 'licenses.read', description: 'Read licenses', module: 'licensing' },
      { key: 'licenses.write', description: 'Write licenses', module: 'licensing' },
      { key: 'features.read', description: 'Read feature flags', module: 'feature-flags' },
      { key: 'features.write', description: 'Write feature flags', module: 'feature-flags' },
      { key: 'audits.read', description: 'Read audit logs', module: 'audit' },
      { key: 'notifications.read', description: 'Read notifications', module: 'notifications' },
      { key: 'notifications.write', description: 'Write notifications', module: 'notifications' },
      { key: 'storage.read', description: 'Read storage objects', module: 'storage' },
      { key: 'storage.write', description: 'Write storage objects', module: 'storage' },
      { key: 'settings.read', description: 'Read settings', module: 'settings' },
      { key: 'settings.write', description: 'Write settings', module: 'settings' },
      { key: 'dashboard.read', description: 'Read dashboard metrics', module: 'dashboard' },
      { key: 'reports.read', description: 'Read reports', module: 'reporting' },
      { key: 'admission.read', description: 'Read admission data', module: 'admission' },
      { key: 'admission.write', description: 'Write admission data', module: 'admission' },
      { key: 'queues.read', description: 'Read queues', module: 'queues' },
      { key: 'queues.write', description: 'Write queues', module: 'queues' },
      { key: 'emails.write', description: 'Send emails', module: 'email' },
      { key: 'health.read', description: 'Read health checks', module: 'health' },
      { key: 'auth.me', description: 'Read own auth profile', module: 'auth' },
    ];
    for (const permission of permissionDefs) {
      this.permissions.set(permission.key, permission);
    }

    const products: PlatformProduct[] = [
      { code: 'platform', name: 'Platform Core', description: 'Shared platform services', version: '1.0.0' },
      { code: 'admission', name: 'Admission', description: 'Admissions workflow', version: '1.0.0' },
      { code: 'fees', name: 'Fees', description: 'Billing and payments', version: '1.0.0' },
      { code: 'procurement', name: 'Procurement', description: 'Supplier and purchase workflow', version: '1.0.0' },
    ];
    for (const product of products) {
      this.products.set(product.code, product);
    }

    const adminRole = this.createRole({
      tenantId: null,
      code: 'platform_admin',
      name: 'Platform Administrator',
      permissions: permissionDefs.map((permission) => permission.key),
    });
    const tenantAdminRole = this.createRole({
      tenantId: null,
      code: 'tenant_admin',
      name: 'Tenant Administrator',
      permissions: [
        'platform.read',
        'tenants.read',
        'users.read',
        'users.write',
        'roles.read',
        'permissions.read',
        'products.read',
        'licenses.read',
        'features.read',
        'features.write',
        'audits.read',
        'notifications.read',
        'notifications.write',
        'storage.read',
        'storage.write',
        'settings.read',
        'settings.write',
        'dashboard.read',
        'reports.read',
        'admission.read',
        'admission.write',
        'queues.read',
        'emails.write',
        'health.read',
        'auth.me',
      ],
    });

    const miami = this.createTenant({
      slug: 'miami-academy',
      name: 'Miami Academy',
    });
    const eastern = this.createTenant({
      slug: 'eastern-heights-college',
      name: 'Eastern Heights College',
    });
    const abc = this.createTenant({
      slug: 'abc-manufacturing',
      name: 'ABC Manufacturing',
    });

    this.updateTenantProducts(miami.id, ['platform', 'admission', 'procurement']);
    this.updateTenantProducts(eastern.id, ['platform', 'admission', 'procurement']);
    this.updateTenantProducts(abc.id, ['platform', 'procurement']);

    this.setLicense(miami.id, 'admission', true, null);
    this.setLicense(miami.id, 'fees', false, null);
    this.setLicense(miami.id, 'procurement', true, null);

    this.setLicense(eastern.id, 'admission', true, null);
    this.setLicense(eastern.id, 'procurement', true, null);

    this.setLicense(abc.id, 'procurement', true, null);

    this.setFeatureFlag(miami.id, 'platform', 'dashboard', true);
    this.setFeatureFlag(miami.id, 'platform', 'reporting', true);
    this.setFeatureFlag(miami.id, 'platform', 'notifications', true);
    this.setFeatureFlag(miami.id, 'platform', 'queues', true);

    this.setFeatureFlag(miami.id, 'admission', 'applications', true);
    this.setFeatureFlag(miami.id, 'procurement', 'purchases', true);

    this.setSetting('support.email', 'support@educore.local');
    this.setSetting('platform.version', '0.1.0');

    const adminPassword = hashPassword('Password123!');
    const adminUser: PlatformUser = {
      id: randomUUID(),
      tenantId: miami.id,
      email: 'admin@educore.local',
      fullName: 'Platform Admin',
      status: 'active',
      roleIds: [adminRole.id, tenantAdminRole.id],
      passwordSalt: adminPassword.salt,
      passwordHash: adminPassword.hash,
      createdAt: now(),
      updatedAt: now(),
      lastLoginAt: null,
      refreshTokenJti: null,
      refreshTokenExpiresAt: null,
    };
    this.users.set(adminUser.id, adminUser);
    this.markUserLogin(adminUser.id);

    this.recordAudit({
      tenantId: miami.id,
      userId: adminUser.id,
      action: 'system.seeded',
      resource: 'platform',
      metadata: { message: 'Initial EduCore seed data created' },
    });
  }

  mustGetTenant(id: string) {
    const tenant = this.tenants.get(id);
    if (!tenant) {
      throw new Error(`Unknown tenant: ${id}`);
    }
    return tenant;
  }

  mustGetUser(id: string) {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`Unknown user: ${id}`);
    }
    return user;
  }

  mustGetRole(id: string) {
    const role = this.roles.get(id);
    if (!role) {
      throw new Error(`Unknown role: ${id}`);
    }
    return role;
  }

  private licenseKey(tenantId: string, productCode: string) {
    return `${tenantId}:${productCode}`;
  }

  private featureKey(tenantId: string, productCode: string, key: string) {
    return `${tenantId}:${productCode}:${key}`;
  }

  private settingKey(tenantId: string | null, key: string) {
    return `${tenantId ?? 'platform'}:${key}`;
  }
}
