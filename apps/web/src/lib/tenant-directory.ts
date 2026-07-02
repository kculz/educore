import { getPublicTenants, type ApiTenant } from './educore-api';

export async function loadPublicTenantBySlug(tenantSlug: string): Promise<ApiTenant | null> {
  const normalizedSlug = tenantSlug.trim().toLowerCase();
  if (!normalizedSlug) {
    return null;
  }

  const tenants = await getPublicTenants();
  return tenants.find((tenant) => tenant.slug.toLowerCase() === normalizedSlug) ?? null;
}
