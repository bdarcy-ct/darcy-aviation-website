import { ReactNode } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function SectionWrapper({ children, className = '', id }: SectionWrapperProps) {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <section
      id={id}
      ref={ref}
      className={`py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ${className} ${
        isVisible ? 'animate-fade-in' : 'opacity-0'
      }`}
    >
      {children}
    </section>
  );
}
