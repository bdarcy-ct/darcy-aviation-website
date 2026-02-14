import { Link } from 'react-router-dom';
import { useCmsSection } from '../hooks/useCmsContent';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { get: cms } = useCmsSection('contact');
  const phone = cms('phone', '(203) 617-0645');
  const email = cms('email', 'admin@darcyaviation.com');
  const address = cms('address', '1 Wallingford Rd, Danbury, CT 06810');
  const hours = cms('hours', '7 Days/Week, 9AM–5PM');
  const facebook = cms('facebook', 'https://www.facebook.com/darcyaviation/');
  const instagram = cms('instagram', 'https://www.instagram.com/darcyaviation/');
  const googleMaps = cms('google_maps', 'https://www.google.com/maps?q=Darcy+Aviation+Danbury+CT');

  return (
    <footer className="glass-nav mt-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aviation-blue to-gold flex items-center justify-center text-white font-bold text-lg drop-shadow-lg">DA</div>
              <div>
                <span className="text-white font-bold text-lg">Darcy Aviation</span>
                <div className="text-gold text-[10px] tracking-wider uppercase">Danbury, Connecticut</div>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Premier flight training and aircraft maintenance at Danbury Municipal Airport (KDXR), Connecticut. Your home for aviation since 2019.
            </p>
            <div className="flex gap-3">
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Darcy Aviation on Facebook"
                className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-slate-300 hover:bg-aviation-blue/20 hover:text-aviation-blue transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Darcy Aviation on Instagram"
                className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-slate-300 hover:bg-pink-500/20 hover:text-pink-400 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a
                href={googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Find us on Google Maps"
                className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-slate-300 hover:bg-green-500/20 hover:text-green-400 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/experiences', label: 'Book an Experience' },
                { to: '/training', label: 'Flight Training' },
                { to: '/fleet', label: 'Our Fleet' },
                { to: '/maintenance', label: 'Maintenance' },
                { to: '/about', label: 'About Us' },
                { to: '/faq', label: 'FAQ' },
                { to: '/book', label: 'Book Now' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-slate-400 hover:text-gold transition-colors text-sm inline-flex items-center gap-1.5 group">
                    <svg className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Training Programs */}
          <div>
            <h4 className="text-white font-semibold mb-4">Training Programs</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/training/discovery', label: 'Discovery Flight' },
                { to: '/training/ppl', label: 'Private Pilot (PPL)' },
                { to: '/training/instrument', label: 'Instrument Rating' },
                { to: '/training/commercial', label: 'Commercial Pilot' },
                { to: '/training/multi-engine', label: 'Multi-Engine Rating' },
                { to: '/training/simulator', label: 'Flight Simulator' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-slate-400 hover:text-gold transition-colors text-sm inline-flex items-center gap-1.5 group">
                    <svg className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 mt-0.5 text-aviation-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                  {address.split(',').slice(0, 1)}<br />{address.split(',').slice(1).join(',')}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-aviation-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <a href={`tel:+1${phone.replace(/\D/g, '')}`} className="hover:text-gold transition-colors font-medium">{phone}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-aviation-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <a href={`mailto:${email}`} className="hover:text-gold transition-colors">{email}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-aviation-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{hours}</span>
              </li>
            </ul>

            {/* Gift Cards mini CTA */}
            <a
              href="https://www.flightcircle.com/shop/97822f668fb9/4000001831"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-xl px-4 py-3 text-gold text-sm font-medium hover:bg-gold/20 transition-all group"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              Purchase Gift Cards
              <svg className="w-3 h-3 ml-auto transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © {currentYear} Darcy Aviation LLC. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span>KDXR</span>
              <span className="w-1 h-1 rounded-full bg-gold" />
              <span>Danbury Municipal Airport</span>
              <span className="w-1 h-1 rounded-full bg-gold" />
              <span>Connecticut</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-1 mt-4 text-xs text-slate-600">
            <span>Website does not constitute a guarantee of aircraft availability or pricing.</span>
            <a href="tel:+12036170645" className="hover:text-gold transition-colors">Call for current rates</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
