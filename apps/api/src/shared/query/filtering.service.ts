import { Injectable } from '@nestjs/common';

import type { QueryFilterMap } from './query.types';

@Injectable()
export class FilteringService {
  filter<T extends Record<string, unknown>>(items: T[], filters: QueryFilterMap = {}) {
    return items.filter((item) => this.matches(item, filters));
  }

  matches<T extends Record<string, unknown>>(item: T, filters: QueryFilterMap = {}) {
    return Object.entries(filters).every(([key, expected]) => {
      if (expected === undefined || expected === null || expected === '') {
        return true;
      }

      return this.matchesValue(item[key], expected);
    });
  }

  private matchesValue(actual: unknown, expected: unknown): boolean {
    if (expected === undefined || expected === null || expected === '') {
      return true;
    }

    if (Array.isArray(expected)) {
      return expected.some((candidate) => this.matchesValue(actual, candidate));
    }

    if (Array.isArray(actual)) {
      return actual.some((candidate) => this.matchesValue(candidate, expected));
    }

    if (typeof actual === 'string' && typeof expected === 'string') {
      return actual.toLowerCase().includes(expected.toLowerCase());
    }

    return this.normalizeValue(actual) === this.normalizeValue(expected);
  }

  private normalizeValue(value: unknown) {
    if (value instanceof Date) {
      return value.toISOString();
    }

    if (value === undefined || value === null) {
      return '';
    }

    return String(value).toLowerCase();
  }
}

