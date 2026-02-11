import { useEffect, useState } from 'react';
import GlassCard from '../components/GlassCard';
import SectionWrapper from '../components/SectionWrapper';

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
  const [fleet, setFleet] = useState<Aircraft[]>([]);

  useEffect(() => {
    fetch('/api/fleet')
      .then((res) => res.json())
      .then(setFleet)
      .catch(console.error);
  }, []);

  return (
    <div className="pt-24">
      <SectionWrapper>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Our{' '}
            <span className="bg-gradient-to-r from-aviation-blue to-gold bg-clip-text text-transparent">Fleet</span>
          </h1>
          <p className="section-subtitle">
            Well-maintained aircraft and cutting-edge simulator for every stage of your training.
          </p>
        </div>

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
                      <div className="text-white font-medium text-sm">Full Motion</div>
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
              </div>
            </GlassCard>
          ))}
        </div>
      </SectionWrapper>

      {/* Fleet info */}
      <SectionWrapper>
        <div className="glass-card p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Our Commitment to Safety</h2>
          <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Every aircraft in our fleet undergoes rigorous maintenance and inspections by our FAA-certified A&P mechanics. 
            We maintain our Cessna and Piper aircraft to the highest standards, ensuring you can focus on learning while we handle the rest.
          </p>
        </div>
      </SectionWrapper>
    </div>
  );
}
