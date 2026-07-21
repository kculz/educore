import { randomUUID } from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

import { REQUEST_HEADER_NAMES } from '../constants/request.constants';
import type { PlatformHttpRequest } from '../interfaces/request-context.interface';
import { trimToUndefined } from '../helpers/text.helpers';

export function requestIdMiddleware(request: Request, response: Response, next: NextFunction) {
  const platformRequest = request as PlatformHttpRequest;
  const requestId = trimToUndefined(platformRequest.header(REQUEST_HEADER_NAMES.requestId)) ?? randomUUID();

  platformRequest.requestId = requestId;
  response.setHeader(REQUEST_HEADER_NAMES.requestId, requestId);
  next();
}
