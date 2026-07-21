import { Injectable } from '@nestjs/common';
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';

import { finalize } from 'rxjs';

import { resolveRequestId } from '../helpers/request.helpers';
import type { PlatformHttpRequest } from '../interfaces/request-context.interface';

@Injectable()
export class RequestTimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<PlatformHttpRequest>();
    const startedAt = Date.now();
    return next.handle().pipe(
      finalize(() => {
        if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_REQUEST_TIMING === 'true') {
          const requestId = resolveRequestId(request) ?? 'unknown';
          const path = request.originalUrl ?? request.url ?? '';
          console.debug(`[request:${requestId}] ${request.method} ${path} ${Date.now() - startedAt}ms`);
        }
      }),
    );
  }
}
