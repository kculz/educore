import { Injectable } from '@nestjs/common';

import type { SortOrder } from './query.types';

@Injectable()
export class SortingService {
  sort<T extends object>(items: T[], sortBy?: string, sortOrder: SortOrder = 'asc') {
    if (!sortBy) {
      return [...items];
    }

    const direction = sortOrder === 'desc' ? -1 : 1;

    return [...items].sort((left, right) => {
      const leftRecord = left as Record<string, unknown>;
      const rightRecord = right as Record<string, unknown>;
      return direction * this.compareValues(leftRecord[sortBy], rightRecord[sortBy]);
    });
  }

  private compareValues(left: unknown, right: unknown) {
    if (left === right) {
      return 0;
    }

    if (left === undefined || left === null) {
      return 1;
    }

    if (right === undefined || right === null) {
      return -1;
    }

    if (typeof left === 'number' && typeof right === 'number') {
      return left - right;
    }

    if (left instanceof Date || right instanceof Date) {
      return this.toTimestamp(left) - this.toTimestamp(right);
    }

    return String(left).localeCompare(String(right), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  }

  private toTimestamp(value: unknown) {
    if (value instanceof Date) {
      return value.getTime();
    }

    const parsed = Date.parse(String(value));
    return Number.isNaN(parsed) ? 0 : parsed;
  }
}
