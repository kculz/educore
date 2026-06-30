import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ANONYMOUS_ROUTE_KEY, ACCESS_SCOPE_KEY, PUBLIC_ROUTE_KEY } from './platform-access.decorator';
import { PlatformStateService } from '../platform-state/platform-state.service';
import type { JwtUserPayload } from '../platform-state/platform-state.types';

type RequestWithUser = {
  headers: Record<string, string | string[] | undefined>;
  user?: JwtUserPayload;
  platformContext?: {
    tenantId: string;
    productCode: string;
    permission?: string;
    featureFlag?: string;
    publicRoute: boolean;
  };
};

@Injectable()
export class PlatformAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly platformState: PlatformStateService,
  ) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const anonymous = this.reflector.getAllAndOverride<boolean>(ANONYMOUS_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (anonymous) {
      return true;
    }

    const publicRoute = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const scope = this.resolveScope(context);
    const tenantId = this.readHeader(request, 'x-tenant-id');
    if (!tenantId) {
      throw new UnauthorizedException('Missing tenant context');
    }

    const productCode = scope.productCode ?? this.readHeader(request, 'x-product-code') ?? 'platform';
    const tenant = this.platformState.getTenantById(tenantId);
    if (!tenant) {
      throw new UnauthorizedException('Unknown tenant');
    }

    if (tenant.status !== 'active') {
      throw new ForbiddenException('Tenant is not active');
    }

    if (!this.platformState.isProductEnabled(tenantId, productCode)) {
      throw new ForbiddenException(`Product ${productCode} is not enabled for this tenant`);
    }

    if (!this.platformState.isLicenseEnabled(tenantId, productCode)) {
      throw new ForbiddenException(`Product ${productCode} is not licensed for this tenant`);
    }

    if (scope.featureFlag && !this.platformState.getFeatureFlag(tenantId, productCode, scope.featureFlag)?.enabled) {
      throw new ForbiddenException(`Feature flag ${scope.featureFlag} is disabled`);
    }

    request.platformContext = {
      tenantId,
      productCode,
      permission: scope.permission,
      featureFlag: scope.featureFlag,
      publicRoute: Boolean(publicRoute),
    };

    if (publicRoute) {
      return true;
    }

    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }

    const permissions = new Set(request.user.permissions);
    if (scope.permission && !permissions.has(scope.permission) && !permissions.has('platform.write')) {
      throw new ForbiddenException(`Missing permission: ${scope.permission}`);
    }

    return true;
  }

  private resolveScope(context: ExecutionContext) {
    const classScope = this.reflector.get<{
      productCode?: string;
      permission?: string;
      featureFlag?: string;
    }>(ACCESS_SCOPE_KEY, context.getClass());
    const handlerScope = this.reflector.get<{
      productCode?: string;
      permission?: string;
      featureFlag?: string;
    }>(ACCESS_SCOPE_KEY, context.getHandler());

    return {
      ...classScope,
      ...handlerScope,
    };
  }

  private readHeader(request: RequestWithUser, key: string) {
    const header = request.headers[key];
    if (Array.isArray(header)) {
      return header[0] ?? '';
    }
    return header ?? '';
  }
}

