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

const typeIcons: Record<string, string> = {
  'Single Engine': '🛩️',
  'Twin Engine': '✈️',
  'Simulator': '🖥️',
};

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
                <span className="text-6xl relative z-10">{typeIcons[aircraft.type] || '✈️'}</span>
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
