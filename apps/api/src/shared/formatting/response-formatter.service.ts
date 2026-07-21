import { Injectable } from '@nestjs/common';

import type { PaginatedResult } from '../query/query.types';

export interface ResponseEnvelope<T, TMeta extends object = Record<string, never>> {
  success: true;
  data: T;
  meta?: TMeta;
}

@Injectable()
export class ResponseFormatterService {
  success<T, TMeta extends object = Record<string, never>>(
    data: T,
    meta?: TMeta,
  ): ResponseEnvelope<T, TMeta> {
    return {
      success: true,
      data,
      meta,
    };
  }

  page<T>(result: PaginatedResult<T>): ResponseEnvelope<T[], PaginatedResult<T>['meta']> {
    return this.success(result.items, result.meta);
  }

  empty(message = 'ok') {
    return this.success({ message });
  }
}
