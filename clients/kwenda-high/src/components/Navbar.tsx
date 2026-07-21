'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, GraduationCap } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/activities', label: 'Activities' },
  { href: '/news', label: 'News' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg shadow-black/30' : 'bg-transparent'
      }`}
      style={{ height: 'var(--nav-height)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center">
            <GraduationCap size={20} className="text-navy-900" style={{ color: '#0a1628' }} />
          </div>
          <div className="leading-none">
            <p className="text-white font-serif font-bold text-lg leading-tight">Kwenda High</p>
            <p className="text-[10px] text-gold tracking-widest uppercase">School</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3.5 py-2 text-sm text-white/80 hover:text-white hover-gold rounded-md transition-all duration-200 font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/portal"
            className="px-5 py-2 rounded-lg text-sm font-semibold text-navy-900 gold-gradient hover:opacity-90 transition-opacity shadow-md shadow-yellow-900/20"
            style={{ color: '#0a1628' }}
          >
            Student Portal
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden glass border-t border-white/10">
          <nav className="px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all font-medium text-sm"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/portal"
              onClick={() => setOpen(false)}
              className="mt-2 px-4 py-3 rounded-lg text-sm font-semibold text-center gold-gradient"
              style={{ color: '#0a1628' }}
            >
              Student Portal
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
