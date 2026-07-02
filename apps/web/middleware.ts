import { NextRequest, NextResponse } from 'next/server';

import { resolveTenantSlugFromHostname } from './src/lib/tenant-domains';

function shouldSkipPath(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.includes('.')
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkipPath(pathname)) {
    return NextResponse.next();
  }

  const tenantSlug = resolveTenantSlugFromHostname(request.nextUrl.hostname);
  if (!tenantSlug) {
    return NextResponse.next();
  }

  if (pathname === `/${tenantSlug}` || pathname.startsWith(`/${tenantSlug}/`)) {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = `/${tenantSlug}${pathname === '/' ? '' : pathname}`;

  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api).*)'],
};
