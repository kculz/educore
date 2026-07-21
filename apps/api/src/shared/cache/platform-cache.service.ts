import { Injectable } from '@nestjs/common';

import { CACHE_NAMESPACE } from '../constants/cache.constants';
import { buildCacheKey, resolveCacheExpiresAt } from './cache.helpers';
import type { CacheEntry } from '../interfaces/cache.interface';

@Injectable()
export class PlatformCacheService {
  private readonly namespace = CACHE_NAMESPACE;
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  key(...parts: Array<string | number | boolean | null | undefined>) {
    return buildCacheKey(this.namespace, ...parts);
  }

  get<T>(key: string) {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  has(key: string) {
    return this.get(key) !== null;
  }

  set<T>(key: string, value: T, ttlMs?: number) {
    this.cache.set(key, {
      value,
      expiresAt: resolveCacheExpiresAt(ttlMs),
    });

    return value;
  }

  remember<T>(key: string, factory: () => T, ttlMs?: number) {
    const existing = this.get<T>(key);
    if (existing !== null) {
      return existing;
    }

    const value = factory();
    this.set(key, value, ttlMs);
    return value;
  }

  delete(key: string) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  keys() {
    return Array.from(this.cache.keys());
  }
}
