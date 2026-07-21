import { REQUEST_HEADER_NAMES } from '../constants/request.constants';
import type { PlatformHttpRequest } from '../interfaces/request-context.interface';
import { trimToNull } from './text.helpers';

type RequestLike = Pick<PlatformHttpRequest, 'header' | 'platformContext' | 'requestId' | 'user'>;

export function resolveTenantId(request: Pick<RequestLike, 'header' | 'platformContext'>) {
  return trimToNull(request.platformContext?.tenantId ?? request.header(REQUEST_HEADER_NAMES.tenantId));
}

export function resolveProductCode(
  request: Pick<RequestLike, 'header' | 'platformContext'>,
  fallback = 'platform',
) {
  return trimToNull(request.platformContext?.productCode ?? request.header(REQUEST_HEADER_NAMES.productCode)) ?? fallback;
}

export function resolveUserId(request: Pick<RequestLike, 'user'>) {
  return trimToNull(request.user?.sub);
}

export function resolveRequestId(request: Pick<RequestLike, 'header' | 'requestId'>) {
  return trimToNull(request.requestId ?? request.header(REQUEST_HEADER_NAMES.requestId));
}
