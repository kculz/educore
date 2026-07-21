'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setTimeout(() => setState('success'), 1500);
  }

  return (
    <>
      <Navbar />

      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="text-gold text-xs tracking-widest uppercase font-semibold mb-2">Get In Touch</p>
        <h1 className="font-serif text-5xl font-bold text-white">Contact Us</h1>
        <div className="w-16 h-1 gold-gradient mx-auto mt-6 rounded-full" />
      </div>

      <section className="section-padding bg-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14">
          {/* Info */}
          <div>
            <h2 className="font-serif text-3xl font-bold text-slate-900 mb-6">We'd Love to Hear From You</h2>
            <p className="text-slate-500 leading-relaxed mb-10">
              Whether you're a prospective student, current parent, alumni, or community member — our doors are always open.
            </p>

            <div className="space-y-6">
              {[
                { icon: MapPin, label: 'Address', value: '123 Kwenda Road, Westlands, Nairobi, Kenya' },
                { icon: Phone, label: 'Phone', value: '+254 700 123 456' },
                { icon: Mail, label: 'Email', value: 'info@kwendahigh.ac.ke' },
                { icon: Clock, label: 'Office Hours', value: 'Monday – Friday: 7:30 AM – 5:00 PM' },
              ].map((c) => (
                <div key={c.label} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center shrink-0">
                    <c.icon size={18} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{c.label}</p>
                    <p className="text-slate-700 text-sm mt-0.5">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="mt-10 h-48 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={28} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Interactive map coming soon</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
            {state === 'success' ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                <p className="text-slate-500 text-sm">We'll get back to you within 1-2 business days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="font-serif text-xl font-bold text-slate-900">Send a Message</h3>
                {[
                  { label: 'Your Name *', key: 'name', type: 'text' },
                  { label: 'Email Address *', key: 'email', type: 'email' },
                  { label: 'Subject *', key: 'subject', type: 'text' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">{f.label}</label>
                    <input
                      type={f.type}
                      required
                      value={form[f.key as keyof typeof form]}
                      onChange={(e) => update(f.key, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 bg-white"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Message *</label>
                  <textarea
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-gold resize-none bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={state === 'loading'}
                  className="w-full py-3.5 rounded-xl font-semibold gold-gradient hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ color: '#0a1628' }}
                >
                  {state === 'loading' ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <><Send size={15} /> Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
