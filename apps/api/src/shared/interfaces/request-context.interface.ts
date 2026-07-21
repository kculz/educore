import type { Request } from 'express';

export interface PlatformRequestUser {
  sub: string;
  tenantId: string;
  permissions: string[];
  tokenType?: 'access' | 'refresh';
  email?: string;
  fullName?: string;
  roleIds?: string[];
}

export interface PlatformRequestContext {
  tenantId: string;
  productCode: string;
  permission?: string;
  featureFlag?: string;
  publicRoute: boolean;
}

export interface PlatformHttpRequest extends Request {
  platformContext?: PlatformRequestContext;
  user?: PlatformRequestUser;
  requestId?: string;
}
