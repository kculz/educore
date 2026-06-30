const pillars = [
  {
    title: 'Modular monolith',
    description:
      'The backend starts as a clean NestJS monolith with clear boundaries so products can be split later without a rewrite.',
  },
  {
    title: 'Multi-tenant core',
    description:
      'Every entity is designed around tenant ownership, product licensing, and access control from the first commit.',
  },
  {
    title: 'Product shells',
    description:
      'Admission, Fees, and Procurement are scaffolded as separate product areas ready for incremental implementation.',
  },
];

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <span className="eyebrow">EduCore Platform Scaffold</span>
        <h1 className="title">Unified Edge Solution's multi-tenant education platform.</h1>
        <p className="lede">
          This starter workspace mirrors the architecture brief: NestJS backend, Next.js frontend,
          PostgreSQL, Redis, and isolated product boundaries for long-term commercial growth.
        </p>

        <div className="grid">
          {pillars.map((pillar) => (
            <article className="card" key={pillar.title}>
              <h2>{pillar.title}</h2>
              <p>{pillar.description}</p>
            </article>
          ))}
        </div>

        <p className="footer">Initial scaffold ready for dependency install and module generation.</p>
      </section>
    </main>
  );
}
