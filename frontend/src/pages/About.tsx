import GlassCard from '../components/GlassCard';
import SectionWrapper from '../components/SectionWrapper';
import SEOHead from '../components/SEOHead';
import { useCmsSection } from '../hooks/useCmsContent';

const ShieldIcon = () => (
  <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const HandshakeIcon = () => (
  <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const TargetIcon = () => (
  <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const PilotIcon = () => (
  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const PlaneIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const values = [
  {
    icon: <ShieldIcon />,
    title: 'Safety First',
    desc: 'Safety is at the core of everything we do. From well-maintained aircraft to thorough training protocols.',
  },
  {
    icon: <HandshakeIcon />,
    title: 'Community',
    desc: 'We foster a family-like culture where students, instructors, and staff support one another.',
  },
  {
    icon: <TargetIcon />,
    title: 'Excellence',
    desc: 'We hold ourselves to the highest standards in training, maintenance, and customer service.',
  },
  {
    icon: <HeartIcon />,
    title: 'Passion',
    desc: 'Aviation is not just our business — it is our passion. We love sharing it with others.',
  },
];

// Team data uses CMS-compatible keys but has hardcoded fallbacks
const teamBase = [
  {
    name: 'Brent Darcy',
    role: 'Founder & Chief Instructor',
    cmsKey: 'team_brent',
    fallback: 'Brent founded Darcy Aviation with a vision to create a premier flight training environment in Connecticut.',
  },
  {
    name: 'John',
    role: 'Certified Flight Instructor',
    cmsKey: 'team_john',
    fallback: 'Dedicated CFI known for patient instruction and helping students pass their checkrides with confidence.',
  },
  {
    name: 'Archana',
    role: 'Certified Flight Instructor',
    cmsKey: 'team_archana',
    fallback: 'An exceptional CFI who brings enthusiasm and expertise to every lesson. A student favorite.',
  },
];

export default function About() {
  const { get: cms } = useCmsSection('about');

  return (
    <div className="pt-24">
      <SEOHead
        title="About Us"
        description="Learn about Darcy Aviation — a local flight school founded in 2019 at Danbury Municipal Airport (KDXR), Connecticut. Meet our team of experienced certified flight instructors (CFI) and A&amp;P mechanics."
        path="/about"
      />
      {/* About Hero */}
      <SectionWrapper>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ background: "linear-gradient(135deg, rgba(255,255,255,1), rgba(200,220,255,0.8), rgba(59,130,246,0.7), rgba(212,175,55,0.7))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 4px 12px rgba(255,255,255,0.3)) drop-shadow(0 0 20px rgba(59,130,246,0.2))" }}>
            About{' '}
            <span className="bg-gradient-to-r from-aviation-blue to-gold bg-clip-text text-transparent">Darcy Aviation</span>
          </h1>
          <p className="section-subtitle">
            A passion for flight. A commitment to excellence. Your home airport at KDXR.
          </p>
        </div>

        {/* Story */}
        <div className="glass-card p-8 md:p-12 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{cms('story_title', 'Our Story')}</h2>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  {cms('story_p1', 'Founded in 2019, Darcy Aviation was born from a simple vision: to create the best flight training experience in the New York/Connecticut area. Located at Danbury Municipal Airport (KDXR), we have grown from a small operation into one of the region\'s most respected flight schools.')}
                </p>
                <p>
                  {cms('story_p2', 'Our founder, Brent Darcy, set out to build more than just a flight school — he wanted to create a community. A place where students feel like family, where instructors genuinely care about each student\'s progress, and where the joy of aviation is shared every single day.')}
                </p>
                <p>
                  {cms('story_p3', 'Today, with over 600 students trained, a premium fleet of well-maintained aircraft, and a team of experienced instructors, Darcy Aviation continues to set the standard for flight training in Connecticut.')}
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-aviation-blue/20 to-gold/20 rounded-2xl p-8 text-center">
              <div className="text-aviation-blue mb-4 flex justify-center">
                <PlaneIcon />
              </div>
              <div className="text-5xl font-extrabold bg-gradient-to-r from-aviation-blue to-gold bg-clip-text text-transparent mb-2">
                Est. 2019
              </div>
              <p className="text-slate-400">Danbury Municipal Airport</p>
              <p className="text-slate-500 text-sm">KDXR • Danbury, CT</p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Team */}
      <SectionWrapper>
        <div className="text-center mb-12">
          <h2 className="section-title">Meet the Team</h2>
          <p className="section-subtitle">The people who make Darcy Aviation special</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamBase.map((member, i) => (
            <GlassCard key={i} delay={i * 100} className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-aviation-blue to-gold mx-auto mb-4 flex items-center justify-center">
                <PilotIcon />
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
              <p className="text-gold text-sm font-medium mb-3">{member.role}</p>
              <p className="text-slate-400 text-sm leading-relaxed">{cms(member.cmsKey, member.fallback)}</p>
            </GlassCard>
          ))}
        </div>
      </SectionWrapper>

      {/* Our Airport */}
      <SectionWrapper>
        <div className="text-center mb-12">
          <h2 className="section-title">Our Airport</h2>
          <p className="section-subtitle">Danbury Municipal Airport (KDXR)</p>
        </div>
        <div className="glass-card p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">KDXR — Danbury Municipal Airport</h3>
              <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                <p>
                  Located in the heart of western Connecticut, Danbury Municipal Airport (KDXR) offers an ideal 
                  training environment. With manageable traffic, varied terrain, and proximity to controlled airspace 
                  for advanced training, KDXR provides everything a student pilot needs.
                </p>
                <p>
                  The airport features a 4,422-foot paved runway, full services, and a welcoming general aviation community. 
                  Its location in the beautiful Housatonic Valley makes every training flight scenic and memorable.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-gold font-bold">KDXR</div>
                  <div className="text-slate-500 text-xs">ICAO Code</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-gold font-bold">4,422 ft</div>
                  <div className="text-slate-500 text-xs">Runway Length</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-gold font-bold">458 ft</div>
                  <div className="text-slate-500 text-xs">Elevation</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-gold font-bold">8/26</div>
                  <div className="text-slate-500 text-xs">Runway</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2997.1!2d-73.4822!3d41.3714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e7f01f4a0b5b9d%3A0x8c1c8e5d8f1e5f0a!2sDanbury%20Airport!5e0!3m2!1sen!2sus!4v1700000000000"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Danbury Airport Map"
              />
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Values */}
      <SectionWrapper>
        <div className="text-center mb-12">
          <h2 className="section-title">Our Values</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, i) => (
            <GlassCard key={i} delay={i * 100} className="text-center">
              <div className="flex justify-center mb-4">{value.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{value.desc}</p>
            </GlassCard>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
