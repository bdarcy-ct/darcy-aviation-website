import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import GlassCard from '../components/GlassCard';
import SectionWrapper from '../components/SectionWrapper';
import SEOHead from '../components/SEOHead';
import AnimatedCounter from '../components/AnimatedCounter';
import { TestimonialSkeleton } from '../components/Skeleton';
import VideoHero from '../components/VideoHero';
import ReviewCarousel from '../components/ReviewCarousel';
import { useCmsContent } from '../hooks/useCmsContent';
import { useExperiences } from '../hooks/useExperiences';

interface Testimonial {
  id: number;
  name: string;
  rating: number;
  text: string;
  date: string;
  featured: number;
  source?: string;
}

interface ServiceTile {
  id: number;
  title: string;
  description: string;
  link: string;
  icon_svg: string | null;
  images: string[];
  sort_order: number;
}

export default function Home() {
  const { get: cms } = useCmsContent();
  const { experiences } = useExperiences();

  // Experiences board + discovery pricing come from the CMS so prices never drift
  const fallbackBoard = [
    { title: 'Discovery Flight', duration: '~30 minutes', price: '$279' },
    { title: 'Candlewood Lake Tour', duration: '~45 minutes', price: '$290' },
    { title: 'West Point & Hudson River Tour', duration: '~1 hour', price: '$379' },
    { title: 'NYC Skyline Tour', duration: '~1.5 hours', price: '$550' },
    { title: 'City Lights Night Tour', duration: '~1.5 hours', price: '$680' },
  ];
  const board = experiences.length > 0
    ? experiences.map((exp) => ({
        title: exp.title,
        duration: (exp.highlights || []).find((h) => /min|hour/i.test(h)) || '—',
        price: exp.price,
      }))
    : fallbackBoard;
  const discoveryExp = experiences.find((exp) => exp.slug === 'discovery-flight');
  const discovery = {
    title: discoveryExp?.title || 'Discovery Flight',
    price: discoveryExp?.price || '$279',
    duration: (discoveryExp?.highlights || []).find((h) => /min|hour/i.test(h)) || '~30 min',
  };
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [serviceTiles, setServiceTiles] = useState<ServiceTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [tilesLoading, setTilesLoading] = useState(true);

  useEffect(() => {
    fetch('/api/testimonials')
      .then((res) => res.json())
      .then((data) => { setTestimonials(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch('/api/public/service-tiles')
      .then((res) => res.json())
      .then((data) => { setServiceTiles(data); setTilesLoading(false); })
      .catch(() => setTilesLoading(false));
  }, []);

  // Testimonial rotation now handled by ReviewCarousel component

  const [tileIndices, setTileIndices] = useState([0, 0, 0]);

  useEffect(() => {
    // Stagger tiles: tile 0 swaps at 0s, tile 1 at 2s, tile 2 at 4s, then every 6s each
    const timers = [0, 1, 2].map((i) => {
      let timeout: ReturnType<typeof setTimeout>;
      let interval: ReturnType<typeof setInterval>;
      timeout = setTimeout(() => {
        setTileIndices((prev) => { const next = [...prev]; next[i] = prev[i] + 1; return next; });
        interval = setInterval(() => {
          setTileIndices((prev) => { const next = [...prev]; next[i] = prev[i] + 1; return next; });
        }, 6000);
      }, i * 2000);
      return () => { clearTimeout(timeout); if (interval) clearInterval(interval); };
    });
    return () => timers.forEach((cleanup) => cleanup());
  }, []);

  // Fallback hardcoded services (used if CMS data unavailable)
  const fallbackServices = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
      ),
      title: 'Flight Training',
      desc: 'From Private Pilot to Commercial — structured programs with experienced CFIs who care about your success.',
      link: '/training',
      images: ['/images/training/train-1.jpg', '/images/training/train-2.jpg', '/images/training/train-3.jpg', '/images/training/train-4.jpg', '/images/training/train-5.jpg'],
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      ),
      title: 'Aircraft Maintenance',
      desc: 'FAA-certified A&P/IA mechanics. Annuals, 100-hour inspections, engine overhauls, and custom needs tailored to your aircraft.',
      link: '/maintenance',
      images: ['/images/maintenance/maint-1.jpg', '/images/maintenance/maint-2.jpg', '/images/maintenance/maint-3.jpg', '/images/maintenance/maint-4.jpg', '/images/maintenance/maint-5.jpg'],
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
      ),
      title: 'Scenic Tours',
      desc: 'From $279 — Discovery flights, Candlewood Lake, West Point, NYC Skyline, and City Lights night tours.',
      link: '/experiences',
      images: ['/images/scenic/scenic-1.jpg', '/images/scenic/scenic-2.jpg', '/images/scenic/scenic-3.jpg', '/images/scenic/scenic-4.jpg', '/images/scenic/scenic-5.jpg', '/images/scenic/scenic-6.jpg', '/images/scenic/scenic-7.jpg', '/images/scenic/scenic-8.jpg', '/images/scenic/scenic-9.jpg', '/images/scenic/scenic-10.jpg', '/images/scenic/scenic-11.jpg', '/images/scenic/scenic-12.jpg', '/images/scenic/scenic-13.jpg'],
    },
  ];

  // Convert CMS service tiles to the format expected by the component
  const services = !tilesLoading && serviceTiles.length > 0
    ? serviceTiles.map(tile => ({
        icon: tile.icon_svg ? (
          <div dangerouslySetInnerHTML={{ __html: tile.icon_svg }} />
        ) : (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
        ),
        title: tile.title,
        desc: tile.description,
        link: tile.link,
        images: tile.images,
      }))
    : fallbackServices;

  const whyDarcy = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      title: 'Experienced Instructors',
      desc: 'Professional CFIs dedicated to your success with personalized one-on-one attention.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      ),
      title: 'Premium Fleet',
      desc: 'Well-maintained Cessna and Piper aircraft plus an AATD full-motion simulator.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      ),
      title: 'Customized Programs',
      desc: 'Flexible training tailored to your goals, schedule, and learning style.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      title: 'Safety First',
      desc: 'Rigorous maintenance standards and thorough safety protocols on every flight.',
    },
  ];

  return (
    <div>
      <SEOHead
        description="Learn to fly at Darcy Aviation — the best flight school near Danbury, CT. Discovery flights from $279, scenic airplane rides over Connecticut, Private Pilot through Commercial licenses, and FAA-certified aircraft maintenance at KDXR."
        path="/"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Darcy Aviation",
          "description": "Premier flight training, scenic airplane tours, and FAA-certified aircraft maintenance at Danbury Municipal Airport (KDXR), Connecticut.",
          "url": "https://darcyaviation.com",
          "telephone": "+1-203-617-0645",
          "email": "admin@darcyaviation.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "1 Wallingford Rd",
            "addressLocality": "Danbury",
            "addressRegion": "CT",
            "postalCode": "06810",
            "addressCountry": "US"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 41.3714,
            "longitude": -73.4822
          },
          "openingHours": "Mo-Su 09:00-17:00",
          "priceRange": "$$",
          "image": "https://darcyaviation.com/logo-darcy-v3.png",
          "sameAs": [
            "https://www.facebook.com/darcyaviation/",
            "https://www.instagram.com/darcyaviation/"
          ],
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "50",
            "bestRating": "5"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Flying Experiences",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Discovery Flight",
                  "description": "Take your first step to become a pilot with a 30-minute introductory flight."
                },
                "price": "279.00",
                "priceCurrency": "USD"
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "NYC Skyline Tour",
                  "description": "Fly through Manhattan's iconic skyline along the Hudson River."
                },
                "price": "550.00",
                "priceCurrency": "USD"
              }
            ]
          }
        })}</script>
      </Helmet>

      {/* ============================ HERO ============================ */}
      <section className="relative min-h-[100svh] flex items-end overflow-hidden">
        <VideoHero />
        <div className="absolute inset-0 film-grain pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-10 md:pb-12">
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            {/* Headline column */}
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-3 animate-rise" style={{ animationDelay: '80ms' }}>
                <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-navy-900/50 backdrop-blur px-3.5 py-1.5 text-[12.5px] text-slate-200">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  {cms('hero', 'badge_text', 'Now accepting students at KDXR — Danbury, CT')}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/[0.08] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-gold">
                  FAA-certified instructors
                </span>
              </div>

              {/* Headline keeps the original typeface (Inter) and blue-to-gold gradient */}
              <div className="mt-7 animate-rise" style={{ animationDelay: '180ms' }}>
                <h1
                  className="hero-classic text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight tracking-tight"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,1), rgba(200,220,255,0.8), rgba(59,130,246,0.7), rgba(212,175,55,0.7))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 4px 12px rgba(255,255,255,0.3)) drop-shadow(0 0 20px rgba(59,130,246,0.2))" }}
                >
                  Take Flight at{' '}
                  <span className="bg-gradient-to-r from-[#3b82f6] via-[#60a5fa] to-[#d4af37] bg-clip-text text-transparent">
                    Darcy Aviation
                  </span>
                </h1>
              </div>

              <p className="mt-7 max-w-xl text-lg md:text-xl text-slate-200/90 leading-relaxed animate-rise" style={{ animationDelay: '280ms' }}>
                {cms('hero', 'subheadline', "Connecticut's premier flight training destination. Professional instruction, premium fleet, and unforgettable scenic tours at Danbury Municipal Airport.")}
              </p>

              <div className="mt-9 flex flex-col sm:flex-row sm:items-center gap-3 animate-rise" style={{ animationDelay: '380ms' }}>
                <Link to="/experiences" className="btn-gold text-base !py-3.5 group">
                  <svg className="w-4 h-4 transition-transform group-hover:-rotate-12" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                  Book an Experience
                </Link>
                <Link to="/training" className="btn-blue text-base !py-3.5 backdrop-blur-sm">
                  Learn to Fly
                </Link>
                <div className="flex items-center gap-6 sm:ml-4 pt-2 sm:pt-0">
                  <Link to="/fleet" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-200 hover:text-gold">
                    Our Fleet
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                  <Link to="/maintenance" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-200 hover:text-gold">
                    Maintenance
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Discovery flight "boarding pass" */}
            <div className="hidden lg:block lg:col-span-4 animate-rise" style={{ animationDelay: '520ms' }}>
              <Link to="/experiences" className="group block rounded-xl border border-white/15 bg-navy-900/60 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/40 hover:border-gold/50 transition-colors">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 font-mono text-[10.5px] uppercase tracking-[0.18em] text-slate-400">
                  <span>First flight</span>
                  <span className="text-gold">KDXR ⟶ KDXR</span>
                </div>
                <div className="px-5 pt-5 pb-6">
                  <div className="font-display text-2xl font-bold text-white" style={{ fontStretch: '112%' }}>{discovery.title}</div>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">No experience needed — you take the controls with a certified instructor beside you.</p>
                  <div className="mt-5 grid grid-cols-3 border-y border-dashed border-white/15">
                    <div className="py-3">
                      <div className="data-label">Duration</div>
                      <div className="mt-1 text-sm font-semibold text-white">{discovery.duration}</div>
                    </div>
                    <div className="py-3 border-x border-dashed border-white/15 px-3">
                      <div className="data-label">Pilot</div>
                      <div className="mt-1 text-sm font-semibold text-white">You</div>
                    </div>
                    <div className="py-3 pl-3">
                      <div className="data-label">Fare</div>
                      <div className="mt-1 text-sm font-semibold text-gold">{discovery.price}</div>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white group-hover:text-gold transition-colors">Book your first flight</span>
                    <span className="w-9 h-9 rounded-md bg-gold text-navy-900 flex items-center justify-center transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Instrument strip */}
          <div className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 border-t border-white/20 animate-rise" style={{ animationDelay: '620ms' }}>
            {[
              { label: 'Students trained', value: <AnimatedCounter target={600} suffix="+" /> },
              { label: 'Open every week', value: '7 days' },
              { label: 'Google rating', value: '4.9★' },
              { label: 'Established', value: '2019' },
            ].map((stat, i) => (
              <div key={stat.label} className={'pt-5 pb-1 ' + (i % 2 === 1 ? 'pl-5 md:pl-6 ' : 'md:pl-6 ') + (i === 0 ? '!pl-0 ' : '') + (i < 3 ? 'md:border-r md:border-white/10' : '')}>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-slate-400">{stat.label}</div>
                <div className="mt-1.5 font-display text-[1.7rem] sm:text-3xl md:text-[2.1rem] font-bold text-white whitespace-nowrap" style={{ fontStretch: '112%' }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ SERVICES ============================ */}
      <SectionWrapper className="!pt-24 md:!pt-32">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="eyebrow">Our Services</div>
            <h2 className="section-title mt-5 max-w-xl">Everything you need to take to the skies.</h2>
          </div>
          <p className="text-slate-400 max-w-sm md:text-right">Learn to fly, keep your aircraft airworthy, or just go see Connecticut from 3,000 feet.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {services.map((service: any, i: number) => (
            <Link key={i} to={service.link} className="block group h-full">
              <GlassCard delay={i * 100} className="h-full !p-0 overflow-hidden flex flex-col">
                <div className="relative h-60 overflow-hidden">
                  {service.images && service.images.length > 0 ? (
                    service.images.map((src: string, imgIdx: number) => (
                      <img
                        key={src}
                        src={src}
                        alt={service.title}
                        loading="lazy"
                        className={'absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-[1.04] ' +
                          (imgIdx === (tileIndices[i] || 0) % service.images.length ? 'opacity-100' : 'opacity-0')}
                      />
                    ))
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gold">{service.icon}</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/20 to-transparent" />
                  <span className="absolute top-4 left-4 font-mono text-[11px] tracking-[0.2em] text-white/90 bg-navy-900/60 backdrop-blur px-2 py-1 rounded">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="p-6 pt-2 flex flex-col flex-1">
                  <h3 className="text-2xl font-bold text-white group-hover:text-gold transition-colors">{service.title}</h3>
                  <p className="mt-3 text-slate-400 text-[15px] leading-relaxed flex-1">{service.desc}</p>
                  <span className="mt-6 pt-4 border-t hairline inline-flex items-center justify-between text-sm font-semibold text-white">
                    Learn more
                    <span className="text-gold transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </SectionWrapper>

      {/* ============================ WHY DARCY ============================ */}
      <SectionWrapper>
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <div className="eyebrow">Why Darcy</div>
              <h2 className="section-title mt-5">Why choose Darcy Aviation</h2>
              <p className="text-slate-400 text-lg leading-relaxed">What sets us apart from the rest — and why 600+ students have trained with us at KDXR.</p>
              <Link to="/about" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-light">
                Meet the team <span>→</span>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-8 grid sm:grid-cols-2 border-t border-l hairline">
            {whyDarcy.map((item, i) => (
              <div key={i} className="group relative border-b border-r hairline p-7 md:p-9 transition-colors hover:bg-white/[0.02]">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-11 h-11 rounded-md border border-gold/30 bg-gold/[0.07] flex items-center justify-center text-gold">
                    {item.icon}
                  </div>
                  <span className="font-mono text-[11px] tracking-[0.2em] text-slate-600 group-hover:text-gold/80 transition-colors">
                    {String(i + 1).padStart(2, '0')} / {String(whyDarcy.length).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ============================ REVIEWS ============================ */}
      <SectionWrapper>
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-4">
            <div className="eyebrow">Reviews</div>
            <h2 className="section-title mt-5">What our students say</h2>
            <p className="text-slate-400 leading-relaxed">Real reviews from Google and our community.</p>
            <div className="mt-8 flex items-end gap-4">
              <div className="font-display text-6xl font-extrabold text-white leading-none" style={{ fontStretch: '115%' }}>4.9</div>
              <div className="pb-1">
                <div className="flex gap-0.5 text-gold" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <svg key={n} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-slate-500">Google rating</div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-8">
            {loading ? (
              <TestimonialSkeleton />
            ) : testimonials.length > 0 ? (
              <ReviewCarousel reviews={testimonials} />
            ) : null}
          </div>
        </div>
      </SectionWrapper>

      {/* ============================ EXPERIENCES BOARD ============================ */}
      <SectionWrapper>
        <div className="glass-card overflow-hidden">
          <div className="grid lg:grid-cols-12">
            <div className="lg:col-span-5 p-8 md:p-12 border-b lg:border-b-0 lg:border-r hairline flex flex-col">
              <div className="eyebrow">Experiences</div>
              <h2 className="section-title mt-5">Unforgettable flying experiences</h2>
              <p className="text-slate-300 leading-relaxed">
                From your first discovery flight to a breathtaking night tour over the Manhattan skyline —
                we offer unique flying experiences for every occasion.
              </p>
              <div className="mt-auto pt-10 flex flex-col sm:flex-row gap-3">
                <Link to="/experiences" className="btn-gold">View All Experiences</Link>
                <a href="https://www.flightcircle.com/shop/97822f668fb9/4000001831" target="_blank" rel="noopener noreferrer" className="btn-blue">
                  Gift Cards
                </a>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="hidden sm:grid grid-cols-12 px-6 md:px-8 py-3 border-b hairline font-mono text-[10.5px] uppercase tracking-[0.18em] text-slate-500 bg-navy-950/40">
                <span className="col-span-1">No.</span>
                <span className="col-span-6">Flight</span>
                <span className="col-span-3">Time</span>
                <span className="col-span-2 text-right">Fare</span>
              </div>
              {board.map((row, i) => (
                <Link
                  key={row.title}
                  to="/experiences"
                  className="group grid grid-cols-12 items-center gap-y-1 px-6 md:px-8 py-4 border-b last:border-b-0 hairline hover:bg-gold/[0.04] transition-colors"
                >
                  <span className="col-span-2 sm:col-span-1 font-mono text-xs text-slate-500 group-hover:text-gold">{String(i + 1).padStart(2, '0')}</span>
                  <span className="col-span-7 sm:col-span-6 font-semibold text-white group-hover:text-gold transition-colors">{row.title}</span>
                  <span className="hidden sm:block col-span-3 font-mono text-xs text-slate-400">{row.duration}</span>
                  <span className="col-span-3 sm:col-span-2 text-right font-mono text-sm font-medium text-gold">{row.price}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ============================ CTA ============================ */}
      <section className="relative mt-10 overflow-hidden">
        <img src="/images/scenic/scenic-4.jpg" alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/85 to-navy-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-navy-900/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="eyebrow">Cleared for takeoff</div>
            <h2 className="section-title mt-5 !text-4xl md:!text-5xl">
              {cms('cta', 'headline', 'Ready to Start Your Aviation Journey?')}
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-10">
              {cms('cta', 'subheadline', "Whether you're dreaming of your private pilot license or looking for a unique gift, we're here to help you take flight.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/experiences" className="btn-gold text-base !py-3.5">
                Book a Discovery Flight — {discovery.price}
              </Link>
              <a
                href="https://www.flightcircle.com/shop/97822f668fb9/4000001759"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-blue text-base !py-3.5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                Gift Cards
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
