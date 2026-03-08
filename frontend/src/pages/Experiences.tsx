import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import SectionWrapper from '../components/SectionWrapper';
import SEOHead from '../components/SEOHead';
import { useExperiences } from '../hooks/useExperiences';

// FlightCircle booking links for each experience
const flightCircleLinks: Record<string, string> = {
  'discovery-flight': 'https://www.flightcircle.com/shop/97822f668fb9/4000001759',
  'candlewood-lake-tour': 'https://www.flightcircle.com/shop/97822f668fb9/4000001846',
  'west-point-hudson-river-tour': 'https://www.flightcircle.com/shop/97822f668fb9/4000001848',
  'nyc-skyline-tour': 'https://www.flightcircle.com/shop/97822f668fb9/4000001849',
  'city-lights-night-tour': 'https://www.flightcircle.com/shop/97822f668fb9/4000001850',
};

// Glow colors for each tile (always-on, intensify on hover)
const tileGlowColors = [
  { gradient: 'from-blue-500 to-cyan-500', shadow: 'rgba(59,130,246,0.3)', shadowHover: 'rgba(59,130,246,0.5)' },
  { gradient: 'from-violet-500 to-purple-500', shadow: 'rgba(139,92,246,0.3)', shadowHover: 'rgba(139,92,246,0.5)' },
  { gradient: 'from-emerald-500 to-teal-500', shadow: 'rgba(16,185,129,0.3)', shadowHover: 'rgba(16,185,129,0.5)' },
  { gradient: 'from-amber-500 to-orange-500', shadow: 'rgba(245,158,11,0.3)', shadowHover: 'rgba(245,158,11,0.5)' },
  { gradient: 'from-pink-500 to-rose-500', shadow: 'rgba(236,72,153,0.3)', shadowHover: 'rgba(236,72,153,0.5)' },
  { gradient: 'from-indigo-500 to-blue-500', shadow: 'rgba(99,102,241,0.3)', shadowHover: 'rgba(99,102,241,0.5)' },
  { gradient: 'from-cyan-500 to-sky-500', shadow: 'rgba(6,182,212,0.3)', shadowHover: 'rgba(6,182,212,0.5)' },
  { gradient: 'from-rose-500 to-red-500', shadow: 'rgba(244,63,94,0.3)', shadowHover: 'rgba(244,63,94,0.5)' },
];

// Default icon mapped by slug
const defaultIcons: Record<string, JSX.Element> = {
  'discovery-flight': (
    <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  ),
  'candlewood-lake-tour': (
    <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
    </svg>
  ),
  'west-point-hudson-river-tour': (
    <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
    </svg>
  ),
  'nyc-skyline-tour': (
    <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  ),
  'city-lights-night-tour': (
    <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  ),
};

const defaultIcon = (
  <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

// Fallback data if API fails
const fallbackExperiences = [
  {
    slug: 'discovery-flight',
    title: 'Discovery Flight',
    price: '$279',
    description: 'Take your first step to become a pilot. Whether it\'s been a lifelong dream or a spark of curiosity, grab the controls with an experienced instructor by your side and see the world from above.',
    highlights: ['~30 minutes', 'You fly the plane', 'No experience needed'],
    featured: true,
  },
  {
    slug: 'candlewood-lake-tour',
    title: 'Candlewood Lake Tour',
    price: '$290',
    description: 'Soar over the majestically wooded Candlewood Lake region. Take in sweeping views of Connecticut\'s largest lake, rolling hills, and charming shoreline communities from the best seat in the house.',
    highlights: ['~45 minutes', 'Scenic lake views', 'Perfect for families'],
    featured: false,
  },
  {
    slug: 'west-point-hudson-river-tour',
    title: 'West Point & Hudson River Tour',
    price: '$379',
    description: 'Fly over the storied grounds of the West Point Military Academy, then navigate your way down the legendary Hudson River. A stunning blend of American history and natural beauty from an altitude most only dream of.',
    highlights: ['~1 hour', 'West Point flyover', 'Hudson River corridor'],
    featured: false,
  },
  {
    slug: 'nyc-skyline-tour',
    title: 'NYC Skyline Tour',
    price: '$550',
    description: 'Fly through America\'s most iconic skyline at eye level with breathtaking skyscrapers along the Hudson River. See the Statue of Liberty, the Empire State Building, and Central Park from a perspective that will leave you speechless.',
    highlights: ['~1.5 hours', 'Manhattan skyline', 'A flight you\'ll never forget'],
    featured: false,
  },
  {
    slug: 'city-lights-night-tour',
    title: 'City Lights Night Tour',
    price: '$680',
    description: 'The most spectacular flight you and your loved ones will ever experience. Cruise down the Hudson River through the glittering Manhattan skyline, then sweep out over the East River — all under the magic of city lights after dark.',
    highlights: ['~1.5 hours', 'Night flight over NYC', 'Unforgettable date night'],
    featured: true,
  },
];

function ExperiencesPage() {
  const { experiences: apiExperiences, loading } = useExperiences();

  // Use API data if available, otherwise fall back to hardcoded
  const experiences = apiExperiences.length > 0
    ? apiExperiences.map((exp) => ({
        slug: exp.slug,
        title: exp.title,
        price: exp.price,
        description: exp.description,
        icon: exp.icon_svg
          ? <div className="w-8 h-8 text-gold [&_svg]:w-full [&_svg]:h-full [&_svg]:stroke-current" dangerouslySetInnerHTML={{ __html: exp.icon_svg }} />
          : (defaultIcons[exp.slug] || defaultIcon),
        highlights: exp.highlights,
        featured: !!exp.featured,
      }))
    : fallbackExperiences.map((exp) => ({
        ...exp,
        icon: defaultIcons[exp.slug] || defaultIcon,
      }));

  return (
    <div className="pt-24">
      <SEOHead
        title="Book an Experience"
        description="Book scenic airplane rides and flying experiences in Connecticut — Discovery flights from $279, Candlewood Lake tours, West Point &amp; Hudson River tours, NYC Skyline tours, and City Lights night tours. Gift certificates available."
        path="/experiences"
      />
      {/* Hero */}
      <SectionWrapper>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ background: "linear-gradient(135deg, rgba(255,255,255,1), rgba(200,220,255,0.8), rgba(59,130,246,0.7), rgba(212,175,55,0.7))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 4px 12px rgba(255,255,255,0.3)) drop-shadow(0 0 20px rgba(59,130,246,0.2))" }}>
            Book an{' '}
            <span className="bg-gradient-to-r from-aviation-blue to-gold bg-clip-text text-transparent">
              Experience
            </span>
          </h1>
          <p className="section-subtitle">
            From your first time at the controls to a nighttime flight through the Manhattan skyline — 
            choose your adventure and make memories that last a lifetime.
          </p>
        </div>

        {/* Experience Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp, i) => {
            const glow = tileGlowColors[i % tileGlowColors.length];
            return (
              <a key={i} href={flightCircleLinks[exp.slug] || '#'} target="_blank" rel="noopener noreferrer" className="block group relative">
                {/* Always-on glow */}
                <div
                  className="absolute -inset-1 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at center, ${glow.shadow}, transparent 70%)` }}
                />
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${glow.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl`} />
                <GlassCard delay={i * 100} className={`h-full relative ${exp.featured ? '!border-gold/30' : ''}`}>
                  {exp.featured && (
                    <div className="absolute -top-3 right-6 bg-gradient-to-r from-gold-dark to-gold text-navy-900 text-xs font-bold px-3 py-1 rounded-full">
                      {i === 0 ? 'MOST POPULAR' : 'UNFORGETTABLE'}
                    </div>
                  )}
                  <div className="mb-4">{exp.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors">{exp.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{exp.description}</p>
                  <ul className="space-y-2 mb-4">
                    {exp.highlights.map((h, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                        <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {h}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-gold-dark to-gold text-navy-900 font-bold text-sm px-4 py-2 rounded-lg group-hover:shadow-lg group-hover:shadow-gold/25 transition-all">
                      Book Now
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                    <span className="text-gold font-semibold text-sm">{exp.price}</span>
                  </div>
                </GlassCard>
              </a>
            );
          })}

          {/* Learn to Fly tile */}
          <Link to="/training" className="block group relative">
            <div
              className="absolute -inset-1 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.3), transparent 70%)' }}
            />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-emerald-500 to-teal-500 opacity-60 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl" />
            <GlassCard delay={(experiences.length) * 100} className="h-full relative flex flex-col">
              <div className="mb-4">
                <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors">Learn to Fly</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">From your first discovery flight to advanced ratings — explore our full range of flight training programs at KDXR.</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Private Pilot through Commercial
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Experienced CFIs
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Train 7 days/week
                </li>
              </ul>
              <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium group-hover:text-gold transition-colors mt-auto">
                <span>View Programs</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </GlassCard>
          </Link>

          {/* Maintenance tile */}
          <Link to="/maintenance" className="block group relative">
            <div
              className="absolute -inset-1 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.3), transparent 70%)' }}
            />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-amber-500 to-orange-500 opacity-60 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl" />
            <GlassCard delay={(experiences.length + 1) * 100} className="h-full relative flex flex-col">
              <div className="mb-4">
                <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17l-5.658 3.286a1.125 1.125 0 01-1.674-.996V5.437a1.125 1.125 0 01.388-.855l5.66-4.837a1.125 1.125 0 011.578.04l3.94 4.04a1.125 1.125 0 01-.04 1.594l-3.194 3.011m2.1 2.1l3.194-3.011a1.125 1.125 0 01.824-.257c.596.067 1.185.17 1.767.308a1.125 1.125 0 01.84 1.089v4.94a1.125 1.125 0 01-1.12 1.125H15" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors">Maintenance</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">FAA-certified A&P/IA mechanics for all your aircraft maintenance needs — from annuals to engine overhauls.</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Annual & 100-hour inspections
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Engine overhauls & avionics
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Cessna & Piper specialists
                </li>
              </ul>
              <div className="flex items-center gap-1 text-amber-400 text-sm font-medium group-hover:text-gold transition-colors mt-auto">
                <span>Learn More</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </GlassCard>
          </Link>

          {/* Contact Us tile */}
          <Link to="/contact" className="block group relative">
            <div
              className="absolute -inset-1 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.3), transparent 70%)' }}
            />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-indigo-500 to-blue-500 opacity-60 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl" />
            <GlassCard delay={(experiences.length + 2) * 100} className="h-full relative flex flex-col items-center justify-center text-center">
              <div className="mb-4">
                <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors">Contact Us</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">Have questions about our experiences or want to plan a custom flight? We'd love to hear from you.</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Custom flight requests
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Group bookings
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  (203) 617-0645
                </li>
              </ul>
              <div className="flex items-center gap-1 text-aviation-blue text-sm font-medium group-hover:text-gold transition-colors mt-auto">
                <span>Get in Touch</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </GlassCard>
          </Link>
        </div>
      </SectionWrapper>

      {/* Gift Card CTA */}
      <SectionWrapper>
        <div className="glass-card p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Give the Gift of Flight</h2>
          <p className="text-slate-300 mb-8">
            Any experience can be purchased as a gift card — the perfect present for birthdays, anniversaries, or just because.
          </p>
          <a
            href="https://www.flightcircle.com/shop/97822f668fb9/4000001831"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold text-lg"
          >
            Purchase Gift Card
          </a>
        </div>
      </SectionWrapper>

      {/* Contact strip */}
      <SectionWrapper>
        <div className="text-center">
          <p className="text-slate-400 mb-2">Questions about any of our experiences?</p>
          <p className="text-white">
            Call us at{' '}
            <a href="tel:+12036170645" className="text-gold hover:underline font-semibold">(203) 617-0645</a>
            {' '}or{' '}
            <Link to="/contact" className="text-aviation-blue hover:underline font-semibold">send us a message</Link>
          </p>
        </div>
      </SectionWrapper>
    </div>
  );
}

export default ExperiencesPage;
