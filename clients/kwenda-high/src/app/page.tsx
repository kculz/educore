import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  GraduationCap, Award, Users, BookOpen, ArrowRight,
  ChevronRight, Star, Trophy, Globe, Heart
} from 'lucide-react';

const STATS = [
  { value: '2,400+', label: 'Students Enrolled' },
  { value: '98%', label: 'University Placement' },
  { value: '150+', label: 'Staff Members' },
  { value: '45yrs', label: 'Of Excellence' },
];

const PROGRAMS = [
  {
    icon: BookOpen,
    title: 'Sciences & Technology',
    desc: 'World-class labs, STEM programs, and coding bootcamps preparing students for the digital era.',
  },
  {
    icon: Globe,
    title: 'Humanities & Languages',
    desc: 'A rich curriculum covering history, literature, philosophy, and six foreign language options.',
  },
  {
    icon: Trophy,
    title: 'Sports & Athletics',
    desc: 'Olympic-standard facilities, 20+ sports disciplines, and national championship teams.',
  },
  {
    icon: Heart,
    title: 'Arts & Culture',
    desc: 'Drama, music, fine arts, and debate clubs that forge creativity and confident self-expression.',
  },
];

const NEWS = [
  {
    category: 'Achievement',
    date: 'July 15, 2026',
    title: 'Kwenda High Tops National Science Olympiad',
    excerpt: 'Our Form 4 science team brought home gold at the Kenya National Science Olympiad held in Mombasa.',
  },
  {
    category: 'Events',
    date: 'July 10, 2026',
    title: 'Annual Sports Day 2026 — Registration Open',
    excerpt: 'The biggest event of the academic calendar is here. Register your team before August 1st.',
  },
  {
    category: 'Admissions',
    date: 'July 5, 2026',
    title: 'Form 1 Admissions 2027 — Now Open',
    excerpt: 'Applications for the Form 1 intake of 2027 are now open. Spaces are limited. Apply today.',
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="/hero.png"
          alt="Kwenda High School"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 hero-overlay" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-semibold mb-4 animate-pulse">
            Est. 1981 · Nairobi, Kenya
          </p>
          <h1 className="font-serif text-white text-5xl sm:text-7xl font-bold leading-tight mb-6">
            Kwenda <br />
            <span className="text-gold">High School</span>
          </h1>
          <p className="text-white/70 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Where exceptional students become extraordinary leaders. Excellence, Integrity, and Legacy — since 1981.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admissions"
              className="px-8 py-3.5 rounded-xl font-semibold gold-gradient shadow-lg shadow-yellow-900/30 hover:opacity-90 transition-opacity text-sm"
              style={{ color: '#0a1628' }}
            >
              Apply for Admission
            </Link>
            <Link
              href="/about"
              className="px-8 py-3.5 rounded-xl font-semibold glass-light text-white hover:bg-white/15 transition-colors text-sm border border-white/20"
            >
              Discover More
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <p className="text-xs tracking-widest uppercase">Scroll</p>
          <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section className="bg-navy-800 py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-4xl font-bold text-gold">{stat.value}</p>
              <p className="text-white/50 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Programs ──────────────────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-gold text-xs tracking-widest uppercase font-semibold mb-2">What We Offer</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-slate-900">Academic Excellence</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">
              A broad, balanced curriculum that prepares students for the challenges of a rapidly changing world.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROGRAMS.map((prog) => (
              <div
                key={prog.title}
                className="group p-7 rounded-2xl border border-slate-100 hover:border-gold/30 hover:shadow-xl hover:shadow-gold/5 transition-all duration-300 bg-white"
              >
                <div className="w-12 h-12 rounded-xl bg-navy flex items-center justify-center mb-5 group-hover:gold-gradient transition-all duration-300">
                  <prog.icon size={22} className="text-gold group-hover:text-navy-900" />
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900 mb-2">{prog.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{prog.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Portal Banner ──────────────────────────────────────────────────── */}
      <section className="bg-navy py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-64 h-64 rounded-full border border-gold"
              style={{ left: `${i * 18}%`, top: `${(i % 2) * 40}%` }}
            />
          ))}
        </div>
        <div className="relative max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <p className="text-gold text-xs tracking-widest uppercase font-semibold mb-3">EduCore Powered</p>
            <h2 className="font-serif text-4xl font-bold text-white mb-5">
              Your School, <span className="text-gold">One Portal</span>
            </h2>
            <p className="text-white/60 leading-relaxed mb-8 max-w-md">
              Track your admissions, pay fees, and access all school services in one beautifully unified student portal.
            </p>
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold gold-gradient hover:opacity-90 transition-opacity text-sm shadow-lg shadow-yellow-900/20"
              style={{ color: '#0a1628' }}
            >
              Access Portal <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex-1 max-w-md w-full">
            <div className="rounded-2xl overflow-hidden border border-gold/20 shadow-2xl shadow-black/50">
              <Image
                src="/portal-preview.png"
                alt="Student Portal Preview"
                width={600}
                height={400}
                className="w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── News ──────────────────────────────────────────────────────────── */}
      <section className="section-padding bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-gold text-xs tracking-widest uppercase font-semibold mb-2">Stay Informed</p>
              <h2 className="font-serif text-4xl font-bold text-slate-900">Latest News</h2>
            </div>
            <Link href="/news" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline">
              View All <ChevronRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {NEWS.map((item) => (
              <article
                key={item.title}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="h-2 gold-gradient" />
                <div className="p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-gold bg-gold/10 px-3 py-1 rounded-full">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400">{item.date}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 mb-2 group-hover:text-gold transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.excerpt}</p>
                  <Link href="/news" className="inline-flex items-center gap-1 mt-5 text-xs font-semibold text-gold hover:underline">
                    Read More <ChevronRight size={13} />
                  </Link>
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
