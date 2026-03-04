import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import SectionWrapper from '../components/SectionWrapper';
import SEOHead from '../components/SEOHead';
import AnimatedCounter from '../components/AnimatedCounter';
import { TestimonialSkeleton } from '../components/Skeleton';
import VideoHero from '../components/VideoHero';
import ReviewCarousel from '../components/ReviewCarousel';
import { useCmsContent } from '../hooks/useCmsContent';

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
        description="Darcy Aviation — Premier flight training and aircraft maintenance at Danbury Municipal Airport (KDXR), Connecticut. Discovery flights from $279. Private Pilot through Commercial licenses. FAA-certified maintenance."
        path="/"
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Looping hero videos */}
        <VideoHero />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-24 sm:pt-0">
          {/* Logo */}
          <div className="mb-6">
            <img src="/logo-darcy-v2.png" alt="Darcy Aviation" className="w-40 sm:w-52 mx-auto drop-shadow-2xl" />
          </div>

          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-slate-300 text-sm">{cms('hero', 'badge_text', 'Now accepting students at KDXR — Danbury, CT')}</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight" style={{ background: "linear-gradient(135deg, rgba(255,255,255,1), rgba(200,220,255,0.8), rgba(59,130,246,0.7), rgba(212,175,55,0.7))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 4px 12px rgba(255,255,255,0.3)) drop-shadow(0 0 20px rgba(59,130,246,0.2))" }}>
            Take Flight at{' '}
            <span className="bg-gradient-to-r from-aviation-blue via-blue-400 to-gold bg-clip-text text-transparent">
              Darcy Aviation
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            {cms('hero', 'subheadline', "Connecticut's premier flight training destination. Professional instruction, premium fleet, and unforgettable scenic tours at Danbury Municipal Airport.")}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/experiences" className="btn-gold text-lg group">
              <span className="inline-flex items-center gap-2">
                <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                Book an Experience
              </span>
            </Link>
            <Link to="/training" className="btn-blue text-lg">
              Explore Programs →
            </Link>
          </div>

          {/* Quick trust badges under CTA */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
              FAA Certified
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              4.9★ on Google
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
              600+ Students
            </span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Stats Bar with Animated Counters */}
      <div className="relative z-10 -mt-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="glass-card p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-aviation-blue to-gold bg-clip-text text-transparent">
                <AnimatedCounter target={600} suffix="+" />
              </div>
              <div className="text-slate-400 text-sm mt-1">Students Trained</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-aviation-blue to-gold bg-clip-text text-transparent">
                7
              </div>
              <div className="text-slate-400 text-sm mt-1">Days a Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-aviation-blue to-gold bg-clip-text text-transparent">
                4.9★
              </div>
              <div className="text-slate-400 text-sm mt-1">Google Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-aviation-blue to-gold bg-clip-text text-transparent">
                2019
              </div>
              <div className="text-slate-400 text-sm mt-1">Established</div>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <SectionWrapper>
        <div className="text-center mb-12">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">Everything you need to take to the skies</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service: any, i: number) => (
            <Link key={i} to={service.link} className="block group h-full">
              <GlassCard delay={i * 100} className="h-full overflow-hidden">
                {service.images && service.images.length > 0 && (
                  <div className="relative w-full h-40 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-xl" style={{ width: 'calc(100% + 2.5rem)' }}>
                    {service.images.map((src: string, imgIdx: number) => (
                      <img
                        key={src}
                        src={src}
                        alt={service.title}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                          imgIdx === (tileIndices[i] || 0) % service.images.length ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
                  </div>
                )}
                {!service.images && (
                  <div className="text-aviation-blue mb-4 transition-transform group-hover:scale-110 group-hover:text-gold duration-300">{service.icon}</div>
                )}
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-gold transition-colors">{service.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{service.desc}</p>
                <span className="inline-flex items-center gap-1 text-gold text-sm mt-4 font-medium group-hover:gap-2 transition-all">
                  Learn More
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
              </GlassCard>
            </Link>
          ))}
        </div>
      </SectionWrapper>

      {/* Why Darcy */}
      <SectionWrapper>
        <div className="text-center mb-12">
          <h2 className="section-title">Why Choose Darcy Aviation</h2>
          <p className="section-subtitle">What sets us apart from the rest</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyDarcy.map((item, i) => (
            <GlassCard key={i} delay={i * 100}>
              <div className="w-12 h-12 rounded-xl bg-aviation-blue/10 flex items-center justify-center text-aviation-blue mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </SectionWrapper>

      {/* Reviews */}
      <SectionWrapper>
        <div className="text-center mb-12">
          <h2 className="section-title">What Our Students Say</h2>
          <p className="section-subtitle">Real reviews from Google and our community</p>
        </div>
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <TestimonialSkeleton />
          ) : testimonials.length > 0 ? (
            <ReviewCarousel reviews={testimonials} />
          ) : null}
        </div>
      </SectionWrapper>

      {/* Experience Teaser */}
      <SectionWrapper>
        <div className="glass-card p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-aviation-blue/5" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Unforgettable Flying Experiences
              </h2>
              <p className="text-slate-300 leading-relaxed mb-6">
                From your first discovery flight to a breathtaking night tour over the Manhattan skyline — 
                we offer five unique flying experiences for every occasion.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                {['Discovery Flight $279', 'Candlewood Lake $290', 'West Point $379', 'NYC Skyline $550', 'City Lights $680'].map((exp) => (
                  <span key={exp} className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-slate-300">
                    {exp}
                  </span>
                ))}
              </div>
              <Link to="/experiences" className="btn-gold">
                View All Experiences
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 text-center">
                <div className="text-3xl font-bold text-gold mb-1">5</div>
                <div className="text-slate-400 text-sm">Unique Tours</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-3xl font-bold text-aviation-blue mb-1">$279</div>
                <div className="text-slate-400 text-sm">Starting From</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-3xl font-bold text-white mb-1">NYC</div>
                <div className="text-slate-400 text-sm">Skyline Tours</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-3xl font-bold text-gold mb-1">
                  <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <div className="text-slate-400 text-sm">Gift Cards</div>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* CTA Banner */}
      <SectionWrapper>
        <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-aviation-blue/10 to-gold/10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {cms('cta', 'headline', 'Ready to Start Your Aviation Journey?')}
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
              {cms('cta', 'subheadline', "Whether you're dreaming of your private pilot license or looking for a unique gift, we're here to help you take flight.")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/experiences" className="btn-gold text-lg">
                Book a Discovery Flight — $279
              </Link>
              <a
                href="https://www.flightcircle.com/shop/97822f668fb9/4000001759"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-blue text-lg"
              >
                <span className="inline-flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                  Gift Cards
                </span>
              </a>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
