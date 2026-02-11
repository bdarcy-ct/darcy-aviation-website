import { useState } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import SectionWrapper from '../components/SectionWrapper';

const programs = [
  {
    title: 'Private Pilot License (PPL)',
    desc: 'Your journey starts here. Learn to fly single-engine aircraft and earn your wings. The PPL is the foundation for all your future aviation goals.',
    icon: '🎓',
    highlights: ['40+ flight hours', 'Ground school included', 'Solo & cross-country flights'],
  },
  {
    title: 'Instrument Rating',
    desc: 'Master the art of flying in all weather conditions with precision instrument training. Essential for serious pilots.',
    icon: '🌧️',
    highlights: ['40+ instrument hours', 'Simulator training', 'IFR navigation & approaches'],
  },
  {
    title: 'Commercial Pilot License',
    desc: 'Turn your passion into a career. Earn your commercial certificate and get paid to fly.',
    icon: '💼',
    highlights: ['250+ total hours', 'Complex aircraft training', 'Advanced maneuvers'],
  },
  {
    title: 'Multi-Engine Rating',
    desc: 'Expand your capabilities with twin-engine aircraft training. Essential for airline and charter careers.',
    icon: '✈️',
    highlights: ['Twin-engine proficiency', 'Engine-out procedures', 'Systems management'],
  },
  {
    title: 'Discovery Flight',
    desc: '$249 — Experience the thrill of flying. You take the controls under the guidance of a certified instructor. The perfect first step or gift!',
    icon: '🚀',
    highlights: ['30-min flight time', 'You fly the plane', 'No experience needed'],
    featured: true,
  },
  {
    title: 'Flight Simulator',
    desc: 'Full-motion simulator for risk-free practice and instrument training. Build proficiency without the clock running on aircraft rental.',
    icon: '🖥️',
    highlights: ['AATD certified', 'Instrument practice', 'Procedure training'],
  },
];

const timelineSteps = [
  { title: 'Inquiry', desc: 'Reach out and learn about our programs', icon: '📞' },
  { title: 'Discovery Flight', desc: 'Take the controls for the first time', icon: '✈️' },
  { title: 'Ground School', desc: 'Learn the theory of flight', icon: '📚' },
  { title: 'Flight Training', desc: 'Build your skills in the air', icon: '🛩️' },
  { title: 'Checkride', desc: 'Pass your FAA practical exam', icon: '✅' },
  { title: 'Certificate!', desc: 'Welcome to the skies, pilot!', icon: '🎉' },
];

const faqs = [
  {
    q: 'How long does it take to get a Private Pilot License?',
    a: 'Most students complete their PPL in 3-6 months, depending on how frequently they fly. The FAA requires a minimum of 40 flight hours, but the national average is around 60-70 hours.',
  },
  {
    q: 'Do I need any prerequisites to start flying?',
    a: 'No prior experience is needed! You must be at least 16 to solo and 17 to earn your private pilot certificate. You will need a medical certificate from an FAA Aviation Medical Examiner.',
  },
  {
    q: 'How much does flight training cost?',
    a: 'Costs vary based on the program and your learning pace. Contact us for a personalized estimate. Discovery flights start at $249.',
  },
  {
    q: 'Can I fly in bad weather during training?',
    a: 'VFR (Visual Flight Rules) students train in fair weather. Once you pursue your Instrument Rating, you will learn to fly safely in instrument conditions.',
  },
];

export default function Training() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="pt-24">
      {/* Hero */}
      <SectionWrapper>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Flight Training{' '}
            <span className="bg-gradient-to-r from-aviation-blue to-gold bg-clip-text text-transparent">Programs</span>
          </h1>
          <p className="section-subtitle">
            From your first flight to career-ready certifications. Professional instruction tailored to your goals.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program, i) => (
            <GlassCard key={i} delay={i * 100} className={program.featured ? '!border-gold/30 relative' : ''}>
              {program.featured && (
                <div className="absolute -top-3 right-6 bg-gradient-to-r from-gold-dark to-gold text-navy-900 text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <div className="text-4xl mb-4">{program.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{program.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{program.desc}</p>
              <ul className="space-y-2">
                {program.highlights.map((h, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                    <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {h}
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>
      </SectionWrapper>

      {/* Training Process Timeline */}
      <SectionWrapper>
        <div className="text-center mb-12">
          <h2 className="section-title">Your Path to the Skies</h2>
          <p className="section-subtitle">A clear roadmap from inquiry to certification</p>
        </div>
        <div className="relative max-w-4xl mx-auto">
          {/* Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 timeline-line transform -translate-x-1/2" />
          
          <div className="space-y-8 md:space-y-12">
            {timelineSteps.map((step, i) => (
              <GlassCard key={i} delay={i * 150} className={`md:w-5/12 ${i % 2 === 0 ? 'md:ml-auto md:mr-4' : 'md:mr-auto md:ml-4'} relative`}>
                {/* Connector dot */}
                <div className="hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-aviation-blue to-gold border-2 border-navy-900 z-10"
                  style={{ [i % 2 === 0 ? 'left' : 'right']: '-2.5rem' }}
                />
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{step.icon}</div>
                  <div>
                    <div className="text-gold text-xs font-semibold mb-1">STEP {i + 1}</div>
                    <h3 className="text-white font-semibold text-lg">{step.title}</h3>
                    <p className="text-slate-400 text-sm">{step.desc}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper>
        <div className="glass-card p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-slate-300 mb-8">Book a discovery flight and take the first step toward earning your wings.</p>
          <Link to="/book" className="btn-gold text-lg">
            Book a Discovery Flight — $249
          </Link>
        </div>
      </SectionWrapper>

      {/* FAQ */}
      <SectionWrapper>
        <div className="text-center mb-12">
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-white font-medium pr-4">{faq.q}</span>
                <svg
                  className={`w-5 h-5 text-gold flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-96 pb-6' : 'max-h-0'}`}>
                <p className="px-6 text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
