import { Injectable } from '@nestjs/common';

@Injectable()
export class PlatformUtilityService {
  slugify(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  compact<T>(values: Array<T | null | undefined | false | ''>) {
    return values.filter((value): value is T => Boolean(value));
  }

  unique<T>(values: T[]) {
    return Array.from(new Set(values));
  }

  chunk<T>(values: T[], size: number) {
    const step = Math.max(1, Math.floor(size));
    const chunks: T[][] = [];

    for (let index = 0; index < values.length; index += step) {
      chunks.push(values.slice(index, index + step));
    }

    return chunks;
  }

  toBoolean(value: unknown, fallback = false) {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value !== 0;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) {
        return true;
      }

      if (['false', '0', 'no', 'n', 'off'].includes(normalized)) {
        return false;
      }
    }

    return fallback;
  }

  toNumber(value: unknown, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  truncate(value: string, length: number, suffix = '...') {
    if (value.length <= length) {
      return value;
    }

    return `${value.slice(0, Math.max(0, length - suffix.length))}${suffix}`;
  }

  normalizeText(value: unknown) {
    return String(value ?? '').trim();
  }

  safeJsonParse<T>(value: string, fallback: T) {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
}

