'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap, LayoutDashboard, UserCheck, Receipt, LogOut, Menu, X, Bell,
  ChevronRight, ChevronDown, ShoppingCart, Settings, Building2, ShieldCheck,
  CheckCircle2, Lock, FileText, CheckSquare, Truck, Users, Tag, Award, ShieldAlert,
  PanelLeftClose, PanelLeftOpen, Layers
} from 'lucide-react';
import { getAdminAccessToken, getStoredAdminUser, clearAdminSession, type StoredAdminUser } from '@/lib/auth';
import { getActiveSchool, setActiveTenantSlug, KNOWN_SCHOOLS, type SchoolTenant } from '@/lib/tenant';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  permission?: string;
}

interface NavSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  items: NavItem[];
}

const ADMIN_SECTIONS: NavSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    icon: LayoutDashboard,
    items: [
      { href: '/portal/dashboard', label: 'Executive Hub', icon: LayoutDashboard },
    ],
  },
  {
    id: 'admissions',
    title: 'Admissions Admin',
    icon: UserCheck,
    items: [
      { href: '/portal/admissions', label: 'Applications Review', icon: UserCheck, permission: 'admission.read' },
      { href: '/portal/admissions/requirements', label: 'Admission Checklists', icon: CheckSquare, permission: 'admission.read' },
    ],
  },
  {
    id: 'fees',
    title: 'Fees & Financials',
    icon: Receipt,
    items: [
      { href: '/portal/fees', label: 'Invoices Register', icon: Receipt, permission: 'fees.read' },
      { href: '/portal/fees/receipts', label: 'Payment Receipts Log', icon: FileText, permission: 'fees.read' },
      { href: '/portal/fees/items', label: 'Fee Structures', icon: Tag, permission: 'fees.read' },
    ],
  },
  {
    id: 'procurement',
    title: 'Procurement Suite',
    icon: ShoppingCart,
    items: [
      { href: '/portal/procurement', label: 'Procurement Dashboard', icon: ShoppingCart, permission: 'procurement.read' },
      { href: '/portal/procurement/requests', label: 'Purchase Requests (PR)', icon: FileText, permission: 'procurement.read' },
      { href: '/portal/procurement/orders', label: 'Purchase Orders (PO)', icon: CheckSquare, permission: 'procurement.read' },
      { href: '/portal/procurement/suppliers', label: 'Vendor Directory', icon: Users, permission: 'procurement.read' },
      { href: '/portal/procurement/quotations', label: 'Bids & Quotations', icon: Tag, permission: 'procurement.read' },
      { href: '/portal/procurement/contracts', label: 'Supplier Contracts', icon: Award, permission: 'procurement.read' },
      { href: '/portal/procurement/grns', label: 'Goods Received (GRN)', icon: Truck, permission: 'procurement.read' },
    ],
  },
  {
    id: 'system',
    title: 'System & Security',
    icon: Settings,
    items: [
      { href: '/portal/settings', label: 'School & Licenses', icon: Settings },
      { href: '/portal/settings/mfa', label: 'Authenticator 2FA', icon: ShieldAlert },
    ],
  },
];

export default function SaaSAdminPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<StoredAdminUser | null>(null);
  const [school, setSchool] = useState<SchoolTenant>(KNOWN_SCHOOLS[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [schoolDropdown, setSchoolDropdown] = useState(false);

  // Accordion collapsed sections state (all expanded by default)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    admissions: true,
    fees: true,
    procurement: true,
    system: true,
  });

  useEffect(() => {
    if (pathname === '/portal' || pathname === '/') return;
    const token = getAdminAccessToken();
    if (!token) { router.replace('/'); return; }
    setUser(getStoredAdminUser());
    setSchool(getActiveSchool());

    // Auto expand active section
    ADMIN_SECTIONS.forEach((sec) => {
      if (sec.items.some((item) => pathname.startsWith(item.href))) {
        setExpandedSections((prev) => ({ ...prev, [sec.id]: true }));
      }
    });
  }, [router, pathname]);

  function toggleSection(secId: string) {
    setExpandedSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  }

  function handleLogout() {
    clearAdminSession();
    router.push('/');
  }

  function handleSwitchSchool(target: SchoolTenant) {
    setActiveTenantSlug(target.slug);
    setSchool(target);
    setSchoolDropdown(false);
    window.location.reload();
  }

  if (pathname === '/' || pathname === '/portal') {
    return <>{children}</>;
  }

  if (!user) return (
    <div className="min-h-screen bg-[#040810] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const initials = user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#040810] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 bg-navy-800 border-r border-white/5 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
          <Link href="/portal/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center shrink-0">
              <GraduationCap size={17} style={{ color: '#0a1628' }} />
            </div>
            {!collapsed && (
              <div className="leading-none min-w-0">
                <p className="text-white text-sm font-bold font-serif truncate">EduCore SaaS</p>
                <p className="text-[9px] text-gold tracking-widest uppercase truncate">Admin OS</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex text-white/40 hover:text-gold transition-colors p-1"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <button className="lg:hidden text-white/40 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Active School Subdomain Header */}
        {!collapsed && (
          <div className="p-3 mx-3 mt-3 bg-gold/10 border border-gold/20 rounded-xl relative">
            <div className="min-w-0">
              <p className="text-[9px] text-gold font-semibold uppercase tracking-wider">Active Client School</p>
              <p className="text-white font-bold text-xs truncate mt-0.5">{school.name}</p>
              <p className="text-white/40 text-[10px] font-mono truncate">{school.subdomain}</p>
            </div>
          </div>
        )}

        {/* Collapsible Accordion Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {ADMIN_SECTIONS.map((section) => {
            const isExpanded = expandedSections[section.id];
            const SectionIcon = section.icon;

            return (
              <div key={section.id} className="space-y-1">
                {/* Collapsible Section Accordion Header */}
                {!collapsed ? (
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] font-semibold text-gold/70 tracking-widest uppercase hover:text-gold hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <SectionIcon size={13} />
                      <span>{section.title}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                ) : (
                  <div className="px-3 text-center py-1 text-gold/50" title={section.title}>
                    <SectionIcon size={16} className="mx-auto" />
                  </div>
                )}

                {/* Section Sub-routes */}
                {(isExpanded || collapsed) && (
                  <div className="space-y-1 pl-1">
                    {section.items.map((item) => {
                      const active = pathname === item.href || (item.href !== '/portal/dashboard' && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          title={collapsed ? item.label : undefined}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            active
                              ? 'bg-gold/15 text-gold font-semibold'
                              : 'text-white/50 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <item.icon size={15} className="shrink-0" />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                          {!collapsed && active && <ChevronRight size={13} className="ml-auto shrink-0" />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="p-3 border-t border-white/5 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-xs font-bold shrink-0" style={{ color: '#0a1628' }}>
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user.fullName}</p>
                <p className="text-white/40 text-[10px] truncate">{user.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            title="Sign Out Admin"
          >
            <LogOut size={14} /> {!collapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Container */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Topbar */}
        <header className="h-16 bg-navy-800 border-b border-white/5 flex items-center px-5 gap-4 sticky top-0 z-20">
          <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>

          {/* Subdomain School Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setSchoolDropdown(!schoolDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white transition-colors"
            >
              <Building2 size={14} className="text-gold" />
              <span className="font-semibold text-xs">{school.name}</span>
              <span className="text-[10px] text-gold/70 font-mono hidden sm:inline">({school.subdomain})</span>
            </button>

            {schoolDropdown && (
              <div className="absolute top-11 left-0 z-50 w-72 bg-navy-800 border border-white/10 rounded-2xl p-2 shadow-2xl space-y-1">
                <p className="px-3 py-1.5 text-[10px] text-white/40 font-semibold uppercase">Switch Client Subdomain</p>
                {KNOWN_SCHOOLS.map((s) => (
                  <button
                    key={s.slug}
                    onClick={() => handleSwitchSchool(s)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between ${
                      s.slug === school.slug ? 'bg-gold/15 text-gold font-semibold' : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold">{s.name}</p>
                      <p className="text-[10px] text-white/40 font-mono">{s.subdomain}</p>
                    </div>
                    {s.slug === school.slug && <CheckCircle2 size={14} className="text-gold" />}
                  </button>
                ))}
              </div>
            )}
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

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
