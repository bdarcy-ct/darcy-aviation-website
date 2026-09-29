import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import WeatherBadge from './WeatherBadge';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/experiences', label: 'Experiences' },
  { path: '/training', label: 'Training' },
  { path: '/fleet', label: 'Fleet' },
  { path: '/maintenance', label: 'Maintenance' },
  { path: '/about', label: 'About' },
  { path: '/faq', label: 'FAQ' },
  { path: '/contact', label: 'Contact' },
];

function isActive(pathname: string, linkPath: string): boolean {
  if (linkPath === '/') return pathname === '/';
  return pathname === linkPath || pathname.startsWith(linkPath + '/');
}

const PhoneIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Condense the header once the page scrolls
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Utility strip — airport identity, phone, live weather */}
        <div
          className={'hidden lg:block border-b bg-navy-950/80 backdrop-blur-md transition-all duration-300 ' +
            (scrolled ? 'h-0 opacity-0 invisible overflow-hidden border-transparent' : 'h-9 opacity-100 border-white/[0.06]')}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 h-9 flex items-center justify-between">
            <div className="flex items-center gap-4 font-mono text-[10.5px] uppercase tracking-[0.18em] text-slate-400">
              <span className="text-gold">KDXR</span>
              <span className="h-3 w-px bg-white/15" />
              <span>Danbury Municipal Airport</span>
              <span className="h-3 w-px bg-white/15" />
              <span>Open 7 days · 9am–5pm</span>
            </div>
            <div className="flex items-center gap-5">
              <a href="tel:+12036170645" className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-slate-300 hover:text-gold">
                <PhoneIcon />
                (203) 617-0645
              </a>
              <WeatherBadge />
            </div>
          </div>
        </div>

        {/* Main bar */}
        <nav
          className={'border-b transition-all duration-300 ' +
            (scrolled || isOpen
              ? 'bg-navy-900/92 backdrop-blur-xl border-white/10 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.8)]'
              : 'bg-gradient-to-b from-navy-900/70 to-navy-900/20 backdrop-blur-md border-white/[0.06]')}
          aria-label="Main navigation"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={'flex items-center justify-between transition-all duration-300 ' + (scrolled ? 'h-16' : 'h-16 md:h-[72px]')}>
              {/* Logo + wordmark */}
              <Link to="/" className="flex items-center gap-3 group" aria-label="Darcy Aviation Home">
                <img src="/logo-darcy-v3.png?v=1772822630" alt="" className="h-11 w-auto drop-shadow-lg transition-transform duration-300 group-hover:rotate-[-4deg]" />
                <div className="hidden sm:block leading-none">
                  <div className="font-display font-extrabold uppercase text-white text-[15px] tracking-[0.06em]" style={{ fontStretch: '125%' }}>
                    Darcy Aviation
                  </div>
                  <div className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.24em] text-gold/90">
                    Danbury, CT · Est. 2019
                  </div>
                </div>
              </Link>

              {/* Desktop links */}
              <div className="hidden lg:flex items-center">
                <div className="flex items-center">
                  {navLinks.map((link) => {
                    const active = isActive(location.pathname, link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        aria-current={active ? 'page' : undefined}
                        className={'group relative px-3 xl:px-3.5 py-2 text-[13.5px] font-medium transition-colors duration-200 ' +
                          (active ? 'text-white' : 'text-slate-400 hover:text-white')}
                      >
                        {link.label}
                        <span
                          className={'absolute left-3 right-3 xl:left-3.5 xl:right-3.5 -bottom-[3px] h-[2px] rounded-full bg-gold transition-all duration-300 ' +
                            (active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100 !bg-white/40')}
                        />
                      </Link>
                    );
                  })}
                </div>
                <div className="ml-5 pl-5 border-l border-white/10 flex items-center gap-3">
                  {scrolled && (
                    <a href="tel:+12036170645" className="p-2 rounded-md text-slate-400 hover:text-gold transition-colors" aria-label="Call (203) 617-0645">
                      <PhoneIcon className="w-4 h-4" />
                    </a>
                  )}
                  <Link to="/experiences" className="btn-gold !px-5 !py-2.5 text-[13px]">
                    Book Now
                  </Link>
                </div>
              </div>

              {/* Mobile: phone + Book Now + menu button */}
              <div className="lg:hidden flex items-center gap-2">
                <a
                  href="tel:+12036170645"
                  className="w-10 h-10 rounded-md border border-white/15 flex items-center justify-center text-gold"
                  aria-label="Call (203) 617-0645"
                >
                  <PhoneIcon className="w-4 h-4" />
                </a>
                <Link to="/experiences" className="btn-gold !px-4 !py-2.5 text-[13px]">
                  Book Now
                </Link>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-10 h-10 rounded-md flex items-center justify-center text-slate-200 hover:bg-white/10 transition-colors"
                  aria-label={isOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={isOpen}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 7h16M4 12h16M10 17h10" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu — full-screen sheet (outside header so backdrop-blur doesn't break fixed positioning) */}
      <div
        className={'lg:hidden fixed inset-0 z-[45] transition-all duration-300 ' +
          (isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none')}
        style={{ backgroundColor: '#07101c' }}
      >
        <div className="absolute inset-0 chart-grid opacity-60 pointer-events-none" />
        <div className={'relative h-full overflow-y-auto px-5 pt-24 pb-10 transform transition-transform duration-300 ' + (isOpen ? 'translate-y-0' : '-translate-y-3')}>
          <div className="eyebrow mb-6">Navigate</div>
          <div className="border-t border-white/10">
            {navLinks.map((link, i) => {
              const active = isActive(location.pathname, link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-baseline gap-4 py-4 border-b border-white/10 group"
                  style={{ transitionDelay: isOpen ? (i * 30) + 'ms' : '0ms' }}
                >
                  <span className="font-mono text-[11px] text-gold/80 w-6">{String(i + 1).padStart(2, '0')}</span>
                  <span
                    className={'font-display text-2xl font-bold ' + (active ? 'text-gold' : 'text-white group-hover:text-gold')}
                    style={{ fontStretch: '115%' }}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="pt-8 space-y-3">
            <Link to="/experiences" className="btn-gold w-full !py-4 text-base" onClick={() => setIsOpen(false)}>
              Book an Experience
            </Link>
            <a href="tel:+12036170645" className="btn-blue w-full !py-4 text-base">
              <PhoneIcon className="w-4 h-4" />
              (203) 617-0645
            </a>
            <p className="pt-4 text-center font-mono text-[10.5px] uppercase tracking-[0.2em] text-slate-500">
              KDXR · Danbury Municipal Airport
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
