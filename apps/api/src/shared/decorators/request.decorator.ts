import { createParamDecorator } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';

import {
  resolveProductCode,
  resolveRequestId,
  resolveTenantId,
  resolveUserId,
} from '../helpers/request.helpers';
import type { PlatformHttpRequest, PlatformRequestContext } from '../interfaces/request-context.interface';

function readRequest(context: ExecutionContext) {
  return context.switchToHttp().getRequest<PlatformHttpRequest>();
}

export const PlatformRequest = createParamDecorator((_, context: ExecutionContext) => readRequest(context));

export const PlatformContext = createParamDecorator(
  (_, context: ExecutionContext): PlatformRequestContext | undefined => readRequest(context).platformContext,
);

export const CurrentTenantId = createParamDecorator((_, context: ExecutionContext) =>
  resolveTenantId(readRequest(context)),
);

export const CurrentUserId = createParamDecorator((_, context: ExecutionContext) =>
  resolveUserId(readRequest(context)),
);

export const CurrentProductCode = createParamDecorator((_, context: ExecutionContext) =>
  resolveProductCode(readRequest(context)),
);

export const CurrentRequestId = createParamDecorator((_, context: ExecutionContext) =>
  resolveRequestId(readRequest(context)),
);
