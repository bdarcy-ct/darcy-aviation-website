import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import SectionWrapper from '../components/SectionWrapper';
import SEOHead from '../components/SEOHead';
import { CardSkeleton } from '../components/Skeleton';
import { useCmsSection } from '../hooks/useCmsContent';

interface Aircraft {
  id: number;
  name: string;
  type: string;
  engine: string;
  seats: number;
  horsepower: number;
  cruise_speed: string;
  range: string;
  description: string;
  image_url: string;
  available: number;
}

const PlaneIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const ComputerIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
  </svg>
);

function getTypeIcon(type: string) {
  if (type === 'Simulator') return <ComputerIcon />;
  return <PlaneIcon />;
}

export default function Fleet() {
  const { get: cms } = useCmsSection('fleet');
  const [fleet, setFleet] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/fleet')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load fleet data');
        return res.json();
      })
      .then((data) => { setFleet(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  return (
    <div className="pt-24">
      <SEOHead
        title="Our Fleet"
        description="Explore Darcy Aviation's well-maintained fleet of Cessna and Piper aircraft plus our AATD full-motion flight simulator at Danbury Municipal Airport (KDXR)."
        path="/fleet"
      />
      <SectionWrapper>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ background: "linear-gradient(135deg, rgba(255,255,255,1), rgba(200,220,255,0.8), rgba(59,130,246,0.7), rgba(212,175,55,0.7))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 4px 12px rgba(255,255,255,0.3)) drop-shadow(0 0 20px rgba(59,130,246,0.2))" }}>
            Our{' '}
            <span className="bg-gradient-to-r from-aviation-blue to-gold bg-clip-text text-transparent">Fleet</span>
          </h1>
          <p className="section-subtitle">
            {cms('subheadline', 'Well-maintained aircraft and cutting-edge simulator for every stage of your training.')}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <div className="glass-card p-8 text-center">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">Unable to Load Fleet</h3>
            <p className="text-slate-400 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-blue">
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {fleet.map((aircraft, i) => (
              <GlassCard key={aircraft.id} delay={i * 150} className="!p-0 overflow-hidden">
                {/* Image placeholder with gradient */}
                <div className="h-48 bg-gradient-to-br from-navy-700/50 to-navy-900/50 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
                  <div className="relative z-10 w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-aviation-blue">
                    {getTypeIcon(aircraft.type)}
                  </div>
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-aviation-blue/20 border border-aviation-blue/50 text-aviation-blue text-xs font-medium px-3 py-1 rounded-full">
                      {aircraft.type}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{aircraft.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">{aircraft.description}</p>

                  {/* Specs grid */}
                  {aircraft.type !== 'Simulator' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Engine</div>
                        <div className="text-white font-medium text-sm">{aircraft.type}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Seats</div>
                        <div className="text-white font-medium text-sm">{aircraft.seats}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Power</div>
                        <div className="text-white font-medium text-sm">{aircraft.horsepower} HP</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cruise</div>
                        <div className="text-white font-medium text-sm">{aircraft.cruise_speed}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Type</div>
                        <div className="text-white font-medium text-sm">AATD Certified</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Seats</div>
                        <div className="text-white font-medium text-sm">{aircraft.seats}</div>
                      </div>
                    </div>
                  )}

                  {aircraft.range && aircraft.range !== 'N/A' && (
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-slate-500 text-xs uppercase tracking-wider">Range</span>
                      <span className="text-gold font-medium text-sm">{aircraft.range}</span>
                    </div>
                  )}

                  {/* Availability indicator */}
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${aircraft.available ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className="text-xs text-slate-500">{aircraft.available ? 'Available' : 'In Maintenance'}</span>
                    </div>
                    <Link
                      to={aircraft.type === 'Simulator' ? '/training/simulator' : '/experiences'}
                      className="text-xs text-aviation-blue hover:text-gold transition-colors font-medium"
                    >
                      {aircraft.type === 'Simulator' ? 'Book Sim Time' : 'Book a Flight'} →
                    </Link>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* Fleet info */}
      <SectionWrapper>
        <div className="glass-card p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Our Commitment to Safety</h2>
          <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed mb-6">
            Every aircraft in our fleet undergoes rigorous maintenance and inspections by our FAA-certified A&P mechanics. 
            We maintain our Cessna and Piper aircraft to the highest standards, ensuring you can focus on learning while we handle the rest.
          </p>
          <Link to="/maintenance" className="btn-blue inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Learn About Our Maintenance
          </Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
