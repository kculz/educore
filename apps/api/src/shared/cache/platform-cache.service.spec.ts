import { PlatformCacheService } from './platform-cache.service';

describe('PlatformCacheService', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('builds namespaced cache keys', () => {
    const service = new PlatformCacheService();

    expect(service.key('tenant', 'users')).toBe('educore:tenant:users');
  });

  it('stores and expires values', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const service = new PlatformCacheService();
    service.set('token', 'value', 1000);

    expect(service.get('token')).toBe('value');

    jest.advanceTimersByTime(1001);

    expect(service.get('token')).toBeNull();
  });
});
