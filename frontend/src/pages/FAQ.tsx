import { useState } from 'react';
import { Link } from 'react-router-dom';
import SectionWrapper from '../components/SectionWrapper';

const faqs = [
  {
    category: 'Flight Training',
    questions: [
      {
        q: 'How long does it take to get a Private Pilot License?',
        a: 'Most students complete their PPL in 3-6 months, depending on how frequently they fly. The FAA requires a minimum of 40 flight hours, but the national average is around 60-70 hours. Flying 2-3 times per week is recommended for the best learning curve.',
      },
      {
        q: 'Do I need any experience to start flying?',
        a: 'No prior experience is needed! Everyone starts from zero. You must be at least 16 years old to fly solo and 17 to earn your private pilot certificate. You will also need an FAA medical certificate, which we can help you obtain.',
      },
      {
        q: 'What is a Discovery Flight?',
        a: 'A discovery flight is a 30-minute introductory flight where you actually take the controls of the aircraft under the guidance of a certified flight instructor. It is the perfect way to experience flying before committing to a full training program. Discovery flights are $249 and make great gifts!',
      },
      {
        q: 'How often should I fly during training?',
        a: 'We recommend flying at least 2-3 times per week for optimal progress and knowledge retention. Flying less frequently can extend your training timeline and overall cost. We are open 7 days a week to accommodate your schedule.',
      },
      {
        q: 'What ratings and certificates do you offer?',
        a: 'We offer Private Pilot License (PPL), Instrument Rating (IR), Commercial Pilot License (CPL), and Multi-Engine Rating. We also have a full-motion simulator for instrument training and procedure practice.',
      },
      {
        q: 'What aircraft will I train in?',
        a: 'Our fleet includes Cessna 172 Skyhawks and Piper PA-28 Warriors for primary training, a multi-engine trainer for your multi-engine rating, and a full-motion simulator. All our aircraft are meticulously maintained.',
      },
    ],
  },
  {
    category: 'Costs & Scheduling',
    questions: [
      {
        q: 'How much does flight training cost?',
        a: 'The total cost varies based on the certificate or rating you are pursuing and your individual learning pace. A Private Pilot License typically costs between $12,000-$18,000 total. Contact us for a detailed breakdown and personalized estimate based on your goals.',
      },
      {
        q: 'Do you offer financing or payment plans?',
        a: 'We can discuss payment options that work for your budget. Reach out to us and we will find a solution that makes your aviation dreams achievable.',
      },
      {
        q: 'What are your hours of operation?',
        a: 'We are open 7 days a week, from 9:00 AM to 5:00 PM. We can sometimes accommodate early morning or evening flights by arrangement.',
      },
      {
        q: 'Do you offer gift cards?',
        a: 'Yes! Gift cards are available for discovery flights and can be purchased online through our Flight Circle page. They make unforgettable gifts for aviation enthusiasts, birthdays, holidays, and special occasions.',
      },
    ],
  },
  {
    category: 'Aircraft Maintenance',
    questions: [
      {
        q: 'What maintenance services do you offer?',
        a: 'We offer annual inspections, 100-hour inspections, oil changes, engine overhauls, avionics installation and repair, and pre-buy inspections. Our FAA-certified A&P/IA mechanics handle everything from routine maintenance to major repairs.',
      },
      {
        q: 'What types of aircraft do you service?',
        a: 'We specialize in Cessna and Piper aircraft maintenance. Whether you fly a Cessna 172, Piper Warrior, or similar single and light twin-engine aircraft, our experienced mechanics can keep it in top condition.',
      },
      {
        q: 'How do I schedule a maintenance appointment?',
        a: 'Simply call us at (203) 617-0645 or send us a message through our contact page. We will work with you to find a convenient time and discuss the scope of work needed.',
      },
    ],
  },
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="pt-24">
      <SectionWrapper>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-aviation-blue to-gold bg-clip-text text-transparent">Questions</span>
          </h1>
          <p className="section-subtitle">
            Everything you need to know about flight training, costs, scheduling, and maintenance.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-10">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-xl font-bold text-gold mb-4 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-gradient-to-r from-gold to-transparent" />
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.questions.map((faq, i) => {
                  const key = `${section.category}-${i}`;
                  const isOpen = openItems.has(key);
                  return (
                    <div key={key} className="glass-card overflow-hidden">
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full flex items-center justify-between p-5 text-left group"
                      >
                        <span className="text-white font-medium pr-4 group-hover:text-gold transition-colors">{faq.q}</span>
                        <svg
                          className={`w-5 h-5 text-gold flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
                        <p className="px-5 text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper>
        <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-aviation-blue/10 to-gold/10" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">Still Have Questions?</h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              We're here to help! Reach out and we'll get back to you as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact" className="btn-gold">Contact Us</Link>
              <a href="tel:+12036170645" className="btn-blue inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                (203) 617-0645
              </a>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
