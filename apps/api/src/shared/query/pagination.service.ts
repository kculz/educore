import { Injectable } from '@nestjs/common';

import type { PaginatedResult, PaginationMeta, PaginationRequest } from './query.types';

@Injectable()
export class PaginationService {
  private readonly defaultLimit = 25;
  private readonly maxLimit = 100;

  normalize(input: PaginationRequest = {}) {
    const page = this.parsePositiveInteger(input.page, 1);
    const limit = Math.min(this.parsePositiveInteger(input.limit, this.defaultLimit), this.maxLimit);
    const offset = (page - 1) * limit;

    return {
      page,
      limit,
      offset,
    };
  }

  paginate<T>(items: T[], input: PaginationRequest = {}): PaginatedResult<T> {
    const normalized = this.normalize(input);
    const total = items.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / normalized.limit);
    const sliced = items.slice(normalized.offset, normalized.offset + normalized.limit);

    return {
      items: sliced,
      meta: this.buildMeta({
        ...normalized,
        total,
        totalPages,
      }),
    };
  }

  buildMeta(input: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
  }): PaginationMeta {
    const totalPages =
      input.totalPages ?? (input.total === 0 ? 0 : Math.ceil(input.total / input.limit));

    return {
      page: input.page,
      limit: input.limit,
      total: input.total,
      totalPages,
      hasNext: input.page < totalPages,
      hasPrev: input.page > 1,
      offset: (input.page - 1) * input.limit,
    };
  }

  private parsePositiveInteger(value: number | string | undefined, fallback: number) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }

    return Math.floor(parsed);
  }
}

