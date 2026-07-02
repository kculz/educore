import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { buildTenantPath } from '@web/lib/tenant-domains';
import { loadPublicTenantBySlug } from '@web/lib/tenant-directory';

type TenantHomePageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export const dynamic = 'force-dynamic';

async function loadTenant(params: Promise<{ tenantSlug: string }>) {
  const { tenantSlug } = await params;
  const tenant = await loadPublicTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  return tenant;
}

export async function generateMetadata({ params }: TenantHomePageProps): Promise<Metadata> {
  const tenant = await loadTenant(params);

  return {
    title: `${tenant.name} | EduCore`,
    description: `${tenant.name} tenant home for branded admissions access, staff login, and API-first products.`,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `/${tenant.slug}`,
    },
  };
}

export default async function TenantHomePage({ params }: TenantHomePageProps) {
  const tenant = await loadTenant(params);
  const enabledProducts = tenant.enabledProducts.filter((product) => product !== 'platform');

  return (
    <main className="site-shell">
      <div className="site-backdrop" />
      <div className="site-viewport">
        <header className="site-header">
          <Link className="site-brand" href={buildTenantPath(tenant.slug)} aria-label={`${tenant.name} home`}>
            <span className="site-brand-mark">EC</span>
            <span>
              <span className="site-brand-title">{tenant.name}</span>
              <span className="site-brand-subtitle">Tenant home</span>
            </span>
          </Link>

          <nav className="site-nav" aria-label={`${tenant.name} sections`}>
            <Link className="site-nav-link" href={buildTenantPath(tenant.slug)}>
              Home
            </Link>
            <Link className="site-nav-link" href={buildTenantPath(tenant.slug, '/admission')}>
              Admissions
            </Link>
            <Link className="site-nav-link" href={buildTenantPath(tenant.slug, '/admission/workspace')}>
              Staff portal
            </Link>
          </nav>
        </header>

        <section className="site-hero">
          <div>
            <p className="site-kicker">Tenant domain</p>
            <h1 className="site-title">{tenant.name} lives on its own branded domain.</h1>
            <p className="site-lede">
              Families start on this domain, explore the admissions site, and staff sign in to manage applications in
              the protected portal.
            </p>

            <div className="site-actions">
              <Link className="site-button" href={buildTenantPath(tenant.slug, '/admission')}>
                Open admissions site
              </Link>
              <Link className="site-button-secondary" href={buildTenantPath(tenant.slug, '/admission/workspace')}>
                Open staff portal
              </Link>
            </div>
          </div>

          <aside className="site-panel">
            <p className="site-panel-kicker">Tenant signals</p>
            <div className="site-stat-grid">
              <article className="site-stat">
                <span className="site-stat-label">Slug</span>
                <strong className="site-stat-value">{tenant.slug}</strong>
              </article>
              <article className="site-stat">
                <span className="site-stat-label">Status</span>
                <strong className="site-stat-value">{tenant.status}</strong>
              </article>
              <article className="site-stat">
                <span className="site-stat-label">Products</span>
                <strong className="site-stat-value">{enabledProducts.length || 0}</strong>
              </article>
              <article className="site-stat">
                <span className="site-stat-label">Access</span>
                <strong className="site-stat-value">API-first</strong>
              </article>
            </div>
            <p className="site-panel-copy">
              Tenant staff use the branded portal to work with admissions data, while the public site stays easy for
              families to reach.
            </p>
          </aside>
        </section>

        <section className="site-section">
          <div className="site-section-header">
            <div>
              <p className="site-kicker">Products</p>
              <h2 className="site-section-title">All enabled products start from this domain.</h2>
            </div>
            <p className="site-section-copy">
              The first product is Admission, and the platform is ready to add more tenant apps without changing the
              domain model.
            </p>
          </div>

          <div className="site-card-grid">
            <article className="site-card">
              <p className="site-card-index">01</p>
              <h3 className="site-card-title">Admissions site</h3>
              <p className="site-card-copy">
                Families can browse programmes, submit applications, and move through the intake journey from this
                tenant domain.
              </p>
            </article>

            <article className="site-card">
              <p className="site-card-index">02</p>
              <h3 className="site-card-title">Staff portal</h3>
              <p className="site-card-copy">
                Authorized staff sign in to review applicants, schedule interviews, issue offers, and complete
                enrollment.
              </p>
            </article>

            <article className="site-card">
              <p className="site-card-index">03</p>
              <h3 className="site-card-title">Future products</h3>
              <p className="site-card-copy">
                Additional products can be launched on the same domain structure without changing the tenant
                experience.
              </p>
            </article>
          </div>
        </section>

        <section className="site-section">
          <div className="site-route-band">
            <div>
              <strong className="site-route-title">Continue into the admissions experience when you are ready.</strong>
              <p className="site-route-copy">
                The admissions site keeps the public journey clear. The staff portal handles the work behind the
                scenes.
              </p>
            </div>
            <div className="site-actions">
              <Link className="site-button" href={buildTenantPath(tenant.slug, '/admission')}>
                Open admissions site
              </Link>
              <Link className="site-button-secondary" href={buildTenantPath(tenant.slug, '/admission/workspace')}>
                Open staff portal
              </Link>
            </div>
          </div>
        </section>

        <footer className="site-footer">
          <span>{tenant.name}</span>
          <span>{tenant.slug} tenant domain</span>
        </footer>
      </div>
    </main>
  );
}
