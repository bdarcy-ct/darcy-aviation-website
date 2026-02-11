import { useState } from 'react';
import GlassCard from '../components/GlassCard';
import SectionWrapper from '../components/SectionWrapper';

const PlaneIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const ChatIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CelebrationIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

const SendIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const PhoneIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const EnvelopeIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.917V6.75" />
  </svg>
);

const MapPinIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const GiftIcon = ({ className = "w-4 h-4 inline" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

export default function Book() {
  // Booking form state
  const [booking, setBooking] = useState({
    name: '', email: '', phone: '', preferred_date: '', preferred_time: '',
    passengers: 1, is_gift_card: false, message: '',
  });
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [bookingMessage, setBookingMessage] = useState('');

  // Contact form state
  const [contact, setContact] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  });
  const [contactStatus, setContactStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [contactMessage, setContactMessage] = useState('');

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingStatus('loading');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });
      const data = await res.json();
      if (res.ok) {
        setBookingStatus('success');
        setBookingMessage(data.message);
        setBooking({ name: '', email: '', phone: '', preferred_date: '', preferred_time: '', passengers: 1, is_gift_card: false, message: '' });
      } else {
        setBookingStatus('error');
        setBookingMessage(data.error || 'Something went wrong');
      }
    } catch {
      setBookingStatus('error');
      setBookingMessage('Failed to submit. Please try again.');
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });
      const data = await res.json();
      if (res.ok) {
        setContactStatus('success');
        setContactMessage(data.message);
        setContact({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setContactStatus('error');
        setContactMessage(data.error || 'Something went wrong');
      }
    } catch {
      setContactStatus('error');
      setContactMessage('Failed to submit. Please try again.');
    }
  };

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-aviation-blue/50 focus:bg-white/10 transition-all';

  return (
    <div className="pt-24">
      <SectionWrapper>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Book Your{' '}
            <span className="bg-gradient-to-r from-aviation-blue to-gold bg-clip-text text-transparent">Flight</span>
          </h1>
          <p className="section-subtitle">
            Ready to take the controls? Book a discovery flight or get in touch with our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Discovery Flight Booking */}
          <GlassCard hover={false} className="!p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-aviation-blue">
                <PlaneIcon />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Discovery Flight</h2>
                <p className="text-gold font-semibold">$249 per flight</p>
              </div>
            </div>

            {bookingStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="text-gold mb-4 flex justify-center">
                  <CelebrationIcon />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Booking Submitted!</h3>
                <p className="text-slate-300">{bookingMessage}</p>
                <button
                  onClick={() => setBookingStatus('idle')}
                  className="btn-blue mt-6"
                >
                  Book Another Flight
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text" placeholder="Full Name *" required
                    className={inputClass}
                    value={booking.name}
                    onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                  />
                  <input
                    type="email" placeholder="Email Address *" required
                    className={inputClass}
                    value={booking.email}
                    onChange={(e) => setBooking({ ...booking, email: e.target.value })}
                  />
                </div>
                <input
                  type="tel" placeholder="Phone Number"
                  className={inputClass}
                  value={booking.phone}
                  onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="date"
                    className={inputClass}
                    value={booking.preferred_date}
                    onChange={(e) => setBooking({ ...booking, preferred_date: e.target.value })}
                  />
                  <select
                    className={inputClass}
                    value={booking.preferred_time}
                    onChange={(e) => setBooking({ ...booking, preferred_time: e.target.value })}
                  >
                    <option value="">Preferred Time</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select
                    className={inputClass}
                    value={booking.passengers}
                    onChange={(e) => setBooking({ ...booking, passengers: Number(e.target.value) })}
                  >
                    <option value={1}>1 Passenger</option>
                    <option value={2}>2 Passengers</option>
                    <option value={3}>3 Passengers</option>
                  </select>
                  <label className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                    <input
                      type="checkbox"
                      checked={booking.is_gift_card}
                      onChange={(e) => setBooking({ ...booking, is_gift_card: e.target.checked })}
                      className="w-5 h-5 rounded accent-gold"
                    />
                    <span className="text-slate-300 text-sm inline-flex items-center gap-1.5">
                      This is a gift <GiftIcon />
                    </span>
                  </label>
                </div>
                <textarea
                  placeholder="Additional message or questions..."
                  rows={3}
                  className={inputClass + ' resize-none'}
                  value={booking.message}
                  onChange={(e) => setBooking({ ...booking, message: e.target.value })}
                />
                {bookingStatus === 'error' && (
                  <p className="text-red-400 text-sm">{bookingMessage}</p>
                )}
                <button
                  type="submit"
                  disabled={bookingStatus === 'loading'}
                  className="btn-gold w-full !py-4 text-lg disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-2">
                    {bookingStatus === 'loading' ? 'Submitting...' : (
                      <>
                        <PlaneIcon className="w-5 h-5" />
                        Book Discovery Flight
                      </>
                    )}
                  </span>
                </button>
                <p className="text-slate-500 text-xs text-center">
                  Or purchase a{' '}
                  <a
                    href="https://www.flightcircle.com/shop/97822f668fb9/4000001831"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:underline"
                  >
                    gift card online
                  </a>
                </p>
              </form>
            )}
          </GlassCard>

          {/* Contact Form */}
          <GlassCard hover={false} className="!p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-aviation-blue">
                <ChatIcon />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Contact Us</h2>
                <p className="text-slate-400 text-sm">Have questions? We'd love to hear from you.</p>
              </div>
            </div>

            {contactStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="text-green-400 mb-4 flex justify-center">
                  <CheckCircleIcon />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                <p className="text-slate-300">{contactMessage}</p>
                <button
                  onClick={() => setContactStatus('idle')}
                  className="btn-blue mt-6"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text" placeholder="Full Name *" required
                    className={inputClass}
                    value={contact.name}
                    onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  />
                  <input
                    type="email" placeholder="Email Address *" required
                    className={inputClass}
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  />
                </div>
                <input
                  type="tel" placeholder="Phone Number"
                  className={inputClass}
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                />
                <select
                  className={inputClass}
                  value={contact.subject}
                  onChange={(e) => setContact({ ...contact, subject: e.target.value })}
                >
                  <option value="">Select Subject</option>
                  <option value="Flight Training">Flight Training</option>
                  <option value="Discovery Flight">Discovery Flight</option>
                  <option value="Aircraft Maintenance">Aircraft Maintenance</option>
                  <option value="Aircraft Rental">Aircraft Rental</option>
                  <option value="Gift Cards">Gift Cards</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
                <textarea
                  placeholder="Your message *" required
                  rows={5}
                  className={inputClass + ' resize-none'}
                  value={contact.message}
                  onChange={(e) => setContact({ ...contact, message: e.target.value })}
                />
                {contactStatus === 'error' && (
                  <p className="text-red-400 text-sm">{contactMessage}</p>
                )}
                <button
                  type="submit"
                  disabled={contactStatus === 'loading'}
                  className="btn-blue w-full !py-4 text-lg disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-2">
                    {contactStatus === 'loading' ? 'Sending...' : (
                      <>
                        <SendIcon />
                        Send Message
                      </>
                    )}
                  </span>
                </button>
              </form>
            )}
          </GlassCard>
        </div>
      </SectionWrapper>

      {/* Info Cards */}
      <SectionWrapper>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard delay={0}>
            <div className="text-center">
              <div className="text-aviation-blue mb-3 flex justify-center">
                <PhoneIcon />
              </div>
              <h3 className="text-white font-semibold mb-1">Call Us</h3>
              <a href="tel:+12036170645" className="text-gold hover:underline">(203) 617-0645</a>
            </div>
          </GlassCard>
          <GlassCard delay={100}>
            <div className="text-center">
              <div className="text-aviation-blue mb-3 flex justify-center">
                <EnvelopeIcon />
              </div>
              <h3 className="text-white font-semibold mb-1">Email Us</h3>
              <a href="mailto:admin@darcyaviation.com" className="text-gold hover:underline">admin@darcyaviation.com</a>
            </div>
          </GlassCard>
          <GlassCard delay={200}>
            <div className="text-center">
              <div className="text-aviation-blue mb-3 flex justify-center">
                <MapPinIcon />
              </div>
              <h3 className="text-white font-semibold mb-1">Visit Us</h3>
              <p className="text-slate-400 text-sm">1 Wallingford Rd, Danbury, CT 06810</p>
            </div>
          </GlassCard>
        </div>
      </SectionWrapper>
    </div>
  );
}
