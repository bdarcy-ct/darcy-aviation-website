import { useMemo } from 'react';

interface RainEffectProps {
  intensity?: number; // 0-1
}

export default function RainEffect({ intensity = 0.6 }: RainEffectProps) {
  const drops = useMemo(() => {
    const count = Math.floor(40 + intensity * 60);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 0.6 + Math.random() * 0.4,
      opacity: 0.15 + Math.random() * 0.25,
      height: 12 + Math.random() * 18,
    }));
  }, [intensity]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute w-px rain-drop"
          style={{
            left: `${drop.left}%`,
            height: `${drop.height}px`,
            opacity: drop.opacity,
            background: 'linear-gradient(180deg, transparent, rgba(148, 163, 184, 0.6))',
            animationDelay: `${drop.delay}s`,
            animationDuration: `${drop.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
