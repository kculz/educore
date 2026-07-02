import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tenant domain required',
  description: 'Use your tenant domain to open the protected admissions portal.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  alternates: {
    canonical: '/admission/workspace',
  },
};

export default function AdmissionWorkspaceGatePage() {
  return (
    <main className="site-shell">
      <div className="site-backdrop" />
      <div className="site-viewport">
        <header className="site-header">
          <Link className="site-brand" href="/" aria-label="EduCore home">
            <span className="site-brand-mark">EC</span>
            <span>
              <span className="site-brand-title">EduCore</span>
              <span className="site-brand-subtitle">Tenant domains only</span>
            </span>
          </Link>
        </header>

        <section className="site-hero">
          <div>
            <p className="site-kicker">Protected portal</p>
            <h1 className="site-title">Open the admissions portal from your tenant domain.</h1>
            <p className="site-lede">
              The staff portal is scoped to each tenant&apos;s branded domain. Use the slug-based tenant URL to sign in
              and manage admissions.
            </p>

            <div className="site-actions">
              <Link className="site-button" href="/">
                Back to platform
              </Link>
            </div>
          </div>

          <aside className="site-panel">
            <p className="site-panel-kicker">Access model</p>
            <div className="site-stat-grid">
              <article className="site-stat">
                <span className="site-stat-label">Tenant</span>
                <strong className="site-stat-value">Slug domain</strong>
              </article>
              <article className="site-stat">
                <span className="site-stat-label">Auth</span>
                <strong className="site-stat-value">API-backed sign in</strong>
              </article>
              <article className="site-stat">
                <span className="site-stat-label">Products</span>
                <strong className="site-stat-value">Tenant scoped</strong>
              </article>
              <article className="site-stat">
                <span className="site-stat-label">Indexing</span>
                <strong className="site-stat-value">Noindex</strong>
              </article>
            </div>
            <p className="site-panel-copy">
              This route stays out of search results so the public tenant site remains the discoverable surface.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}
