import { useState } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import SectionWrapper from '../components/SectionWrapper';
import SEOHead from '../components/SEOHead';

const programs = [
  {
    title: 'Discovery Flight',
    slug: '/training/discovery',
    desc: '$249 — Experience the thrill of flying. You take the controls under the guidance of a certified instructor. The perfect first step or gift!',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
    ),
    highlights: ['30-min flight time', 'You fly the plane', 'No experience needed'],
    featured: true,
  },
  {
    title: 'Private Pilot License (PPL)',
    slug: '/training/ppl',
    desc: 'Your journey starts here. Learn to fly single-engine aircraft and earn your wings. The PPL is the foundation for all your future aviation goals.',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
    ),
    highlights: ['40+ flight hours', 'Ground school included', 'Solo & cross-country flights'],
  },
  {
    title: 'Instrument Rating',
    slug: '/training/instrument',
    desc: 'Master the art of flying in all weather conditions with precision instrument training. Essential for serious pilots.',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" /></svg>
    ),
    highlights: ['40+ instrument hours', 'Simulator training', 'IFR navigation & approaches'],
  },
  {
    title: 'Commercial Pilot License',
    slug: '/training/commercial',
    desc: 'Turn your passion into a career. Earn your commercial certificate and get paid to fly.',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
    ),
    highlights: ['250+ total hours', 'Complex aircraft training', 'Advanced maneuvers'],
  },
  {
    title: 'Multi-Engine Rating',
    slug: '/training/multi-engine',
    desc: 'Expand your capabilities with twin-engine aircraft training. Essential for airline and charter careers.',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
    ),
    highlights: ['Twin-engine proficiency', 'Engine-out procedures', 'Systems management'],
  },
  {
    title: 'Flight Simulator',
    slug: '/training/simulator',
    desc: 'Full-motion simulator for risk-free practice and instrument training. Build proficiency without the clock running on aircraft rental.',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" /></svg>
    ),
    highlights: ['AATD certified', 'Instrument practice', 'Procedure training'],
  },
];

const timelineSteps = [
  {
    title: 'Inquiry',
    desc: 'Reach out and learn about our programs',
    icon: (
      <svg className="w-7 h-7 text-aviation-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
    ),
  },
  {
    title: 'Discovery Flight',
    desc: 'Take the controls for the first time',
    icon: (
      <svg className="w-7 h-7 text-aviation-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
    ),
  },
  {
    title: 'Ground School',
    desc: 'Learn the theory of flight',
    icon: (
      <svg className="w-7 h-7 text-aviation-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
    ),
  },
  {
    title: 'Flight Training',
    desc: 'Build your skills in the air',
    icon: (
      <svg className="w-7 h-7 text-aviation-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
    ),
  },
  {
    title: 'Checkride',
    desc: 'Pass your FAA practical exam',
    icon: (
      <svg className="w-7 h-7 text-aviation-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
  {
    title: 'Certificate!',
    desc: 'Welcome to the skies, pilot!',
    icon: (
      <svg className="w-7 h-7 text-aviation-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-3.77 1.522m0 0a6.003 6.003 0 01-3.77-1.522" /></svg>
    ),
  },
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
      <SEOHead
        title="Flight Training Programs"
        description="Professional flight training at Darcy Aviation — Private Pilot, Instrument Rating, Commercial Pilot, Multi-Engine Rating, and discovery flights. Train 7 days/week at KDXR."
        path="/training"
      />
      {/* Hero */}
      <SectionWrapper>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.3), rgba(59,130,246,0.5), rgba(212,175,55,0.5))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 2px 8px rgba(255,255,255,0.15))" }}>
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
            <Link key={i} to={program.slug} className="block group">
              <GlassCard delay={i * 100} className={`h-full ${program.featured ? '!border-gold/30 relative' : ''}`}>
                {program.featured && (
                  <div className="absolute -top-3 right-6 bg-gradient-to-r from-gold-dark to-gold text-navy-900 text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-4">{program.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors">{program.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{program.desc}</p>
                <ul className="space-y-2 mb-4">
                  {program.highlights.map((h, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-1 text-aviation-blue text-sm font-medium group-hover:text-gold transition-colors mt-auto">
                  <span>Learn More</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </GlassCard>
            </Link>
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
                  <div className="flex-shrink-0">{step.icon}</div>
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
