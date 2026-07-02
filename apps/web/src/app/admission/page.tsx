import type { Metadata } from 'next';
import Link from 'next/link';

const admissionSignals = [
  { label: 'Cycles', value: 'Open intake windows' },
  { label: 'Programmes', value: 'Publish offerings' },
  { label: 'Applicants', value: 'Capture enquiries' },
  { label: 'Audit trail', value: 'Track every action' },
];

const admissionStages = [
  {
    title: 'Publish cycle',
    description:
      "Set the academic year and intake window before families start applying on the tenant's own domain.",
  },
  {
    title: 'Show programmes',
    description:
      'Keep programme details current so families always see the right options on the public admissions site.',
  },
  {
    title: 'Capture applications',
    description:
      'Collect applicant and guardian details from the public page, then continue later in the portal if needed.',
  },
  {
    title: 'Complete enrollment',
    description:
      'Move applications through submission, interviews, offers, acceptance, and enrollment without losing context.',
  },
];

export const metadata: Metadata = {
  title: 'Admission',
  description:
    'EduCore Admission is the public admissions site for each tenant, with search-friendly overview content and a protected staff portal.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/admission',
  },
};

export default function AdmissionPage() {
  return (
    <main className="site-shell">
      <div className="site-backdrop" />
      <div className="site-viewport">
        <header className="site-header">
          <Link className="site-brand" href="/" aria-label="EduCore home">
            <span className="site-brand-mark">EC</span>
            <span>
              <span className="site-brand-title">EduCore</span>
              <span className="site-brand-subtitle">Public admissions site</span>
            </span>
          </Link>

          <nav className="site-nav" aria-label="Admission sections">
            <Link className="site-nav-link" href="#workflow">
              Workflow
            </Link>
            <Link className="site-nav-link" href="#portal">
              Portal
            </Link>
            <Link className="site-nav-link" href="/admission/workspace">
              Open portal
            </Link>
          </nav>
        </header>

        <section className="site-hero">
          <div>
            <p className="site-kicker">Public admissions site</p>
            <h1 className="site-title">
              A branded admissions site for each tenant school.
            </h1>
            <p className="site-lede">
              Families can start on the school's own domain, see the right programmes, and continue into a protected
              staff portal when the work moves inside.
            </p>

            <div className="site-actions">
              <Link className="site-button" href="/admission/workspace">
                Open staff portal
              </Link>
              <Link className="site-button-secondary" href="/">
                Back to platform
              </Link>
            </div>
          </div>

          <aside className="site-panel">
            <p className="site-panel-kicker">Admission signals</p>
            <div className="site-stat-grid">
              {admissionSignals.map((signal) => (
                <article className="site-stat" key={signal.label}>
                  <span className="site-stat-label">{signal.label}</span>
                  <strong className="site-stat-value">{signal.value}</strong>
                </article>
              ))}
            </div>
            <p className="site-panel-copy">
              Families see the school here. Staff manage the application flow in the portal.
            </p>
          </aside>
        </section>

        <section className="site-section" id="workflow">
          <div className="site-section-header">
            <div>
              <p className="site-kicker">Workflow overview</p>
              <h2 className="site-section-title">The admission journey stays clear from inquiry to enrollment.</h2>
            </div>
            <p className="site-section-copy">
              The public site handles discovery and application start. The portal handles review, interviews, offers,
              and enrollment.
            </p>
          </div>

          <div className="site-card-grid">
            {admissionStages.map((stage, index) => (
              <article className="site-card" key={stage.title}>
                <p className="site-card-index">0{index + 1}</p>
                <h3 className="site-card-title">{stage.title}</h3>
                <p className="site-card-copy">{stage.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="site-section" id="portal">
          <div className="site-route-band">
            <div>
              <strong className="site-route-title">Open the protected staff portal when you are ready to work.</strong>
              <p className="site-route-copy">
                The portal is where the tenant-aware create/edit flows run. The public page stays easy to discover.
              </p>
            </div>
            <div className="site-actions">
              <Link className="site-button" href="/admission/workspace">
                Open portal
              </Link>
              <Link className="site-button-secondary" href="/">
                Platform home
              </Link>
            </div>
          </div>
        </section>

        <footer className="site-footer">
          <span>EduCore Admission</span>
          <span>Public admissions site first, protected staff portal second.</span>
        </footer>
      </div>
    </main>
  );
}
