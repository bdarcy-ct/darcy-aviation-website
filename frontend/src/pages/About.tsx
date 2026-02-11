import GlassCard from '../components/GlassCard';
import SectionWrapper from '../components/SectionWrapper';

const values = [
  {
    icon: '🛡️',
    title: 'Safety First',
    desc: 'Safety is at the core of everything we do. From well-maintained aircraft to thorough training protocols.',
  },
  {
    icon: '🤝',
    title: 'Community',
    desc: 'We foster a family-like culture where students, instructors, and staff support one another.',
  },
  {
    icon: '🎯',
    title: 'Excellence',
    desc: 'We hold ourselves to the highest standards in training, maintenance, and customer service.',
  },
  {
    icon: '❤️',
    title: 'Passion',
    desc: 'Aviation is not just our business — it is our passion. We love sharing it with others.',
  },
];

const team = [
  {
    name: 'Brent Darcy',
    role: 'Founder & Chief Instructor',
    desc: 'Brent founded Darcy Aviation with a vision to create a premier flight training environment in Connecticut.',
  },
  {
    name: 'John',
    role: 'Certified Flight Instructor',
    desc: 'Dedicated CFI known for patient instruction and helping students pass their checkrides with confidence.',
  },
  {
    name: 'Archana',
    role: 'Certified Flight Instructor',
    desc: 'An exceptional CFI who brings enthusiasm and expertise to every lesson. A student favorite.',
  },
];

export default function About() {
  return (
    <div className="pt-24">
      {/* About Hero */}
      <SectionWrapper>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
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
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Our Story</h2>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  Founded in 2019, Darcy Aviation was born from a simple vision: to create the best flight training 
                  experience in the New York/Connecticut area. Located at Danbury Municipal Airport (KDXR), we have 
                  grown from a small operation into one of the region's most respected flight schools.
                </p>
                <p>
                  Our founder, Brent Darcy, set out to build more than just a flight school — he wanted to create 
                  a community. A place where students feel like family, where instructors genuinely care about each 
                  student's progress, and where the joy of aviation is shared every single day.
                </p>
                <p>
                  Today, with over 600 students trained, a premium fleet of well-maintained aircraft, and a team 
                  of experienced instructors, Darcy Aviation continues to set the standard for flight training in Connecticut.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-aviation-blue/20 to-gold/20 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">🛩️</div>
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
          {team.map((member, i) => (
            <GlassCard key={i} delay={i * 100} className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-aviation-blue to-gold mx-auto mb-4 flex items-center justify-center text-3xl">
                👨‍✈️
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
              <p className="text-gold text-sm font-medium mb-3">{member.role}</p>
              <p className="text-slate-400 text-sm leading-relaxed">{member.desc}</p>
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
              <div className="text-4xl mb-4">{value.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{value.desc}</p>
            </GlassCard>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
