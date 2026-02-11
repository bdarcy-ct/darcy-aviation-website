import { useState } from 'react';
import GlassCard from '../components/GlassCard';
import SectionWrapper from '../components/SectionWrapper';

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
              <span className="text-3xl">✈️</span>
              <div>
                <h2 className="text-2xl font-bold text-white">Discovery Flight</h2>
                <p className="text-gold font-semibold">$249 per flight</p>
              </div>
            </div>

            {bookingStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🎉</div>
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
                    <span className="text-slate-300 text-sm">This is a gift 🎁</span>
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
                  {bookingStatus === 'loading' ? 'Submitting...' : '✈️ Book Discovery Flight'}
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
              <span className="text-3xl">💬</span>
              <div>
                <h2 className="text-2xl font-bold text-white">Contact Us</h2>
                <p className="text-slate-400 text-sm">Have questions? We'd love to hear from you.</p>
              </div>
            </div>

            {contactStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
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
                  {contactStatus === 'loading' ? 'Sending...' : '📨 Send Message'}
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
              <div className="text-3xl mb-3">📞</div>
              <h3 className="text-white font-semibold mb-1">Call Us</h3>
              <a href="tel:+12036170645" className="text-gold hover:underline">(203) 617-0645</a>
            </div>
          </GlassCard>
          <GlassCard delay={100}>
            <div className="text-center">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="text-white font-semibold mb-1">Email Us</h3>
              <a href="mailto:admin@darcyaviation.com" className="text-gold hover:underline">admin@darcyaviation.com</a>
            </div>
          </GlassCard>
          <GlassCard delay={200}>
            <div className="text-center">
              <div className="text-3xl mb-3">📍</div>
              <h3 className="text-white font-semibold mb-1">Visit Us</h3>
              <p className="text-slate-400 text-sm">1 Wallingford Rd, Danbury, CT 06810</p>
            </div>
          </GlassCard>
        </div>
      </SectionWrapper>
    </div>
  );
}
