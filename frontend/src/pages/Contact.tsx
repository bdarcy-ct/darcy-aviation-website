import { useState } from 'react';
import GlassCard from '../components/GlassCard';
import SectionWrapper from '../components/SectionWrapper';
import SEOHead from '../components/SEOHead';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setStatusMsg(data.message);
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setStatusMsg(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setStatusMsg('Failed to submit. Please try again.');
    }
  };

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-aviation-blue/50 focus:bg-white/10 transition-all';

  const contactInfo = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      ),
      label: 'Address',
      value: '1 Wallingford Rd, Danbury, CT 06810',
      href: 'https://maps.google.com/?q=1+Wallingford+Rd+Danbury+CT+06810',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
      ),
      label: 'Phone',
      value: '(203) 617-0645',
      href: 'tel:+12036170645',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      ),
      label: 'Email',
      value: 'admin@darcyaviation.com',
      href: 'mailto:admin@darcyaviation.com',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ),
      label: 'Hours',
      value: '7 Days/Week, 9AM\u20135PM',
    },
  ];

  return (
    <div className="pt-24">
      <SEOHead
        title="Contact Us"
        description="Get in touch with Darcy Aviation — call (203) 617-0645, email admin@darcyaviation.com, or visit us at 1 Wallingford Rd, Danbury, CT 06810 (KDXR)."
        path="/contact"
      />
      <SectionWrapper>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.3), rgba(59,130,246,0.5), rgba(212,175,55,0.5))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 2px 8px rgba(255,255,255,0.15))" }}>
            Get in{' '}
            <span className="bg-gradient-to-r from-aviation-blue to-gold bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="section-subtitle">
            We'd love to hear from you. Reach out by phone, email, or visit us at the airport.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {contactInfo.map((item, i) => (
              <GlassCard key={i} delay={i * 100} className="!p-5">
                <div className="flex items-start gap-4">
                  <div className="text-aviation-blue flex-shrink-0 mt-0.5">{item.icon}</div>
                  <div>
                    <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">{item.label}</div>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-white font-medium hover:text-gold transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="text-white font-medium">{item.value}</span>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}

            {/* Social Links */}
            <GlassCard delay={400} className="!p-5">
              <div className="text-slate-500 text-xs uppercase tracking-wider mb-3">Follow Us</div>
              <div className="flex gap-3">
                <a
                  href="https://www.facebook.com/darcyaviation/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-300 hover:bg-aviation-blue/10 hover:text-aviation-blue hover:border-aviation-blue/30 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </a>
                <a
                  href="https://www.instagram.com/darcyaviation/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-300 hover:bg-pink-500/10 hover:text-pink-400 hover:border-pink-500/30 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  Instagram
                </a>
              </div>
            </GlassCard>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>

              {status === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                  <p className="text-slate-300">{statusMsg}</p>
                  <button onClick={() => setStatus('idle')} className="btn-blue mt-6">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text" placeholder="Full Name *" required
                      className={inputClass}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    <input
                      type="email" placeholder="Email Address *" required
                      className={inputClass}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <input
                    type="tel" placeholder="Phone Number"
                    className={inputClass}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  <select
                    className={inputClass}
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  >
                    <option value="">Select Subject</option>
                    <option value="Flight Training">Flight Training</option>
                    <option value="Discovery Flight">Discovery Flight</option>
                    <option value="Scenic Tours">Scenic Tours & Experiences</option>
                    <option value="Aircraft Maintenance">Aircraft Maintenance</option>
                    <option value="Aircraft Rental">Aircraft Rental</option>
                    <option value="Pre-Buy Inspection">Pre-Buy Inspection</option>
                    <option value="Gift Cards">Gift Cards</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                  <textarea
                    placeholder="Your message *" required
                    rows={6}
                    className={inputClass + ' resize-none'}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                  {status === 'error' && (
                    <p className="text-red-400 text-sm">{statusMsg}</p>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-gold w-full !py-4 text-lg disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? 'Sending...' : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Map */}
      <SectionWrapper>
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Find Us at KDXR</h2>
            <p className="text-slate-400 text-sm">Danbury Municipal Airport — 1 Wallingford Rd, Danbury, CT 06810</p>
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2997.1!2d-73.4822!3d41.3714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e7f01f4a0b5b9d%3A0x8c1c8e5d8f1e5f0a!2sDanbury%20Airport!5e0!3m2!1sen!2sus!4v1700000000000"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Darcy Aviation Location"
          />
        </div>
      </SectionWrapper>
    </div>
  );
}
