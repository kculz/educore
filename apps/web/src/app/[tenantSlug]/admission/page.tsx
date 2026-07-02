import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { buildTenantPath } from '@web/lib/tenant-domains';
import { loadPublicTenantBySlug } from '@web/lib/tenant-directory';

type TenantAdmissionPageProps = {
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

export async function generateMetadata({ params }: TenantAdmissionPageProps): Promise<Metadata> {
  const tenant = await loadTenant(params);

  return {
    title: `${tenant.name} Admissions | EduCore`,
    description: `${tenant.name} admissions site for families, applications, and API-first tenant access.`,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `/${tenant.slug}/admission`,
    },
  };
}

export default async function TenantAdmissionPage({ params }: TenantAdmissionPageProps) {
  const tenant = await loadTenant(params);
  const hasAdmission = tenant.enabledProducts.includes('admission');

  return (
    <main className="site-shell">
      <div className="site-backdrop" />
      <div className="site-viewport">
        <header className="site-header">
          <Link className="site-brand" href={buildTenantPath(tenant.slug)} aria-label={`${tenant.name} home`}>
            <span className="site-brand-mark">EC</span>
            <span>
              <span className="site-brand-title">{tenant.name}</span>
              <span className="site-brand-subtitle">Admissions site</span>
            </span>
          </Link>

          <nav className="site-nav" aria-label={`${tenant.name} admissions sections`}>
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
            <p className="site-kicker">Public admissions site</p>
            <h1 className="site-title">{tenant.name} admissions live on this domain.</h1>
            <p className="site-lede">
              Families can discover programmes, start an application, and continue into the protected staff portal
              when the work moves inside.
            </p>

            <div className="site-actions">
              <Link className="site-button" href={buildTenantPath(tenant.slug, '/admission/workspace')}>
                Open staff portal
              </Link>
              <Link className="site-button-secondary" href={buildTenantPath(tenant.slug)}>
                Back to tenant home
              </Link>
            </div>
          </div>

          <aside className="site-panel">
            <p className="site-panel-kicker">Admission signals</p>
            <div className="site-stat-grid">
              <article className="site-stat">
                <span className="site-stat-label">Cycles</span>
                <strong className="site-stat-value">Open intake windows</strong>
              </article>
              <article className="site-stat">
                <span className="site-stat-label">Programmes</span>
                <strong className="site-stat-value">Published offerings</strong>
              </article>
              <article className="site-stat">
                <span className="site-stat-label">Applicants</span>
                <strong className="site-stat-value">Captured online</strong>
              </article>
              <article className="site-stat">
                <span className="site-stat-label">Auth</span>
                <strong className="site-stat-value">Tenant portal</strong>
              </article>
            </div>
            <p className="site-panel-copy">
              {hasAdmission
                ? 'This tenant has the admissions product enabled, so families can start here before staff continue in the portal.'
                : 'Admissions is not enabled for this tenant yet, but the same domain model is ready when it is turned on.'}
            </p>
          </aside>
        </section>

        <section className="site-section">
          <div className="site-section-header">
            <div>
              <p className="site-kicker">Workflow overview</p>
              <h2 className="site-section-title">The public admissions journey stays simple.</h2>
            </div>
            <p className="site-section-copy">
              Families should not have to understand the platform. They only need a clear path into the school&apos;s
              admissions process.
            </p>
          </div>

          <div className="site-card-grid">
            <article className="site-card">
              <p className="site-card-index">01</p>
              <h3 className="site-card-title">Discover</h3>
              <p className="site-card-copy">
                Families review the school, programme options, and intake windows from this tenant domain.
              </p>
            </article>

            <article className="site-card">
              <p className="site-card-index">02</p>
              <h3 className="site-card-title">Apply</h3>
              <p className="site-card-copy">
                Applicant and guardian details can be started on the public site and continued later if needed.
              </p>
            </article>

            <article className="site-card">
              <p className="site-card-index">03</p>
              <h3 className="site-card-title">Review</h3>
              <p className="site-card-copy">
                Staff move the intake through interviews, offers, acceptance, and enrollment in the portal.
              </p>
            </article>
          </div>
        </section>

        <section className="site-section">
          <div className="site-route-band">
            <div>
              <strong className="site-route-title">Open the staff portal when you are ready for the next step.</strong>
              <p className="site-route-copy">
                The public site stays friendly for families. The staff portal keeps the operational work behind the
                domain boundary.
              </p>
            </div>
            <div className="site-actions">
              <Link className="site-button" href={buildTenantPath(tenant.slug, '/admission/workspace')}>
                Open staff portal
              </Link>
              <Link className="site-button-secondary" href={buildTenantPath(tenant.slug)}>
                Tenant home
              </Link>
            </div>
          </div>
        </section>

        <footer className="site-footer">
          <span>{tenant.name} admissions</span>
          <span>{tenant.slug} tenant domain</span>
        </footer>
      </div>
    </main>
  );
}
