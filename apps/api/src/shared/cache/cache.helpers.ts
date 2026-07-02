import { CACHE_KEY_SEPARATOR } from '../constants/cache.constants';
import { trimToUndefined } from '../helpers/text.helpers';

export function buildCacheKey(...parts: Array<string | number | boolean | null | undefined>) {
  return parts
    .map((part) => {
      if (part === null || part === undefined) {
        return undefined;
      }

      if (typeof part === 'string') {
        return trimToUndefined(part);
      }

      return String(part);
    })
    .filter((part): part is string => part !== undefined && part.length > 0)
    .join(CACHE_KEY_SEPARATOR);
}

export function resolveCacheExpiresAt(ttlMs?: number) {
  return ttlMs && ttlMs > 0 ? Date.now() + ttlMs : null;
}
