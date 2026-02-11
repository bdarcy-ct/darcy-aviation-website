import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import SectionWrapper from '../components/SectionWrapper';

const services = [
  {
    title: 'Annual Inspections',
    desc: 'Comprehensive annual inspections to keep your aircraft airworthy and compliant with FAA regulations.',
    icon: '📋',
  },
  {
    title: '100-Hour Inspections',
    desc: 'Required for aircraft used in commercial operations or flight training. Thorough and detailed.',
    icon: '⏱️',
  },
  {
    title: 'Oil Changes',
    desc: 'Regular oil changes and oil analysis to keep your engine running smoothly and catch issues early.',
    icon: '🛢️',
  },
  {
    title: 'Engine Overhaul',
    desc: 'Complete engine overhaul services to extend the life of your powerplant and ensure peak performance.',
    icon: '⚙️',
  },
  {
    title: 'Avionics',
    desc: 'Installation, repair, and upgrades for your avionics systems. Stay current with modern navigation.',
    icon: '📡',
  },
  {
    title: 'Pre-Buy Inspections',
    desc: 'Thinking of buying an aircraft? Our thorough pre-buy inspection gives you confidence in your purchase.',
    icon: '🔍',
  },
];

const trustIndicators = [
  {
    title: 'FAA Certified',
    desc: 'All work performed to FAA standards',
    icon: '✅',
  },
  {
    title: 'Experienced A&P/IA Mechanics',
    desc: 'Licensed Airframe & Powerplant mechanics with Inspection Authorization',
    icon: '🔧',
  },
  {
    title: 'Cessna & Piper Specialists',
    desc: 'Deep expertise in Cessna and Piper aircraft maintenance',
    icon: '✈️',
  },
  {
    title: 'Quality Parts',
    desc: 'Only FAA-approved parts and materials used',
    icon: '🏆',
  },
];

export default function Maintenance() {
  return (
    <div className="pt-24">
      <SectionWrapper>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Aircraft{' '}
            <span className="bg-gradient-to-r from-aviation-blue to-gold bg-clip-text text-transparent">Maintenance</span>
          </h1>
          <p className="section-subtitle">
            FAA-certified maintenance services for Cessna and Piper aircraft. Keeping you safe in the skies.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <GlassCard key={i} delay={i * 100}>
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{service.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{service.desc}</p>
            </GlassCard>
          ))}
        </div>
      </SectionWrapper>

      {/* Trust Indicators */}
      <SectionWrapper>
        <div className="text-center mb-12">
          <h2 className="section-title">Why Trust Darcy Maintenance</h2>
          <p className="section-subtitle">Professional service you can count on</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustIndicators.map((item, i) => (
            <GlassCard key={i} delay={i * 100}>
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-white font-semibold mb-1">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </SectionWrapper>

      {/* Aircraft We Service */}
      <SectionWrapper>
        <div className="glass-card p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Aircraft We Service</h2>
            <p className="text-slate-300">
              We specialize in Cessna and Piper aircraft maintenance, from routine inspections to major overhauls.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🛩️</span>
                <h3 className="text-xl font-semibold text-white">Cessna Aircraft</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Full service for Cessna single-engine and light twin aircraft. 
                From the popular 172 Skyhawk to the 182 Skylane and beyond.
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">✈️</span>
                <h3 className="text-xl font-semibold text-white">Piper Aircraft</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Expert maintenance for the full range of Piper aircraft. 
                PA-28 Warriors, Archers, Arrows, and more.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper>
        <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-aviation-blue/10 to-gold/10" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">Need Maintenance?</h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              Contact us to schedule your inspection or discuss your maintenance needs. Our team is ready to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact" className="btn-gold">
                Contact Us
              </Link>
              <a href="tel:+12036170645" className="btn-blue">
                📞 (203) 617-0645
              </a>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
