import { useState, useRef, useEffect } from 'react';
import { useWeather } from '../contexts/WeatherContext';

const flightCatColors: Record<string, string> = {
  VFR: '#22c55e',
  MVFR: '#3b82f6',
  IFR: '#ef4444',
  LIFR: '#d946ef',
};

function cToF(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

function windDirLabel(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function ConditionIcon({ condition, size = 16 }: { condition: string; size?: number }) {
  const s = size;
  const common = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (condition) {
    case 'clear':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      );
    case 'few_clouds':
    case 'scattered':
      return (
        <svg {...common}>
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          <circle cx="9" cy="7" r="3" strokeDasharray="2 2" opacity={0.5} />
        </svg>
      );
    case 'broken':
    case 'overcast':
      return (
        <svg {...common}>
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
      );
    case 'rain':
      return (
        <svg {...common}>
          <path d="M17.5 15H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          <line x1="8" y1="19" x2="8" y2="22" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="16" y1="19" x2="16" y2="22" />
        </svg>
      );
    case 'snow':
      return (
        <svg {...common}>
          <path d="M17.5 15H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          <circle cx="8" cy="20" r="1" fill="currentColor" /><circle cx="12" cy="20" r="1" fill="currentColor" /><circle cx="16" cy="20" r="1" fill="currentColor" />
        </svg>
      );
    case 'fog':
    case 'mist':
      return (
        <svg {...common}>
          <line x1="3" y1="8" x2="21" y2="8" /><line x1="5" y1="12" x2="19" y2="12" /><line x1="3" y1="16" x2="21" y2="16" />
        </svg>
      );
    case 'thunderstorm':
      return (
        <svg {...common}>
          <path d="M17.5 15H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          <polyline points="13 17 10 22 14 22 11 27" stroke="#d4af37" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="5" />
        </svg>
      );
  }
}

export default function WeatherBadge() {
  const { weather, loading } = useWeather();
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    if (expanded) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [expanded]);

  if (loading || !weather) return null;

  const catColor = flightCatColors[weather.flight_category] || '#22c55e';
  const tempF = weather.temp_c !== null ? cToF(weather.temp_c) : '--';
  const windLabel = weather.wind_speed_kt > 0
    ? `${windDirLabel(weather.wind_dir)} ${weather.wind_speed_kt}kt${weather.wind_gust_kt ? `G${weather.wind_gust_kt}` : ''}`
    : 'Calm';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 text-xs text-slate-300"
        title="Current weather at KDXR"
      >
        {/* Flight category dot */}
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: catColor, boxShadow: `0 0 6px ${catColor}` }}
        />
        <ConditionIcon condition={weather.condition} size={14} />
        <span className="text-white font-medium">{tempF}°F</span>
        <span className="hidden sm:inline text-slate-400">{windLabel}</span>
      </button>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="absolute top-full right-0 mt-2 w-72 rounded-xl bg-navy-900/95 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/40 p-4 z-50 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: catColor, boxShadow: `0 0 8px ${catColor}` }}
            />
            <span className="text-sm font-semibold text-white">
              KDXR — {weather.flight_category}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs mb-3">
            <div>
              <span className="text-slate-500">Temperature</span>
              <p className="text-slate-200">{tempF}°F / {weather.temp_c !== null ? `${weather.temp_c}°C` : '--'}</p>
            </div>
            <div>
              <span className="text-slate-500">Wind</span>
              <p className="text-slate-200">{windLabel}</p>
            </div>
            <div>
              <span className="text-slate-500">Visibility</span>
              <p className="text-slate-200">{weather.visibility_miles} SM</p>
            </div>
            <div>
              <span className="text-slate-500">Ceiling</span>
              <p className="text-slate-200">{weather.ceiling_ft ? `${weather.ceiling_ft.toLocaleString()} ft` : 'None'}</p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-2">
            <span className="text-slate-500 text-xs">Raw METAR</span>
            <p className="text-slate-300 text-xs font-mono mt-1 break-all leading-relaxed">
              {weather.raw_metar || 'N/A'}
            </p>
          </div>

          <p className="text-slate-600 text-[10px] mt-2">
            Updated {new Date(weather.updated_at).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
