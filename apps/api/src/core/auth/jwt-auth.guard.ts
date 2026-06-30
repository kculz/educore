import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

import { ANONYMOUS_ROUTE_KEY, PUBLIC_ROUTE_KEY } from '../platform-access/platform-access.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
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
    if (publicRoute) {
      return true;
    }

    return super.canActivate(context);
  }
}
