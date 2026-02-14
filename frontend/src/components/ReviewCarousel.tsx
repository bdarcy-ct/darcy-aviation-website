import React, { useState, useEffect } from 'react';

interface Review {
  id: number;
  name: string;
  rating: number;
  text: string;
  date: string;
  source?: string; // 'google' or other
}

interface ReviewCarouselProps {
  reviews: Review[];
  autoScroll?: boolean;
  interval?: number;
}

const ReviewCarousel: React.FC<ReviewCarouselProps> = ({ 
  reviews, 
  autoScroll = true, 
  interval = 6000 
}) => {
  const [currentReview, setCurrentReview] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToReview = (index: number) => {
    if (index === currentReview) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentReview(index);
      setIsTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    if (!autoScroll || isPaused || reviews.length === 0) return;
    
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentReview((prev) => (prev + 1) % reviews.length);
        setIsTransitioning(false);
      }, 300);
    }, interval);
    
    return () => clearInterval(timer);
  }, [autoScroll, isPaused, reviews.length, interval]);

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No reviews available</p>
      </div>
    );
  }

  const currentData = reviews[currentReview];

  return (
    <div 
      className="glass-card p-8 md:p-12 text-center relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Quote mark */}
      <div className="absolute top-4 left-8 text-6xl text-aviation-blue/20 font-serif select-none">"</div>
      
      <div className={`relative z-10 transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
        {/* Stars */}
        <div className="flex justify-center mb-4 gap-0.5" aria-label={`${currentData.rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className={`w-5 h-5 ${i < currentData.rating ? 'text-gold' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        
        {/* Review text */}
        <p className="text-white text-lg md:text-xl leading-relaxed mb-6 italic max-w-3xl mx-auto">
          "{currentData.text}"
        </p>
        
        {/* Author and source */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <p className="text-gold font-semibold">{currentData.name}</p>
          {currentData.source === 'google' && (
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
              <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-slate-300 text-xs font-medium">Google</span>
            </div>
          )}
        </div>
        
        {/* Date */}
        {currentData.date && (
          <p className="text-slate-500 text-xs">
            {new Date(currentData.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long' 
            })}
          </p>
        )}
      </div>
      
      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-6" role="tablist" aria-label="Review navigation">
        {reviews.map((_, i) => (
          <button
            key={i}
            onClick={() => goToReview(i)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            role="tab"
            aria-selected={i === currentReview}
            aria-label={`Review ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentReview 
                ? 'bg-gold w-6' 
                : 'bg-white/30 hover:bg-white/50 w-2'
            }`}
          />
        ))}
      </div>
      
      {/* Pause indicator */}
      {isPaused && autoScroll && (
        <div className="absolute top-4 right-4 text-slate-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ReviewCarousel;