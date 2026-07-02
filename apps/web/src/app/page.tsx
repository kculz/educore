import Link from 'next/link';
import type { Metadata } from 'next';

const pillars = [
  {
    title: 'Branded tenant domains',
    description:
      'Each registered school gets its own public admissions presence on a branded domain or subdomain.',
  },
  {
    title: 'Real admissions workflows',
    description:
      'Families can discover programmes, submit applications, and move through the intake journey from one site.',
  },
  {
    title: 'API-first products',
    description:
      'Every product surface can also be used through APIs so schools can integrate EduCore with other systems.',
  },
  {
    title: 'Ready for more apps',
    description:
      'New product areas can launch without changing the tenant experience or the public site structure.',
  },
];

const platformSignals = [
  { label: 'Tenant domains', value: 'One branded site each' },
  { label: 'Customer-facing', value: 'Families and staff' },
  { label: 'Search friendly', value: 'Easy to discover' },
  { label: 'API-first', value: 'Integration ready' },
];

export const metadata: Metadata = {
  title: 'EduCore platform',
  description:
    'EduCore is a SaaS platform for schools and other tenants, with branded admission sites, protected staff portals, and API-first products.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <main className="site-shell">
      <div className="site-backdrop" />
      <div className="site-viewport">
        <header className="site-header">
          <Link className="site-brand" href="/" aria-label="EduCore home">
            <span className="site-brand-mark">EC</span>
            <span>
              <span className="site-brand-title">EduCore</span>
              <span className="site-brand-subtitle">Tenant SaaS landing</span>
            </span>
          </Link>

          <nav className="site-nav" aria-label="Platform sections">
            <Link className="site-nav-link" href="#platform">
              Platform
            </Link>
            <Link className="site-nav-link" href="/admission">
              Admission
            </Link>
            <Link className="site-nav-link" href="/admission/workspace">
              Staff portal
            </Link>
          </nav>
        </header>

        <section className="site-hero">
          <div>
            <p className="site-kicker">Tenant admissions platform</p>
            <h1 className="site-title">
              Give every school its own admissions domain.
            </h1>
            <p className="site-lede">
              Each tenant gets a branded public site, a protected staff portal, and APIs that can power other
              products later. The public side stays fast and easy to discover for families.
            </p>

            <div className="site-actions">
              <Link className="site-button" href="/admission">
                View admissions site
              </Link>
              <Link className="site-button-secondary" href="/admission/workspace">
                Open staff portal
              </Link>
            </div>
          </div>

          <aside className="site-panel">
            <p className="site-panel-kicker">Platform signals</p>
            <div className="site-stat-grid">
              {platformSignals.map((signal) => (
                <article className="site-stat" key={signal.label}>
                  <span className="site-stat-label">{signal.label}</span>
                  <strong className="site-stat-value">{signal.value}</strong>
                </article>
              ))}
            </div>
            <p className="site-panel-copy">
              Public pages stay crawlable. Tenant portals stay protected. APIs stay ready for integrations.
            </p>
          </aside>
        </section>

        <section className="site-section" id="platform">
          <div className="site-section-header">
            <div>
              <p className="site-kicker">Platform foundation</p>
              <h2 className="site-section-title">The platform is built around the real customer journey.</h2>
            </div>
            <p className="site-section-copy">
              Every school can publish its own admissions experience, while the portal and APIs keep the operational
              work connected behind the scenes.
            </p>
          </div>

          <div className="site-card-grid">
            {pillars.map((pillar) => (
              <article className="site-card" key={pillar.title}>
                <h3 className="site-card-title">{pillar.title}</h3>
                <p className="site-card-copy">{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="site-section" id="admission">
          <div className="site-section-header">
            <div>
              <p className="site-kicker">First product</p>
              <h2 className="site-section-title">Admission is the first live experience on the platform.</h2>
            </div>
            <p className="site-section-copy">
              Families see the school. Staff handle the intake work in a protected portal. The API keeps future apps in
              sync.
            </p>
          </div>

          <div className="site-route-band">
            <div>
              <strong className="site-route-title">Start with the public admissions site, then open the staff portal.</strong>
              <p className="site-route-copy">
                The public page handles discovery and applications. The portal handles review, decisions, and
                enrollment.
              </p>
            </div>
            <div className="site-actions">
              <Link className="site-button" href="/admission">
                Open admissions site
              </Link>
              <Link className="site-button-secondary" href="/admission/workspace">
                Open staff portal
              </Link>
            </div>
          </div>
        </section>

        <footer className="site-footer" id="contact">
          <span>EduCore SaaS platform</span>
          <span>Tenant-branded admissions sites, staff portals, and APIs.</span>
        </footer>
      </div>
    </main>
  );
}
