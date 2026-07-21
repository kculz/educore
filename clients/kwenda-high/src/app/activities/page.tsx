import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, Clock, MapPin, Trophy, Music, Microscope, Globe } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Activities' };

const CLUBS = [
  { icon: Trophy, name: 'Sports & Athletics', count: '20+ disciplines', color: 'text-orange-400' },
  { icon: Music, name: 'Music & Drama', count: '8 ensembles', color: 'text-purple-400' },
  { icon: Microscope, name: 'Science Clubs', count: '6 societies', color: 'text-blue-400' },
  { icon: Globe, name: 'Debate & MUN', count: '3 teams', color: 'text-green-400' },
];

const EVENTS = [
  { date: 'Aug 01', name: 'Annual Sports Day 2026', location: 'School Grounds', time: '8:00 AM' },
  { date: 'Aug 15', name: 'Drama Festival', location: 'Main Auditorium', time: '6:00 PM' },
  { date: 'Sep 05', name: 'Science Fair', location: 'Science Block', time: '9:00 AM' },
  { date: 'Sep 20', name: 'Inter-School Debate', location: 'Assembly Hall', time: '2:00 PM' },
  { date: 'Oct 10', name: 'Cultural Day', location: 'School Grounds', time: '10:00 AM' },
  { date: 'Nov 01', name: 'Annual Prize Giving', location: 'Main Hall', time: '3:00 PM' },
];

export default function ActivitiesPage() {
  return (
    <>
      <Navbar />

      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="text-gold text-xs tracking-widest uppercase font-semibold mb-2">Beyond the Classroom</p>
        <h1 className="font-serif text-5xl font-bold text-white">Activities & Events</h1>
        <div className="w-16 h-1 gold-gradient mx-auto mt-6 rounded-full" />
      </div>

      {/* Clubs */}
      <section className="section-padding bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-slate-900">Student Clubs & Societies</h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto">Over 40 active student clubs spanning sports, arts, technology, and community service.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CLUBS.map((c) => (
              <div key={c.name} className="p-7 rounded-2xl border border-slate-100 hover:border-gold/30 hover:shadow-lg transition-all text-center group">
                <c.icon size={36} className={`${c.color} mx-auto mb-4`} />
                <h3 className="font-serif text-lg font-bold text-slate-900 mb-1">{c.name}</h3>
                <p className="text-slate-400 text-sm">{c.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="section-padding bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-slate-900">Upcoming Events</h2>
          </div>
          <div className="space-y-4">
            {EVENTS.map((ev) => (
              <div key={ev.name} className="flex gap-5 items-center p-5 bg-white rounded-xl border border-slate-100 hover:border-gold/30 hover:shadow-md transition-all">
                <div className="w-16 h-16 shrink-0 bg-navy rounded-xl flex flex-col items-center justify-center">
                  <p className="text-[10px] text-gold tracking-wider uppercase">{ev.date.split(' ')[0]}</p>
                  <p className="text-white font-bold text-xl leading-none">{ev.date.split(' ')[1]}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900">{ev.name}</h4>
                  <div className="flex gap-4 mt-1">
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin size={11} /> {ev.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock size={11} /> {ev.time}
                    </span>
                  </div>
                </div>
                <button className="px-4 py-1.5 rounded-lg border border-gold text-gold text-xs font-semibold hover:bg-gold hover:text-navy-900 transition-colors">
                  Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
