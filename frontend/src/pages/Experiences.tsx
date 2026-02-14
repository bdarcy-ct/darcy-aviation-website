import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import SectionWrapper from '../components/SectionWrapper';
import SEOHead from '../components/SEOHead';

const experiences = [
  {
    title: 'Discovery Flight',
    price: '$249',
    slug: 'discovery-flight',
    desc: 'Take the captain\'s seat and experience the thrill of flying firsthand. Whether it\'s been a lifelong dream or a spark of curiosity, grab the controls with an experienced instructor by your side and see the world from above.',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
    ),
    highlights: ['~30 minutes', 'You fly the plane', 'No experience needed'],
    featured: true,
  },
  {
    title: 'Candlewood Lake Tour',
    price: '$290',
    slug: 'candlewood-lake-tour',
    desc: 'Soar over the majestically wooded Candlewood Lake region. Take in sweeping views of Connecticut\'s largest lake, rolling hills, and charming shoreline communities from the best seat in the house.',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
      </svg>
    ),
    highlights: ['~45 minutes', 'Scenic lake views', 'Perfect for families'],
  },
  {
    title: 'West Point & Hudson River Tour',
    price: '$379',
    slug: 'west-point-hudson-river-tour',
    desc: 'Fly over the storied grounds of the West Point Military Academy, then navigate your way down the legendary Hudson River. A stunning blend of American history and natural beauty from an altitude most only dream of.',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
    highlights: ['~1 hour', 'West Point flyover', 'Hudson River corridor'],
  },
  {
    title: 'NYC Skyline Tour',
    price: '$550',
    slug: 'nyc-skyline-tour',
    desc: 'Fly through America\'s most iconic skyline at eye level with breathtaking skyscrapers along the Hudson River. See the Statue of Liberty, the Empire State Building, and Central Park from a perspective that will leave you speechless.',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    highlights: ['~1.5 hours', 'Manhattan skyline', 'A flight you\'ll never forget'],
  },
  {
    title: 'City Lights Night Tour',
    price: '$680',
    slug: 'city-lights-night-tour',
    desc: 'The most spectacular flight you and your loved ones will ever experience. Cruise down the Hudson River through the glittering Manhattan skyline, then sweep out over the East River — all under the magic of city lights after dark.',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
      </svg>
    ),
    highlights: ['~1.5 hours', 'Night flight over NYC', 'Unforgettable date night'],
    featured: true,
  },
];

export default function Experiences() {
  return (
    <div className="pt-24">
      <SEOHead
        title="Book an Experience"
        description="Book unforgettable flying experiences at Darcy Aviation — Discovery flights from $249, scenic tours over Candlewood Lake, West Point, NYC Skyline, and City Lights night tours."
        path="/experiences"
      />
      {/* Hero */}
      <SectionWrapper>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.3), rgba(59,130,246,0.5), rgba(212,175,55,0.5))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 2px 8px rgba(255,255,255,0.15))" }}>
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
          {experiences.map((exp, i) => (
            <Link key={i} to={`/book?experience=${exp.slug}&title=${encodeURIComponent(exp.title)}&price=${encodeURIComponent(exp.price)}`} className="block group">
              <GlassCard delay={i * 100} className={`h-full ${exp.featured ? '!border-gold/30 relative' : ''}`}>
                {exp.featured && (
                  <div className="absolute -top-3 right-6 bg-gradient-to-r from-gold-dark to-gold text-navy-900 text-xs font-bold px-3 py-1 rounded-full">
                    {i === 0 ? 'MOST POPULAR' : 'UNFORGETTABLE'}
                  </div>
                )}
                <div className="mb-4">{exp.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors">{exp.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{exp.desc}</p>
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
                  <div className="flex items-center gap-1 text-aviation-blue text-sm font-medium group-hover:text-gold transition-colors">
                    <span>Book Now</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <span className="text-gold font-semibold text-sm">{exp.price}</span>
                </div>
              </GlassCard>
            </Link>
          ))}
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
