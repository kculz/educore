const PLATFORM_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const PLATFORM_HOSTNAME = new URL(PLATFORM_SITE_URL).hostname.toLowerCase();

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export function resolveTenantSlugFromHostname(hostname: string | null | undefined) {
  if (!hostname) {
    return null;
  }

  const normalizedHostname = hostname.toLowerCase();
  const bareHostname = normalizedHostname.split(':')[0];

  if (LOOPBACK_HOSTS.has(bareHostname)) {
    return null;
  }

  if (bareHostname === PLATFORM_HOSTNAME) {
    return null;
  }

  const suffix = `.${PLATFORM_HOSTNAME}`;
  if (!bareHostname.endsWith(suffix)) {
    return null;
  }

  const slug = bareHostname.slice(0, -suffix.length);
  return slug.length > 0 ? slug : null;
}

export function buildTenantPath(tenantSlug: string, path = '') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `/${tenantSlug}${normalizedPath === '/' ? '' : normalizedPath}`;
}
