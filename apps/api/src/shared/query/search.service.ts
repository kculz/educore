import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchService {
  search<T extends object>(items: T[], term: string, fields?: string[]) {
    const normalizedTerm = term.trim().toLowerCase();
    if (!normalizedTerm) {
      return [...items];
    }

    return items.filter((item) => {
      const record = item as Record<string, unknown>;
      const haystack = fields && fields.length > 0 ? fields : Object.keys(record);
      return haystack.some((field) => this.valueContains(record[field], normalizedTerm));
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
