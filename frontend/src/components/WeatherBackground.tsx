import { useMemo, useEffect, useState } from 'react';
import { useWeather } from '../contexts/WeatherContext';
import RainEffect from './particles/RainEffect';
import SnowEffect from './particles/SnowEffect';

interface BlobConfig {
  color: string;
  size: string;
  position: string;
  opacity: number;
}

interface WeatherTheme {
  blobs: BlobConfig[];
  overlayClass: string;
  showStars: boolean;
  showClouds: boolean;
  showRain: boolean;
  showSnow: boolean;
  showLightning: boolean;
  showFog: boolean;
  animSpeedMultiplier: number;
}

function getWindMultiplier(windKt: number): number {
  if (windKt <= 5) return 1;
  if (windKt <= 15) return 1.5;
  return 2.2;
}

function getTheme(condition: string, isNight: boolean, windKt: number): WeatherTheme {
  const windMult = getWindMultiplier(windKt);

  const base: WeatherTheme = {
    blobs: [],
    overlayClass: '',
    showStars: false,
    showClouds: false,
    showRain: false,
    showSnow: false,
    showLightning: false,
    showFog: false,
    animSpeedMultiplier: windMult,
  };

  switch (condition) {
    case 'clear':
      if (isNight) {
        base.blobs = [
          { color: '#1e3a5f', size: 'w-96 h-96', position: '-top-48 -left-48', opacity: 0.2 },
          { color: '#1e293b', size: 'w-72 h-72', position: 'top-1/3 right-0', opacity: 0.15 },
          { color: '#3b82f6', size: 'w-80 h-80', position: 'bottom-0 left-1/4', opacity: 0.08 },
          { color: '#d4af37', size: 'w-48 h-48', position: 'bottom-1/3 right-1/3', opacity: 0.05 },
        ];
        base.showStars = true;
      } else {
        base.blobs = [
          { color: '#3b82f6', size: 'w-96 h-96', position: '-top-48 -left-48', opacity: 0.15 },
          { color: '#d4af37', size: 'w-72 h-72', position: 'top-1/3 right-0', opacity: 0.12 },
          { color: '#8b5cf6', size: 'w-80 h-80', position: 'bottom-0 left-1/4', opacity: 0.12 },
          { color: '#d4af37', size: 'w-64 h-64', position: 'bottom-1/4 right-1/4', opacity: 0.1 },
        ];
      }
      break;

    case 'few_clouds':
    case 'scattered':
      base.blobs = [
        { color: '#3b82f6', size: 'w-96 h-96', position: '-top-48 -left-48', opacity: 0.12 },
        { color: '#d4af37', size: 'w-72 h-72', position: 'top-1/3 right-0', opacity: 0.08 },
        { color: '#8b5cf6', size: 'w-80 h-80', position: 'bottom-0 left-1/4', opacity: 0.1 },
        { color: '#64748b', size: 'w-64 h-64', position: 'bottom-1/4 right-1/4', opacity: 0.08 },
      ];
      base.showClouds = true;
      if (isNight) base.showStars = true;
      break;

    case 'broken':
    case 'overcast':
      base.blobs = [
        { color: '#64748b', size: 'w-96 h-96', position: '-top-48 -left-48', opacity: 0.2 },
        { color: '#94a3b8', size: 'w-80 h-80', position: 'top-1/4 right-0', opacity: 0.15 },
        { color: '#475569', size: 'w-72 h-72', position: 'bottom-0 left-1/4', opacity: 0.18 },
        { color: '#3b82f6', size: 'w-48 h-48', position: 'bottom-1/3 right-1/3', opacity: 0.05 },
      ];
      base.showClouds = true;
      break;

    case 'rain':
      base.blobs = [
        { color: '#334155', size: 'w-96 h-96', position: '-top-48 -left-48', opacity: 0.25 },
        { color: '#475569', size: 'w-80 h-80', position: 'top-1/4 right-0', opacity: 0.2 },
        { color: '#1e293b', size: 'w-72 h-72', position: 'bottom-0 left-1/4', opacity: 0.2 },
        { color: '#64748b', size: 'w-64 h-64', position: 'bottom-1/4 right-1/4', opacity: 0.15 },
      ];
      base.showRain = true;
      break;

    case 'snow':
      base.blobs = [
        { color: '#e2e8f0', size: 'w-96 h-96', position: '-top-48 -left-48', opacity: 0.1 },
        { color: '#bfdbfe', size: 'w-80 h-80', position: 'top-1/4 right-0', opacity: 0.08 },
        { color: '#cbd5e1', size: 'w-72 h-72', position: 'bottom-0 left-1/4', opacity: 0.1 },
        { color: '#dbeafe', size: 'w-64 h-64', position: 'bottom-1/4 right-1/4', opacity: 0.06 },
      ];
      base.showSnow = true;
      break;

    case 'fog':
    case 'mist':
      base.blobs = [
        { color: '#94a3b8', size: 'w-[32rem] h-[32rem]', position: '-top-32 -left-32', opacity: 0.15 },
        { color: '#cbd5e1', size: 'w-[28rem] h-[28rem]', position: 'top-1/4 right-0', opacity: 0.12 },
        { color: '#64748b', size: 'w-96 h-96', position: 'bottom-0 left-1/4', opacity: 0.15 },
      ];
      base.showFog = true;
      break;

    case 'thunderstorm':
      base.blobs = [
        { color: '#1e293b', size: 'w-96 h-96', position: '-top-48 -left-48', opacity: 0.3 },
        { color: '#334155', size: 'w-80 h-80', position: 'top-1/4 right-0', opacity: 0.25 },
        { color: '#0f172a', size: 'w-72 h-72', position: 'bottom-0 left-1/4', opacity: 0.3 },
        { color: '#475569', size: 'w-64 h-64', position: 'bottom-1/4 right-1/4', opacity: 0.2 },
      ];
      base.showRain = true;
      base.showLightning = true;
      base.animSpeedMultiplier = windMult * 1.3;
      break;

    default:
      // Fallback = clear day
      base.blobs = [
        { color: '#3b82f6', size: 'w-96 h-96', position: '-top-48 -left-48', opacity: 0.15 },
        { color: '#d4af37', size: 'w-72 h-72', position: 'top-1/3 right-0', opacity: 0.12 },
        { color: '#8b5cf6', size: 'w-80 h-80', position: 'bottom-0 left-1/4', opacity: 0.12 },
        { color: '#3b82f6', size: 'w-64 h-64', position: 'bottom-1/4 right-1/4', opacity: 0.1 },
      ];
  }

  return base;
}

function Stars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 2,
        delay: Math.random() * 4,
        duration: 2 + Math.random() * 3,
      })),
    []
  );

  return (
    <>
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full star-twinkle"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            background: 'rgba(255, 255, 255, 0.7)',
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </>
  );
}

function CloudBlobs() {
  const clouds = useMemo(
    () => [
      { left: '10%', top: '15%', width: 260, height: 80, delay: 0, duration: 35, opacity: 0.06 },
      { left: '55%', top: '40%', width: 200, height: 60, delay: 5, duration: 40, opacity: 0.05 },
      { left: '30%', top: '65%', width: 180, height: 55, delay: 12, duration: 45, opacity: 0.04 },
    ],
    []
  );

  return (
    <>
      {clouds.map((c, i) => (
        <div
          key={i}
          className="absolute cloud-drift"
          style={{
            left: c.left,
            top: c.top,
            width: `${c.width}px`,
            height: `${c.height}px`,
            borderRadius: '50%',
            background: 'rgba(148, 163, 184, 0.4)',
            filter: 'blur(30px)',
            opacity: c.opacity,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
          }}
        />
      ))}
    </>
  );
}

function LightningFlash() {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const scheduleFlash = () => {
      const delay = 5000 + Math.random() * 8000;
      const timeout = setTimeout(() => {
        setFlash(true);
        setTimeout(() => setFlash(false), 120);
        // Sometimes double-flash
        if (Math.random() > 0.5) {
          setTimeout(() => {
            setFlash(true);
            setTimeout(() => setFlash(false), 80);
          }, 200);
        }
        scheduleFlash();
      }, delay);
      return timeout;
    };

    const timeout = scheduleFlash();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none transition-opacity"
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        opacity: flash ? 1 : 0,
        transitionDuration: flash ? '50ms' : '300ms',
      }}
    />
  );
}

function FogOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse at 30% 40%, rgba(148, 163, 184, 0.12) 0%, transparent 60%), ' +
          'radial-gradient(ellipse at 70% 60%, rgba(203, 213, 225, 0.1) 0%, transparent 50%)',
        backdropFilter: 'blur(2px)',
      }}
    />
  );
}

export default function WeatherBackground() {
  const { weather } = useWeather();

  const condition = weather?.condition || 'clear';
  const isNight = weather?.is_night || false;
  const windKt = weather?.wind_speed_kt || 0;

  const theme = useMemo(
    () => getTheme(condition, isNight, windKt),
    [condition, isNight, windKt]
  );

  const baseDuration = 6; // base seconds for float animation
  const animDuration = baseDuration / theme.animSpeedMultiplier;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 weather-bg-transition">
      {/* Blobs */}
      {theme.blobs.map((blob, i) => (
        <div
          key={`${condition}-${i}`}
          className={`absolute rounded-full ${blob.size} ${blob.position}`}
          style={{
            background: blob.color,
            opacity: blob.opacity,
            filter: 'blur(80px)',
            animation: `weatherFloat ${animDuration + i * 0.8}s ease-in-out ${i * 0.5}s infinite`,
          }}
        />
      ))}

      {/* Stars (clear night) */}
      {theme.showStars && <Stars />}

      {/* Cloud shapes */}
      {theme.showClouds && <CloudBlobs />}

      {/* Rain particles */}
      {theme.showRain && <RainEffect intensity={condition === 'thunderstorm' ? 0.9 : 0.6} />}

      {/* Snow particles */}
      {theme.showSnow && <SnowEffect intensity={0.6} />}

      {/* Lightning */}
      {theme.showLightning && <LightningFlash />}

      {/* Fog overlay */}
      {theme.showFog && <FogOverlay />}

      {/* Daytime golden glow (clear day only) */}
      {condition === 'clear' && !isNight && (
        <div
          className="absolute -top-32 right-0 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
          }}
        />
      )}
    </div>
  );
}
