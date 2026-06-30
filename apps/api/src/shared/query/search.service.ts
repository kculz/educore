import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchService {
  search<T extends Record<string, unknown>>(items: T[], term: string, fields?: string[]) {
    const normalizedTerm = term.trim().toLowerCase();
    if (!normalizedTerm) {
      return [...items];
    }

    return items.filter((item) => {
      const haystack = fields && fields.length > 0 ? fields : Object.keys(item);
      return haystack.some((field) => this.valueContains(item[field], normalizedTerm));
    });
  }

  private valueContains(value: unknown, needle: string): boolean {
    if (value === undefined || value === null) {
      return false;
    }

    if (Array.isArray(value)) {
      return value.some((entry) => this.valueContains(entry, needle));
    }

    if (typeof value === 'object') {
      return JSON.stringify(value).toLowerCase().includes(needle);
    }

    return String(value).toLowerCase().includes(needle);
  }
}

