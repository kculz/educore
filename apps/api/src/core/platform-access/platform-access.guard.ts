import {
  Inject,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  ANONYMOUS_ROUTE_KEY,
  ACCESS_SCOPE_KEY,
  PUBLIC_ROUTE_KEY,
  type PlatformAccessScope,
} from './platform-access.decorator';
import { PlatformStateService } from '../platform-state/platform-state.service';
import { resolveProductCode, resolveTenantId } from '../../shared/helpers/request.helpers';
import type { PlatformHttpRequest } from '../../shared/interfaces/request-context.interface';

@Injectable()
export class PlatformAccessGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(PlatformStateService) private readonly platformState: PlatformStateService,
  ) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<PlatformHttpRequest>();
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
    const tenantId = resolveTenantId(request);
    if (!tenantId) {
      throw new UnauthorizedException('Missing tenant context');
    }

    const productCode = scope.productCode ?? resolveProductCode(request);
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
    const classScope = this.reflector.get<PlatformAccessScope>(ACCESS_SCOPE_KEY, context.getClass());
    const handlerScope = this.reflector.get<PlatformAccessScope>(ACCESS_SCOPE_KEY, context.getHandler());

    return {
      ...classScope,
      ...handlerScope,
    };
  }
}
