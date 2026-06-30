import { PlatformStateService } from './platform-state.service';

describe('PlatformStateService', () => {
  it('seeds the core platform entities', () => {
    const service = new PlatformStateService();
    const miami = service.getTenantBySlug('miami-academy');

    expect(service.listTenants()).toHaveLength(3);
    expect(miami).not.toBeNull();
    expect(service.getUserByEmail(miami!.id, 'admin@educore.local')).not.toBeNull();
  });

  it('supports tenant scoped licenses and products', () => {
    const service = new PlatformStateService();
    const miami = service.getTenantBySlug('miami-academy');

    expect(miami).not.toBeNull();
    expect(miami?.enabledProducts).toContain('admission');
    expect(service.isLicenseEnabled(miami!.id, 'admission')).toBe(true);
    expect(service.isLicenseEnabled(miami!.id, 'fees')).toBe(false);
  });
});
