import { useState } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from './GlassCard';
import SectionWrapper from './SectionWrapper';

interface FAQ {
  q: string;
  a: string;
}

interface FleetItem {
  name: string;
  description: string;
}

interface CurriculumSection {
  title: string;
  items: string[];
}

interface TrainingDetailPageProps {
  title: string;
  subtitle: string;
  heroDescription: string;
  heroIcon: React.ReactNode;
  overview: string[];
  requirements: string[];
  curriculum: CurriculumSection[];
  timeline: {
    duration: string;
    frequency: string;
    details: string;
  };
  costNote: string;
  fleet: FleetItem[];
  faqs: FAQ[];
  ctaText: string;
  ctaLink: string;
}

const BackArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6 text-aviation-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-6 h-6 text-aviation-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-6 h-6 text-aviation-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

const PlaneIcon = () => (
  <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`w-5 h-5 text-gold flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
    fill="none" viewBox="0 0 24 24" stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default function TrainingDetailPage({
  title,
  subtitle,
  heroDescription,
  heroIcon,
  overview,
  requirements,
  curriculum,
  timeline,
  costNote,
  fleet,
  faqs,
  ctaText,
  ctaLink,
}: TrainingDetailPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="pt-24">
      {/* Back link */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Link
          to="/training"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-gold transition-colors text-sm group"
        >
          <BackArrowIcon />
          <span className="group-hover:underline">Back to All Programs</span>
        </Link>
      </div>

      {/* Hero */}
      <SectionWrapper className="!pt-8">
        <div className="glass-card p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              {heroIcon}
            </div>
            <div>
              <p className="text-gold text-sm font-semibold uppercase tracking-wider mb-2">{subtitle}</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{title}</h1>
              <p className="text-slate-300 text-lg leading-relaxed max-w-3xl">{heroDescription}</p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Overview */}
      <SectionWrapper className="!pt-0">
        <h2 className="section-title mb-8">Overview</h2>
        <div className="space-y-4">
          {overview.map((paragraph, i) => (
            <p key={i} className="text-slate-300 leading-relaxed">{paragraph}</p>
          ))}
        </div>
      </SectionWrapper>

      {/* Requirements */}
      <SectionWrapper className="!pt-0">
        <h2 className="section-title mb-8">Requirements</h2>
        <GlassCard hover={false}>
          <ul className="space-y-3">
            {requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-300">
                <CheckIcon />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </SectionWrapper>

      {/* Curriculum */}
      <SectionWrapper className="!pt-0">
        <h2 className="section-title mb-8">What You'll Learn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {curriculum.map((section, i) => (
            <GlassCard key={i} delay={i * 100}>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-aviation-blue/20 border border-aviation-blue/30 flex items-center justify-center text-aviation-blue text-sm font-bold">
                  {i + 1}
                </span>
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                    <CheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>
      </SectionWrapper>

      {/* Timeline & Cost */}
      <SectionWrapper className="!pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Timeline */}
          <GlassCard hover={false}>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <ClockIcon />
              Training Timeline
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarIcon />
                <div>
                  <div className="text-white font-medium">Typical Duration</div>
                  <div className="text-slate-400 text-sm">{timeline.duration}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <InfoIcon />
                <div>
                  <div className="text-white font-medium">Recommended Frequency</div>
                  <div className="text-slate-400 text-sm">{timeline.frequency}</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed border-t border-white/10 pt-4 mt-4">
                {timeline.details}
              </p>
            </div>
          </GlassCard>

          {/* Cost */}
          <GlassCard hover={false}>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-aviation-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cost Estimate
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">{costNote}</p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-sm text-slate-400">
                Every student's journey is unique. Contact us for a personalized cost breakdown based on your goals and schedule.
              </p>
              <Link to="/contact" className="text-gold text-sm font-medium hover:underline mt-2 inline-block">
                Request a Quote
              </Link>
            </div>
          </GlassCard>
        </div>
      </SectionWrapper>

      {/* Fleet Used */}
      <SectionWrapper className="!pt-0">
        <h2 className="section-title mb-8">Fleet Used</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fleet.map((item, i) => (
            <GlassCard key={i} delay={i * 100}>
              <div className="flex items-center gap-3 mb-3">
                <PlaneIcon />
                <h3 className="text-white font-semibold">{item.name}</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
            </GlassCard>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link to="/fleet" className="text-aviation-blue hover:text-gold transition-colors text-sm font-medium">
            View Full Fleet Details
          </Link>
        </div>
      </SectionWrapper>

      {/* FAQs */}
      <SectionWrapper className="!pt-0">
        <h2 className="section-title mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-white font-medium pr-4">{faq.q}</span>
                <ChevronIcon open={openFaq === i} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-96 pb-6' : 'max-h-0'}`}>
                <p className="px-6 text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper>
        <div className="glass-card p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-slate-300 mb-8">{ctaText}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={ctaLink} className="btn-gold text-lg">
              Book Now
            </Link>
            <Link to="/contact" className="border border-white/20 hover:border-gold/50 text-white hover:text-gold px-8 py-3 rounded-lg font-semibold transition-all duration-300 text-lg">
              Contact Us
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
