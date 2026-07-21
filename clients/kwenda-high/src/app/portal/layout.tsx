'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap, LayoutDashboard, UserCheck, Receipt, LogOut, Menu, X, Bell,
  ChevronRight, ShoppingCart, FileText, PackageCheck, Truck, Users, FileCheck, FileSpreadsheet, PlusCircle, HelpCircle, Lock
} from 'lucide-react';
import { getAccessToken, getStoredUser, clearSession, type StoredUser } from '@/lib/auth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  permission?: string;
}

interface NavSection {
  title: string;
  permission?: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { href: '/portal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Admissions',
    permission: 'admission.read',
    items: [
      { href: '/portal/admissions', label: 'Applications', icon: UserCheck },
      { href: '/portal/admissions/new', label: 'New Application', icon: PlusCircle },
      { href: '/portal/admissions/requirements', label: 'Requirements', icon: HelpCircle },
    ],
  },
  {
    title: 'Fees & Payments',
    permission: 'fees.read',
    items: [
      { href: '/portal/fees', label: 'Invoices', icon: Receipt },
      { href: '/portal/fees/receipts', label: 'Payment Receipts', icon: FileCheck },
      { href: '/portal/fees/structure', label: 'Fee Structure', icon: FileSpreadsheet },
    ],
  },
  {
    title: 'Procurement',
    permission: 'procurement.read',
    items: [
      { href: '/portal/procurement', label: 'Overview', icon: ShoppingCart },
      { href: '/portal/procurement/requests', label: 'Purchase Requests', icon: FileText },
      { href: '/portal/procurement/orders', label: 'Purchase Orders', icon: PackageCheck },
      { href: '/portal/procurement/suppliers', label: 'Suppliers', icon: Users },
      { href: '/portal/procurement/quotations', label: 'Quotations', icon: FileSpreadsheet },
      { href: '/portal/procurement/contracts', label: 'Contracts', icon: FileCheck },
      { href: '/portal/procurement/grns', label: 'Goods Received (GRN)', icon: Truck },
    ],
  },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/portal') return;
    const token = getAccessToken();
    if (!token) { router.replace('/portal'); return; }
    setUser(getStoredUser());
  }, [router, pathname]);

  function handleLogout() {
    clearSession();
    router.push('/portal');
  }

  function hasAccess(permission?: string) {
    if (!permission) return true;
    if (!user) return false;
    // If applicant has not been approved and enrolled, block fees & procurement
    if (user.isApplicant && user.applicationStatus !== 'enrolled') {
      return permission === 'admission.read';
    }
    return user.permissions.includes(permission) || user.permissions.includes('platform.write');
  }

  // Bypass dashboard wrapper for the public portal login page
  if (pathname === '/portal') {
    return <>{children}</>;
  }

  if (!user) return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isApplicantLocked = Boolean(user.isApplicant && user.applicationStatus !== 'enrolled');
  const isTargetingLockedModule = isApplicantLocked && (pathname.startsWith('/portal/fees') || pathname.startsWith('/portal/procurement'));

  const initials = user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#060d1a] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-navy-800 border-r border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/5 shrink-0">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
              <GraduationCap size={17} style={{ color: '#0a1628' }} />
            </div>
            <div className="leading-none">
              <p className="text-white text-sm font-bold font-serif">Kwenda High</p>
              <p className="text-[9px] text-gold tracking-widest uppercase">EduCore Portal</p>
            </div>
          </Link>
          <button className="lg:hidden ml-auto text-white/40 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Applicant status banner */}
        {user.isApplicant && (
          <div className="p-3 mx-3 mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-[11px] text-yellow-400">
            <p className="font-semibold flex items-center gap-1"><Lock size={12} /> Applicant Account</p>
            <p className="text-white/50 text-[10px] mt-0.5">Application Under Review</p>
          </div>
        )}

        {/* Categorized Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_SECTIONS.map((section) => {
            const sectionAccessible = hasAccess(section.permission);

            return (
              <div key={section.title}>
                <div className="flex items-center justify-between px-3 mb-2">
                  <p className="text-[10px] font-semibold text-gold/70 tracking-widest uppercase">
                    {section.title}
                  </p>
                  {!sectionAccessible && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white/5 text-white/40 flex items-center gap-0.5">
                      <Lock size={10} /> Locked
                    </span>
                  )}
                </div>

                {sectionAccessible ? (
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const itemAccessible = hasAccess(item.permission);
                      if (!itemAccessible) return null;

                      const active = pathname === item.href || (item.href !== '/portal/dashboard' && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            active
                              ? 'bg-gold/15 text-gold font-semibold'
                              : 'text-white/50 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <item.icon size={15} />
                          {item.label}
                          {active && <ChevronRight size={13} className="ml-auto" />}
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-white/30 text-[11px] leading-snug">
                    Unlocks once application is approved & required fees are paid.
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center text-xs font-bold shrink-0" style={{ color: '#0a1628' }}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user.fullName}</p>
              <p className="text-white/40 text-[10px] truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Container */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 bg-navy-800 border-b border-white/5 flex items-center px-5 gap-4 sticky top-0 z-20">
          <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-white/40">Portal</span>
            <span className="text-white/20">/</span>
            <span className="text-gold font-medium capitalize">
              {pathname.split('/').slice(2).join(' / ').replace(/-/g, ' ')}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-gold rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-xs font-bold" style={{ color: '#0a1628' }}>
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content / Locked Guard */}
        <main className="flex-1 p-6 lg:p-8">
          {isTargetingLockedModule ? (
            <div className="max-w-xl mx-auto py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center justify-center mx-auto mb-5">
                <Lock size={32} />
              </div>
              <h2 className="font-serif text-2xl font-bold text-white mb-2">Module Access Locked</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Your admission application is currently <span className="text-gold font-semibold">Under Review</span>.
                Full student portal features including fee statements, invoicing, and procurement modules will unlock once your application is approved and initial fees are paid.
              </p>
              <Link
                href="/portal/admissions"
                className="px-6 py-3 rounded-xl font-semibold gold-gradient text-xs inline-flex items-center justify-center gap-2"
                style={{ color: '#0a1628' }}
              >
                <UserCheck size={16} /> Track Application Status
              </Link>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
