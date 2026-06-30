import { Injectable } from '@nestjs/common';

export interface PlatformConfigValues {
  appName: string;
  nodeEnv: string;
  apiPort: number;
  webPort: number;
  tenantHeader: string;
  productHeader: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;
  redisUrl: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpFrom: string;
  storageRoot: string;
  logLevel: string;
}

@Injectable()
export class PlatformConfigService {
  private readonly values: PlatformConfigValues = this.load();

  get appName() {
    return this.values.appName;
  }

  get nodeEnv() {
    return this.values.nodeEnv;
  }

  get apiPort() {
    return this.values.apiPort;
  }

  get webPort() {
    return this.values.webPort;
  }

  get tenantHeader() {
    return this.values.tenantHeader;
  }

  get productHeader() {
    return this.values.productHeader;
  }

  get jwtAccessSecret() {
    return this.values.jwtAccessSecret;
  }

  get jwtRefreshSecret() {
    return this.values.jwtRefreshSecret;
  }

  get jwtAccessExpiresIn() {
    return this.values.jwtAccessExpiresIn;
  }

  get jwtRefreshExpiresIn() {
    return this.values.jwtRefreshExpiresIn;
  }

  get redisUrl() {
    return this.values.redisUrl;
  }

  get smtpHost() {
    return this.values.smtpHost;
  }

  get smtpPort() {
    return this.values.smtpPort;
  }

  get smtpUser() {
    return this.values.smtpUser;
  }

  get smtpPassword() {
    return this.values.smtpPassword;
  }

  get smtpFrom() {
    return this.values.smtpFrom;
  }

  get storageRoot() {
    return this.values.storageRoot;
  }

  get logLevel() {
    return this.values.logLevel;
  }

  snapshot() {
    return { ...this.values };
  }

  private load(): PlatformConfigValues {
    const nodeEnv = process.env.NODE_ENV ?? 'development';
    return {
      appName: process.env.APP_NAME ?? 'EduCore API',
      nodeEnv,
      apiPort: this.readNumber(process.env.API_PORT, 3001),
      webPort: this.readNumber(process.env.WEB_PORT, 3000),
      tenantHeader: process.env.TENANT_HEADER ?? 'x-tenant-id',
      productHeader: process.env.PRODUCT_HEADER ?? 'x-product-code',
      jwtAccessSecret: this.readSecret('JWT_ACCESS_SECRET', 'educore-access-secret'),
      jwtRefreshSecret: this.readSecret('JWT_REFRESH_SECRET', 'educore-refresh-secret'),
      jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
      redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
      smtpHost: process.env.SMTP_HOST ?? '',
      smtpPort: this.readNumber(process.env.SMTP_PORT, 587),
      smtpUser: process.env.SMTP_USER ?? '',
      smtpPassword: process.env.SMTP_PASSWORD ?? '',
      smtpFrom: process.env.SMTP_FROM ?? 'EduCore <no-reply@educore.local>',
      storageRoot: process.env.STORAGE_ROOT ?? '/private/tmp/educore-storage',
      logLevel: process.env.LOG_LEVEL ?? 'info',
    };
  }

  private readNumber(value: string | undefined, fallback: number) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private readSecret(name: string, fallback: string) {
    const value = process.env[name];
    if (value && value.trim().length > 0) {
      return value;
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable: ${name}`);
    }

    return fallback;
  }
}

