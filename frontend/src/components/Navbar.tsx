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

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Add subtle shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-navy-900/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20' : 'bg-white/5 backdrop-blur-xl border-b border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group" aria-label="Darcy Aviation Home">
              <img src="/logo-darcy-v2.png" alt="Darcy Aviation" className="h-10 w-auto transition-transform group-hover:scale-110 drop-shadow-lg" />
              <div className="hidden sm:block">
                <div className="text-white font-semibold text-sm leading-tight">Darcy Aviation</div>
                <div className="text-gold text-[10px] leading-tight tracking-wider uppercase">Danbury, Connecticut</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(location.pathname, link.path)
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <WeatherBadge />
              <Link to="/book" className="btn-gold ml-3 !px-5 !py-2 text-sm">
                Book Now
              </Link>
            </div>

            {/* Mobile: weather badge + menu button */}
            <div className="lg:hidden flex items-center gap-2">
              <WeatherBadge />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isOpen}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav - Full screen overlay (OUTSIDE nav to avoid backdrop-blur breaking fixed positioning) */}
      <div
        className={`lg:hidden fixed inset-0 z-[60] transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        style={{ backgroundColor: '#0f172a', paddingTop: '4rem' }}
      >
        {/* Close button */}
        <div className="absolute top-0 right-0 p-4">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={`px-4 py-6 space-y-1 transform transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : '-translate-y-4'
        }`}>
          {navLinks.map((link, i) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                isActive(location.pathname, link.path)
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
              style={{ transitionDelay: isOpen ? `${i * 30}ms` : '0ms' }}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4">
            <Link
              to="/book"
              className="block text-center btn-gold !py-3.5 text-base"
              onClick={() => setIsOpen(false)}
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
