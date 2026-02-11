import { useMemo } from 'react';

interface SnowEffectProps {
  intensity?: number; // 0-1
}

export default function SnowEffect({ intensity = 0.5 }: SnowEffectProps) {
  const flakes = useMemo(() => {
    const count = Math.floor(25 + intensity * 40);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 5 + Math.random() * 7,
      size: 2 + Math.random() * 3,
      opacity: 0.2 + Math.random() * 0.4,
      sway: -15 + Math.random() * 30,
    }));
  }, [intensity]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full snow-flake"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            background: 'rgba(255, 255, 255, 0.8)',
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            ['--sway' as string]: `${flake.sway}px`,
          }}
        />
      ))}
    </div>
  );
}
