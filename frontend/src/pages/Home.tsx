import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import SectionWrapper from '../components/SectionWrapper';

interface Testimonial {
  id: number;
  name: string;
  rating: number;
  text: string;
  date: string;
  featured: number;
}

export default function Home() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    fetch('/api/testimonials')
      .then((res) => res.json())
      .then(setTestimonials)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials]);

  const services = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
      ),
      title: 'Flight Training',
      desc: 'From Private Pilot to Commercial — structured programs with experienced CFIs.',
      link: '/training',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      ),
      title: 'Aircraft Maintenance',
      desc: 'FAA-certified A&P mechanics. Annuals, inspections, and avionics.',
      link: '/maintenance',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ),
      title: 'Discovery Flights',
      desc: '$249 — Take the controls and experience the thrill of flying firsthand.',
      link: '/book',
    },
  ];

  const whyDarcy = [
    {
      icon: '👨‍✈️',
      title: 'Experienced Instructors',
      desc: 'Professional CFIs dedicated to your success with personalized attention.',
    },
    {
      icon: '✈️',
      title: 'Premium Fleet',
      desc: 'Well-maintained Cessna and Piper aircraft plus full-motion simulator.',
    },
    {
      icon: '📋',
      title: 'Customized Training',
      desc: 'Flexible programs tailored to your goals, schedule, and learning style.',
    },
    {
      icon: '📅',
      title: '7-Day Availability',
      desc: 'Open every day of the week. Train on your schedule, not ours.',
    },
  ];

  const stats = [
    { value: '600+', label: 'Students Trained' },
    { value: '7', label: 'Days a Week' },
    { value: '4.9★', label: 'Google Rating' },
    { value: '2019', label: 'Established' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/80 via-navy-900/60 to-navy-900" />
        
        {/* Animated gradient background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-aviation-blue rounded-full filter blur-[128px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold rounded-full filter blur-[128px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-slate-300 text-sm">Now accepting students at KDXR</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Take Flight at{' '}
            <span className="bg-gradient-to-r from-aviation-blue to-gold bg-clip-text text-transparent">
              Darcy Aviation
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Your premier flight training destination in Connecticut. Professional instruction, 
            premium fleet, and a passion for aviation at Danbury Municipal Airport.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/book" className="btn-gold text-lg">
              ✈️ Book a Discovery Flight
            </Link>
            <Link to="/training" className="btn-blue text-lg">
              Explore Programs →
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="relative z-10 -mt-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="glass-card p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-aviation-blue to-gold bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services */}
      <SectionWrapper>
        <div className="text-center mb-12">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">Everything you need to take to the skies</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <Link key={i} to={service.link}>
              <GlassCard delay={i * 100}>
                <div className="text-aviation-blue mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{service.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{service.desc}</p>
                <span className="inline-flex items-center gap-1 text-gold text-sm mt-4 font-medium">
                  Learn More
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
              </GlassCard>
            </Link>
          ))}
        </div>
      </SectionWrapper>

      {/* Why Darcy */}
      <SectionWrapper>
        <div className="text-center mb-12">
          <h2 className="section-title">Why Choose Darcy Aviation</h2>
          <p className="section-subtitle">What sets us apart from the rest</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyDarcy.map((item, i) => (
            <GlassCard key={i} delay={i * 100}>
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </SectionWrapper>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <SectionWrapper>
          <div className="text-center mb-12">
            <h2 className="section-title">What Our Students Say</h2>
            <p className="section-subtitle">Real reviews from real pilots</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute top-4 left-8 text-6xl text-aviation-blue/20 font-serif">"</div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white text-lg md:text-xl leading-relaxed mb-6 italic">
                  "{testimonials[currentTestimonial].text}"
                </p>
                <p className="text-gold font-semibold">{testimonials[currentTestimonial].name}</p>
              </div>
              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === currentTestimonial ? 'bg-gold w-6' : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </SectionWrapper>
      )}

      {/* CTA Banner */}
      <SectionWrapper>
        <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-aviation-blue/10 to-gold/10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Aviation Journey?
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
              Whether you're dreaming of your private pilot license or looking for a unique gift, we're here to help you take flight.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/book" className="btn-gold text-lg">
                Book a Discovery Flight — $249
              </Link>
              <a
                href="https://www.flightcircle.com/shop/97822f668fb9/4000001831"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-blue text-lg"
              >
                🎁 Gift Cards
              </a>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
