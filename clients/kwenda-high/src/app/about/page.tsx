import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Users, Award, BookOpen, Target } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About Us' };

const PILLARS = [
  { icon: BookOpen, title: 'Academic Excellence', desc: 'Our rigorous curriculum challenges every student to reach their intellectual peak.' },
  { icon: Award, title: 'Character Formation', desc: 'We develop leaders of integrity through mentorship, discipline, and civic responsibility.' },
  { icon: Users, title: 'Inclusive Community', desc: 'A diverse, welcoming environment where every student belongs and every voice matters.' },
  { icon: Target, title: 'Future Ready', desc: 'From careers to higher education, we equip students with skills for the 21st century.' },
];

const STAFF = [
  { name: 'Dr. Amina Odhiambo', role: 'Principal', initials: 'AO' },
  { name: 'Mr. James Kariuki', role: 'Deputy Principal — Academics', initials: 'JK' },
  { name: 'Mrs. Faith Wanjiku', role: 'Deputy Principal — Welfare', initials: 'FW' },
  { name: 'Dr. Peter Mwangi', role: 'Head of Sciences', initials: 'PM' },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Page Hero */}
      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="text-gold text-xs tracking-widest uppercase font-semibold mb-2">Our Story</p>
        <h1 className="font-serif text-5xl font-bold text-white">About Kwenda High</h1>
        <div className="w-16 h-1 gold-gradient mx-auto mt-6 rounded-full" />
      </div>

      {/* Mission */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            To provide a transformative education that develops the whole person — intellectually, morally, socially,
            and physically — preparing each student to make a positive contribution to society and the world.
          </p>
        </div>
      </section>

      {/* History */}
      <section className="section-padding bg-slate-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gold text-xs tracking-widest uppercase font-semibold mb-3">Our History</p>
            <h2 className="font-serif text-4xl font-bold text-slate-900 mb-5">45 Years of Excellence</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Founded in 1981 by a group of visionary educators, Kwenda High School began with 48 students in a single block. Today we are one of Kenya's premier secondary schools with over 2,400 students from across the country and the world.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Through decades of consistent investment in teachers, infrastructure, and innovation, Kwenda High has produced cabinet ministers, Olympic athletes, Nobel laureates, and countless community leaders.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { year: '1981', milestone: 'School Founded' },
              { year: '1990', milestone: 'First National Exam Top Score' },
              { year: '2005', milestone: 'New Science Block Opens' },
              { year: '2024', milestone: 'Digital Learning Campus' },
            ].map((m) => (
              <div key={m.year} className="p-6 rounded-2xl border border-slate-200 bg-white">
                <p className="font-serif text-2xl font-bold text-gold mb-1">{m.year}</p>
                <p className="text-slate-600 text-sm">{m.milestone}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="section-padding bg-navy">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold text-white mb-4">Our Core Pillars</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PILLARS.map((p) => (
              <div key={p.title} className="glass rounded-2xl p-7">
                <div className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center mb-5">
                  <p.icon size={22} style={{ color: '#0a1628' }} />
                </div>
                <h3 className="font-serif text-lg font-bold text-white mb-2">{p.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="section-padding bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold text-slate-900">Leadership Team</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STAFF.map((s) => (
              <div key={s.name} className="text-center p-6 rounded-2xl border border-slate-100 hover:border-gold/30 hover:shadow-lg transition-all">
                <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4 text-2xl font-bold" style={{ color: '#0a1628' }}>
                  {s.initials}
                </div>
                <h4 className="font-serif font-bold text-slate-900">{s.name}</h4>
                <p className="text-xs text-gold mt-1">{s.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
