import { useRef, useState, useCallback } from 'react';

const HERO_VIDEOS = ['/videos/hero-1.mp4', '/videos/hero-2.mp4', '/videos/hero-3.mp4'];

export default function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleEnded = useCallback(() => {
    const next = (currentIndex + 1) % HERO_VIDEOS.length;
    setCurrentIndex(next);
    if (videoRef.current) {
      videoRef.current.src = HERO_VIDEOS[next];
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        ref={videoRef}
        src={HERO_VIDEOS[0]}
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/70 via-navy-900/50 to-navy-900/90" />
    </div>
  );
}
