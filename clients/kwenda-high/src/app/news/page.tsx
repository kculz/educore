import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'News' };

const ARTICLES = [
  { cat: 'Achievement', date: 'July 15, 2026', title: 'Kwenda High Tops National Science Olympiad', excerpt: 'Our Form 4 science team brought home gold at the Kenya National Science Olympiad held in Mombasa, beating 240 schools nationwide.' },
  { cat: 'Events', date: 'July 10, 2026', title: 'Annual Sports Day 2026 — Registration Open', excerpt: 'The biggest event of the academic calendar is here. Register your team before August 1st for a chance at the coveted Principal\'s Cup.' },
  { cat: 'Admissions', date: 'July 5, 2026', title: 'Form 1 Admissions 2027 — Now Open', excerpt: 'Applications for the Form 1 intake of 2027 are now open. Early applicants receive priority consideration. Spaces are limited.' },
  { cat: 'Community', date: 'June 28, 2026', title: 'Kwenda High Donates to Local Children\'s Home', excerpt: 'Our Student Council led a community outreach drive, collecting over KES 400,000 in supplies for the Huruma Children\'s Home.' },
  { cat: 'Academic', date: 'June 20, 2026', title: 'Three Students Secure Oxford University Offers', excerpt: 'Congratulations to our three Form 6 students who have received conditional offers from the University of Oxford.' },
  { cat: 'Technology', date: 'June 10, 2026', title: 'New ICT Lab Officially Opened', excerpt: 'Our state-of-the-art ICT lab with 120 workstations and fiber connectivity was officially opened by the Cabinet Secretary for Education.' },
];

const COLORS: Record<string, string> = {
  Achievement: 'bg-yellow-100 text-yellow-700',
  Events: 'bg-blue-100 text-blue-700',
  Admissions: 'bg-green-100 text-green-700',
  Community: 'bg-pink-100 text-pink-700',
  Academic: 'bg-purple-100 text-purple-700',
  Technology: 'bg-cyan-100 text-cyan-700',
};

export default function NewsPage() {
  return (
    <>
      <Navbar />

      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="text-gold text-xs tracking-widest uppercase font-semibold mb-2">Keep Up To Date</p>
        <h1 className="font-serif text-5xl font-bold text-white">Latest News</h1>
        <div className="w-16 h-1 gold-gradient mx-auto mt-6 rounded-full" />
      </div>

      <section className="section-padding bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Featured */}
          <div className="mb-8 p-8 rounded-2xl bg-navy text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-gold/5 -translate-y-1/2 translate-x-1/3" />
            <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-gold/20 text-gold`}>
              ⭐ Featured
            </span>
            <h2 className="font-serif text-3xl font-bold mt-3 mb-3">{ARTICLES[0].title}</h2>
            <p className="text-white/60 leading-relaxed max-w-2xl">{ARTICLES[0].excerpt}</p>
            <div className="flex items-center gap-4 mt-5">
              <span className="text-white/40 text-xs">{ARTICLES[0].date}</span>
              <button className="text-xs text-gold font-semibold flex items-center gap-1 hover:underline">
                Read Full Story <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ARTICLES.slice(1).map((a) => (
              <article key={a.title} className="rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="h-1.5 gold-gradient" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${COLORS[a.cat] ?? 'bg-slate-100 text-slate-600'}`}>
                      {a.cat}
                    </span>
                    <span className="text-xs text-slate-400">{a.date}</span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-slate-900 mb-2 group-hover:text-gold transition-colors leading-snug">
                    {a.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{a.excerpt}</p>
                  <button className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-gold hover:underline">
                    Read More <ChevronRight size={13} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
