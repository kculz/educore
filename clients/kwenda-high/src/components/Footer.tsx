import Link from 'next/link';
import { GraduationCap, Mail, Phone, MapPin, Globe, Share2, MessageSquare, Video } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center">
                <GraduationCap size={22} style={{ color: '#0a1628' }} />
              </div>
              <div>
                <p className="font-serif font-bold text-xl">Kwenda High School</p>
                <p className="text-[10px] text-gold tracking-widest uppercase">Excellence · Integrity · Legacy</p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Nurturing tomorrow's leaders through academic excellence, moral integrity, and a commitment to lifelong learning.
            </p>
            <div className="flex gap-3 mt-6">
              {[Globe, Share2, MessageSquare, Video].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-gold/20 flex items-center justify-center transition-colors"
                  aria-label="Social Link"
                >
                  <Icon size={16} className="text-gold" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gold tracking-wide uppercase text-xs mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {['Home', 'About', 'Admissions', 'Activities', 'News', 'Blog', 'Contact'].map((l) => (
                <li key={l}>
                  <Link
                    href={`/${l.toLowerCase() === 'home' ? '' : l.toLowerCase()}`}
                    className="text-sm text-white/60 hover:text-gold transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gold tracking-wide uppercase text-xs mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm text-white/60">
                <MapPin size={15} className="text-gold mt-0.5 shrink-0" />
                123 Kwenda Road, Nairobi, Kenya
              </li>
              <li className="flex gap-3 text-sm text-white/60">
                <Phone size={15} className="text-gold shrink-0" />
                +254 700 123 456
              </li>
              <li className="flex gap-3 text-sm text-white/60">
                <Mail size={15} className="text-gold shrink-0" />
                info@kwendahigh.ac.ke
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Kwenda High School. All rights reserved.</p>
          <p>
            Powered by{' '}
            <span className="text-gold">EduCore</span> Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
