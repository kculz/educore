'use client';

import Cookies from 'js-cookie';

const TENANT_COOKIE_KEY = 'educore_active_tenant';

export interface SchoolTenant {
  slug: string;
  name: string;
  subdomain: string;
  status: 'active' | 'suspended';
  enabledProducts: string[];
}

export const KNOWN_SCHOOLS: SchoolTenant[] = [
  { slug: 'kwenda-high', name: 'Kwenda High School', subdomain: 'kwenda-high.portal.educore.co.zw', status: 'active', enabledProducts: ['platform', 'admission', 'fees', 'procurement'] },
  { slug: 'miami-academy', name: 'Miami Academy', subdomain: 'miami-academy.portal.educore.co.zw', status: 'active', enabledProducts: ['platform', 'admission', 'fees', 'procurement'] },
  { slug: 'eastern-heights', name: 'Eastern Heights College', subdomain: 'eastern-heights.portal.educore.co.zw', status: 'active', enabledProducts: ['platform', 'admission', 'procurement'] },
];

export function getActiveTenantSlug(): string {
  if (typeof window !== 'undefined') {
    // 1. Check subdomain (e.g. kwenda-high.portal.educore.co.zw)
    const host = window.location.hostname;
    const parts = host.split('.');
    if (parts.length >= 4 && parts[0] !== 'www' && parts[0] !== 'localhost') {
      return parts[0];
    }
    // 2. Check query string ?tenant=kwenda-high
    const urlParams = new URLSearchParams(window.location.search);
    const queryTenant = urlParams.get('tenant');
    if (queryTenant) return queryTenant;

    // 3. Check cookie
    const cookieTenant = Cookies.get(TENANT_COOKIE_KEY);
    if (cookieTenant) return cookieTenant;
  }
  return 'kwenda-high';
}

export function setActiveTenantSlug(slug: string) {
  Cookies.set(TENANT_COOKIE_KEY, slug, { expires: 30, sameSite: 'lax' });
}

export function getActiveSchool(): SchoolTenant {
  const slug = getActiveTenantSlug();
  return KNOWN_SCHOOLS.find(s => s.slug === slug) ?? {
    slug,
    name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' School',
    subdomain: `${slug}.portal.educore.co.zw`,
    status: 'active',
    enabledProducts: ['platform', 'admission', 'fees', 'procurement'],
  };
}
