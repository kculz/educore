'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStoredUser } from '@/lib/auth';
import { UserCheck, Receipt, ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const QUICK_LINKS = [
  { href: '/portal/admissions', label: 'View My Application', icon: UserCheck, color: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' },
  { href: '/portal/fees', label: 'Pay Fees', icon: Receipt, color: 'bg-gold/10 text-gold hover:bg-gold/20' },
];

const RECENT_ACTIVITY = [
  { icon: CheckCircle, label: 'Application submitted', time: '2 hours ago', color: 'text-green-400' },
  { icon: Clock, label: 'Document review in progress', time: '1 day ago', color: 'text-blue-400' },
  { icon: AlertCircle, label: 'Fee payment reminder', time: '3 days ago', color: 'text-yellow-400' },
];

export default function PortalDashboard() {
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);

  useEffect(() => { setUser(getStoredUser()); }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-white/40 text-sm">{greeting()},</p>
        <h1 className="font-serif text-3xl font-bold text-white">{user?.fullName ?? 'Student'}</h1>
        <p className="text-white/40 text-sm mt-1">Here's what's happening with your account.</p>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-4 p-5 rounded-2xl border border-white/5 transition-all group ${link.color}`}
          >
            <link.icon size={24} />
            <div className="flex-1">
              <p className="font-semibold text-sm">{link.label}</p>
            </div>
            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      {/* Stats + Activity */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Status cards */}
        {[
          { label: 'Application Status', value: 'Under Review', sub: 'Form 1 · 2027', badge: 'pending' },
          { label: 'Outstanding Balance', value: 'KES 24,500', sub: 'Term 2 · 2026', badge: 'alert' },
          { label: 'Last Login', value: 'Today', sub: new Date().toLocaleDateString(), badge: 'ok' },
        ].map((card) => (
          <div key={card.label} className="bg-navy-800 rounded-2xl p-6 border border-white/5">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">{card.label}</p>
            <p className="font-serif text-2xl font-bold text-white mb-1">{card.value}</p>
            <p className="text-white/40 text-xs">{card.sub}</p>
            <div className={`mt-3 inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${
              card.badge === 'ok' ? 'bg-green-500/10 text-green-400' :
              card.badge === 'alert' ? 'bg-yellow-500/10 text-yellow-400' :
              'bg-blue-500/10 text-blue-400'
            }`}>
              {card.badge === 'ok' ? '● Active' : card.badge === 'alert' ? '● Due' : '● Pending'}
            </div>
          </div>
        ))}

        {/* Recent activity */}
        <div className="lg:col-span-3 bg-navy-800 rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-semibold text-sm mb-5">Recent Activity</h3>
          <div className="space-y-4">
            {RECENT_ACTIVITY.map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <item.icon size={16} className={item.color} />
                <p className="text-white/70 text-sm flex-1">{item.label}</p>
                <p className="text-white/30 text-xs">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
