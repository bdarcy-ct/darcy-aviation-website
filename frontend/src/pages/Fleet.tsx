import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import SectionWrapper from '../components/SectionWrapper';
import { DARCY_FLEET } from '../data/darcyContent';
import SEOHead from '../components/SEOHead';
import { CardSkeleton } from '../components/Skeleton';
import { useCmsSection } from '../hooks/useCmsContent';

// Hard-coded fleet snapshot, used if the CMS is unreachable or empty
const SNAPSHOT_FLEET = DARCY_FLEET.filter((a) => a.available).map((a, i) => ({
  id: -(i + 1), name: a.name, type: a.type, engine: a.engine, seats: a.seats, horsepower: a.horsepower,
  cruise_speed: a.cruise_speed, range: a.range, description: a.description, image_url: a.image_url,
  images: a.images, available: a.available,
}));

// Brent often types just the number ("124"), so add the unit for display
function formatSpeed(speed: string): string {
  const s = (speed || '').trim();
  return /^\d+$/.test(s) ? s + ' kt' : s || '—';
}

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
  images: string[];
  available: number;
}

// Image carousel component — cycles every 2 seconds with crossfade
function ImageCycler({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => setIdx(prev => (prev + 1) % images.length), 2000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="absolute inset-0">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${alt} ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
    </div>
  );
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

// Aircraft photo with a designed fallback — a missing/broken image never shows a broken-image icon
function AircraftPhoto({ src, alt, type }: { src: string; alt: string; type: string }) {
  const [failed, setFailed] = useState(!src);
  if (failed) {
    return (
      <div className="absolute inset-0 chart-grid !bg-navy-800 flex flex-col items-center justify-center gap-3" style={{ maskImage: 'none', WebkitMaskImage: 'none' }}>
        <div className="w-16 h-16 rounded-md border border-gold/30 bg-gold/[0.06] flex items-center justify-center text-gold">
          {getTypeIcon(type)}
        </div>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-slate-500">Photo coming soon</span>
      </div>
    );
  }
  return <img src={src} alt={alt} onError={() => setFailed(true)} className="absolute inset-0 w-full h-full object-cover" />;
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
      .then((data) => { setFleet(Array.isArray(data) && data.length > 0 ? data : SNAPSHOT_FLEET); setLoading(false); })
      .catch(() => { setFleet(SNAPSHOT_FLEET); setLoading(false); });
  }, []);

  return (
    <div className="pt-24">
      <SEOHead
        title="Our Fleet"
        description="Explore Darcy Aviation's well-maintained fleet of Cessna and Piper aircraft plus our AATD full-motion flight simulator at Danbury Municipal Airport (KDXR)."
        path="/fleet"
      />
      <SectionWrapper>
        <div className="page-header">
          <div className="eyebrow">Fleet · KDXR</div>
          <h1 className="page-title">
            Our{' '}
            <span className="text-gold">Fleet</span>
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
                {/* Aircraft images with cycling */}
                <div className="h-56 bg-gradient-to-br from-navy-700/50 to-navy-900/50 flex items-center justify-center relative overflow-hidden">
                  {(aircraft.images?.length > 0) ? (
                    <ImageCycler images={aircraft.images} alt={aircraft.name} />
                  ) : (
                    <AircraftPhoto src={aircraft.image_url} alt={aircraft.name} type={aircraft.type} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-navy-900/70 border border-white/15 text-slate-200 font-mono text-[10px] uppercase tracking-[0.16em] px-2.5 py-1 rounded backdrop-blur-sm">
                      {aircraft.type}
                    </span>
                  </div>
                  {aircraft.images?.length > 1 && (
                    <div className="absolute bottom-2 right-2 z-10 flex gap-1">
                      {aircraft.images.map((_, di) => (
                        <span key={di} className="w-1.5 h-1.5 rounded-full bg-white/40" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{aircraft.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">{aircraft.description}</p>

                  {/* Specs grid */}
                  {aircraft.type !== 'Simulator' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y hairline">
                      <div className="text-center">
                        <div className="data-label mb-1.5">{aircraft.engine && aircraft.engine !== 'N/A' ? 'Engine' : 'Type'}</div>
                        <div className="text-white font-medium text-sm">{aircraft.engine && aircraft.engine !== 'N/A' ? aircraft.engine : aircraft.type}</div>
                      </div>
                      <div className="text-center">
                        <div className="data-label mb-1.5">Seats</div>
                        <div className="text-white font-medium text-sm">{aircraft.seats}</div>
                      </div>
                      <div className="text-center">
                        <div className="data-label mb-1.5">Power</div>
                        <div className="text-white font-medium text-sm">{aircraft.horsepower} HP</div>
                      </div>
                      <div className="text-center">
                        <div className="data-label mb-1.5">Cruise</div>
                        <div className="text-white font-medium text-sm">{formatSpeed(aircraft.cruise_speed)}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="data-label mb-1.5">Type</div>
                        <div className="text-white font-medium text-sm">AATD Certified</div>
                      </div>
                      <div className="text-center">
                        <div className="data-label mb-1.5">Seats</div>
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
