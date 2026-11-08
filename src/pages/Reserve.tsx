import React, { useState } from 'react';
import { Calendar, CalendarDays, Users, Utensils, Clock, Phone, User, CheckCircle2, MessageSquare, SearchCheck, TicketCheck, LoaderCircle } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { GoldFlickers } from '../components/GoldFlickers';
import { Reservation } from '../types';
import { Footer } from '../components/Footer';
import { apiUrl } from '../services/api';
import { BookingStatusResult, checkBookingStatus } from '../services/reservationApi';

type ReservationTab = 'reserve' | 'check';

const today = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

interface ReserveProps {
  onReservationSubmitted: (newRes: Reservation) => void;
  onOpenAdmin: () => void;
  onOpenChat: () => void;
  onNavigate?: (page: 'home' | 'menu' | 'reserve' | 'contact') => void;
}

export const Reserve: React.FC<ReserveProps> = ({
  onReservationSubmitted,
  onOpenAdmin,
  onOpenChat,
  onNavigate,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<ReservationTab>('reserve');
  const [formData, setFormData] = useState({
    customerName: '',
    contactPhone: '',
    reservationDate: today(),
    reservationTime: '19:00',
    guestCount: 4,
    specialRequests: '',
  });

  const [loading, setLoading] = useState(false);
  const [successReservation, setSuccessReservation] = useState<Reservation | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [lookupReference, setLookupReference] = useState('');
  const [lookupContact, setLookupContact] = useState('');
  const [lookupResult, setLookupResult] = useState<BookingStatusResult | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setLookupResult(null);
    setLookupLoading(true);
    try {
      const result = await checkBookingStatus(lookupReference.trim(), lookupContact.trim());
      setLookupResult(result);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Unable to check this reservation.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.customerName.trim() || formData.customerName.trim().length < 2) {
      setErrorMsg('Please enter your full name (minimum 2 characters).');
      return;
    }

    if (!formData.contactPhone.trim() || formData.contactPhone.trim().length < 7) {
      setErrorMsg('Please enter a valid contact number (e.g. 07X XXX XXXX).');
      return;
    }

    if (!formData.reservationDate || formData.reservationDate < today()) {
      setErrorMsg('Please choose today or a future reservation date.');
      return;
    }

    if (!Number.isInteger(Number(formData.guestCount)) || formData.guestCount < 1 || formData.guestCount > 30) {
      setErrorMsg('Please choose a party size between 1 and 30 guests.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/reservations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName.trim(),
          contactPhone: formData.contactPhone.trim(),
          contactEmail: '',
          reservationDate: formData.reservationDate,
          reservationTime: formData.reservationTime,
          guestCount: Number(formData.guestCount) || 2,
          specialRequests: formData.specialRequests.trim() || 'Direct Online Booking',
          source: 'Website Direct',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit reservation.');
      }

      const created: Reservation = await res.json();
      setSuccessReservation(created);
      onReservationSubmitted(created);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessReservation(null);
    setFormData({
      customerName: '',
      contactPhone: '',
      reservationDate: today(),
      reservationTime: '19:00',
      guestCount: 4,
      specialRequests: '',
    });
  };

  const openBookingLookup = () => {
    setLookupReference(successReservation?.bookingReference || '');
    setLookupContact(successReservation?.contactPhone || '');
    setLookupResult(null);
    setLookupError('');
    setActiveTab('check');
  };

  const statusStyles: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-900 border-amber-300',
    Confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Rejected: 'bg-rose-100 text-rose-800 border-rose-300',
    Cancelled: 'bg-rose-100 text-rose-800 border-rose-300',
    Seated: 'bg-sky-100 text-sky-800 border-sky-300',
  };

  const statusMessages: Record<string, string> = {
    Pending: 'Your reservation request is awaiting confirmation from our restaurant team.',
    Confirmed: 'Your reservation has been confirmed. We look forward to welcoming you!',
    Rejected: 'Unfortunately, your reservation request was not approved. Please contact us for assistance.',
    Cancelled: 'This reservation has been cancelled. Please contact us if you need assistance.',
    Seated: 'Your table is marked as seated. We hope you are enjoying your visit!',
  };

  const formatReservationDate = (date: string) =>
    new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D0D] text-stone-100">
      {/* Hero & Reservation Form Section */}
      <section className="relative w-full overflow-hidden pt-8 pb-16 lg:pb-24">
        {/* Background Photo with Candlelit Dining Table */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/src/assets/images/reserve_table_ambiance_1793980663419.jpg"
            alt="MiniKitchen romantic candlelit dining table ambiance"
            className="w-full h-full object-cover object-right lg:object-center opacity-70"
          />
          {/* Left-to-right dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-[#0D0D0D]/90 sm:via-[#0D0D0D]/75 md:via-[#0D0D0D]/60 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0D0D0D] to-transparent pointer-events-none" />
        </div>
        <GoldFlickers />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 items-start">
            {/* Left Column: Heading + Description + 3 Feature Items */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="font-serif text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-white leading-[1.1] mb-3"
                >
                  Reserve a <span className="text-[#F5B82E]">Table</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                  className="text-stone-300 text-sm sm:text-base max-w-[430px] leading-relaxed font-sans font-light"
                >
                  Plan your dining experience at MiniKitchen. Book your table in advance and enjoy a great meal with us.
                </motion.p>
              </div>

              {/* 3 Left Feature Items with Gold Circular Icons */}
              <div className="space-y-4 max-w-md pt-2">
                {/* 1. Easy Reservation */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#171717]/85 backdrop-blur-md border border-[#D4A43C]/20"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-[#D4A43C] flex items-center justify-center shrink-0 text-[#D4A43C]">
                    <Calendar className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Easy Reservation</h4>
                    <p className="text-xs text-stone-300">Book your table in just a few steps.</p>
                  </div>
                </motion.div>

                {/* 2. For Any Occasion */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#171717]/85 backdrop-blur-md border border-[#D4A43C]/20"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-[#D4A43C] flex items-center justify-center shrink-0 text-[#D4A43C]">
                    <Users className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">For Any Occasion</h4>
                    <p className="text-xs text-stone-300">Family dinners, meetups or special events.</p>
                  </div>
                </motion.div>

                {/* 3. Great Dining */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#171717]/85 backdrop-blur-md border border-[#D4A43C]/20"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-[#D4A43C] flex items-center justify-center shrink-0 text-[#D4A43C]">
                    <Utensils className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Great Dining</h4>
                    <p className="text-xs text-stone-300">Delicious food and a cozy atmosphere awaits you.</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right Column: Floating Cream-Colored Table Reservation Card */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                className="w-full max-w-[540px] bg-[#FFF8EB] rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border border-[#F5E8D8] text-stone-900"
              >
                <div
                  role="tablist"
                  aria-label="Reservation options"
                  className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F7EBD9] p-1.5 mb-6"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'reserve'}
                    onClick={() => setActiveTab('reserve')}
                    className={`min-h-12 rounded-xl px-2 sm:px-4 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A43C] ${
                      activeTab === 'reserve'
                        ? 'bg-gradient-to-r from-[#F5B82E] to-[#D4A43C] text-[#0D0D0D] shadow-md'
                        : 'border border-transparent text-stone-800 hover:border-[#D4A43C] hover:bg-white/60'
                    }`}
                  >
                    <CalendarDays className="w-4 h-4 shrink-0" />
                    <span>Reserve a Table</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'check'}
                    onClick={() => {
                      setActiveTab('check');
                      setLookupError('');
                    }}
                    className={`min-h-12 rounded-xl px-2 sm:px-4 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A43C] ${
                      activeTab === 'check'
                        ? 'bg-gradient-to-r from-[#F5B82E] to-[#D4A43C] text-[#0D0D0D] shadow-md'
                        : 'border border-transparent text-stone-800 hover:border-[#D4A43C] hover:bg-white/60'
                    }`}
                  >
                    <SearchCheck className="w-4 h-4 shrink-0" />
                    <span>Check My Booking</span>
                  </button>
                </div>
                <AnimatePresence mode="wait">
                  {activeTab === 'check' ? (
                    <motion.div
                      key="lookup"
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                      className="space-y-5"
                    >
                      <div className="flex items-center gap-3 border-b border-[#F5E8D8] pb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-[#D4A43C] flex items-center justify-center">
                          <SearchCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-serif text-2xl font-bold text-[#0D0D0D]">Check My Booking</h3>
                          <p className="text-xs sm:text-sm text-stone-600 mt-1">
                            Track your reservation status using your booking reference and contact number.
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleLookup} className="space-y-4">
                        <div className="space-y-1.5">
                          <label htmlFor="booking-reference" className="block text-xs font-semibold text-[#171717]">
                            Booking Reference Number <span className="text-rose-600">*</span>
                          </label>
                          <div className="relative">
                            <TicketCheck className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              id="booking-reference"
                              type="text"
                              required
                              autoCapitalize="characters"
                              autoComplete="off"
                              placeholder="MK-2026-00124"
                              value={lookupReference}
                              onChange={(e) => setLookupReference(e.target.value.toUpperCase())}
                              className="w-full pl-10 pr-3 py-3 text-sm rounded-xl bg-white border border-[#E8DED3] text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D4A43C] transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="lookup-contact" className="block text-xs font-semibold text-[#171717]">
                            Contact Number or Email <span className="text-rose-600">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              id="lookup-contact"
                              type="text"
                              required
                              autoComplete="tel"
                              placeholder="07X XXX XXXX"
                              value={lookupContact}
                              onChange={(e) => setLookupContact(e.target.value)}
                              className="w-full pl-10 pr-3 py-3 text-sm rounded-xl bg-white border border-[#E8DED3] text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D4A43C] transition-all"
                            />
                          </div>
                        </div>
                        {lookupError && (
                          <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                            {lookupError}
                          </div>
                        )}
                        <button
                          type="submit"
                          disabled={lookupLoading}
                          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#F5B82E] to-[#D4A43C] hover:from-[#eab12b] hover:to-[#c6942c] text-[#0D0D0D] font-bold text-sm shadow-md active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {lookupLoading ? (
                            <>
                              <LoaderCircle className="w-4 h-4 animate-spin motion-reduce:animate-none" />
                              <span>Checking booking...</span>
                            </>
                          ) : (
                            <>
                              <SearchCheck className="w-4 h-4" />
                              <span>Check Booking Status</span>
                            </>
                          )}
                        </button>
                      </form>

                      {lookupResult && (
                        <motion.section
                          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: shouldReduceMotion ? 0 : 0.28 }}
                          aria-live="polite"
                          className="rounded-2xl border border-[#E8DED3] bg-white p-4 sm:p-5 shadow-sm space-y-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-serif text-lg font-bold text-stone-900">MiniKitchen Reservation</h4>
                              <p className="text-xs text-stone-500 mt-1">Booking Reference: {lookupResult.bookingReference}</p>
                            </div>
                            <span
                              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                                statusStyles[lookupResult.status] || 'bg-stone-100 text-stone-700 border-stone-300'
                              }`}
                            >
                              {lookupResult.status}
                            </span>
                          </div>
                          <dl className="grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                            <div><dt className="text-xs text-stone-500">Customer</dt><dd className="font-semibold text-stone-900">{lookupResult.customerName}</dd></div>
                            <div><dt className="text-xs text-stone-500">Guests</dt><dd className="font-semibold text-stone-900">{lookupResult.guestCount}</dd></div>
                            <div><dt className="text-xs text-stone-500">Date</dt><dd className="font-semibold text-stone-900">{formatReservationDate(lookupResult.reservationDate)}</dd></div>
                            <div><dt className="text-xs text-stone-500">Time</dt><dd className="font-semibold text-stone-900">{lookupResult.reservationTime}</dd></div>
                          </dl>
                          <p className="border-t border-stone-100 pt-3 text-sm leading-relaxed text-stone-700">
                            {statusMessages[lookupResult.status] || 'Please contact MiniKitchen for assistance with this reservation.'}
                          </p>
                        </motion.section>
                      )}
                    </motion.div>
                  ) : successReservation ? (
                    <motion.div
                      key="success"
                      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.24 }}
                      className="py-6 text-center space-y-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-sm">
                        <CheckCircle2 className="w-9 h-9" />
                      </div>

                      <h3 className="font-serif text-2xl font-bold text-stone-900">
                        Reservation Request Received!
                      </h3>

                      <p className="text-stone-600 text-sm max-w-sm mx-auto leading-relaxed">
                        Thank you, {successReservation.customerName}! Your reservation request has been received and is awaiting confirmation.
                      </p>

                      <div className="bg-white rounded-2xl p-4 text-sm text-stone-700 max-w-sm mx-auto border border-[#E8DED3] text-left space-y-2 shadow-sm">
                        <p className="text-xs text-stone-500">Your booking reference</p>
                        <p className="font-mono text-lg font-bold tracking-wide text-stone-900">{successReservation.bookingReference}</p>
                        <p>
                          <strong>Status:</strong>{' '}
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusStyles[successReservation.status] || 'bg-stone-100 text-stone-700 border-stone-300'}`}>
                            {successReservation.status}
                          </span>
                        </p>
                        <p><strong>Date &amp; Time:</strong> {successReservation.reservationDate} at {successReservation.reservationTime}</p>
                        <p><strong>Party Size:</strong> {successReservation.guestCount} Guests</p>
                        <p><strong>Contact:</strong> {successReservation.contactPhone}</p>
                        {successReservation.specialRequests && (
                          <p><strong>Note:</strong> {successReservation.specialRequests}</p>
                        )}
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={openBookingLookup}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F5B82E] to-[#D4A43C] text-[#0D0D0D] hover:brightness-95 transition-all text-xs font-bold shadow-md inline-flex items-center justify-center gap-2 mr-0 sm:mr-2 mb-2 sm:mb-0"
                        >
                          <SearchCheck className="w-4 h-4" />
                          Check Booking Status
                        </button>
                        <button
                          type="button"
                          onClick={handleReset}
                          className="px-6 py-2.5 rounded-xl bg-[#0D0D0D] text-white hover:bg-stone-800 transition-colors text-xs font-semibold shadow-md"
                        >
                          Book Another Table
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      {/* Card Header: Table Reservation */}
                      <div className="flex items-center gap-2.5 pb-2 border-b border-[#F5E8D8]">
                        <div className="w-8 h-8 rounded-lg bg-amber-100/70 text-[#D4A43C] flex items-center justify-center">
                          <Calendar className="w-4 h-4 stroke-[2]" />
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-[#0D0D0D] tracking-tight">
                          Table Reservation
                        </h3>
                      </div>

                      {errorMsg && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                          {errorMsg}
                        </div>
                      )}

                      {/* Row 1: Full Name & Contact Number */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-[#171717]">
                            Full Name <span className="text-[#D4A43C]">*</span>
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              placeholder="Enter your full name"
                              value={formData.customerName}
                              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                              className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-[#E8DED3] text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D4A43C] transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-[#171717]">
                            Contact Number <span className="text-[#D4A43C]">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              required
                              placeholder="07X XXX XXXX"
                              value={formData.contactPhone}
                              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                              className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-[#E8DED3] text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D4A43C] transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Date & Time */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-[#171717]">
                            Date <span className="text-[#D4A43C]">*</span>
                          </label>
                          <div className="relative">
                            <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="date"
                              required
                              min={today()}
                              value={formData.reservationDate}
                              onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
                              className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-[#E8DED3] text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D4A43C] transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-[#171717]">
                            Time <span className="text-[#D4A43C]">*</span>
                          </label>
                          <div className="relative">
                            <Clock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              placeholder="e.g. 7:30 PM"
                              value={formData.reservationTime}
                              onChange={(e) => setFormData({ ...formData, reservationTime: e.target.value })}
                              className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-[#E8DED3] text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D4A43C] transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 3: Number of Guests & Special Request */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-[#171717]">
                            Number of Guests <span className="text-[#D4A43C]">*</span>
                          </label>
                          <div className="relative">
                            <Users className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="number"
                              min="1"
                              max="30"
                              required
                              placeholder="e.g. 4"
                              value={formData.guestCount}
                              onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                              className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-[#E8DED3] text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D4A43C] transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-[#171717]">
                            Special Request (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Birthday, High chair, etc."
                            value={formData.specialRequests}
                            onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                            className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-[#E8DED3] text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D4A43C] transition-all"
                          />
                        </div>
                      </div>

                      {/* Full-Width Gold Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-[#F5B82E] to-[#D4A43C] hover:from-[#eab12b] hover:to-[#c6942c] text-[#0D0D0D] font-bold text-sm shadow-md active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Calendar className="w-4 h-4" />
                            <span>Reserve Table</span>
                          </>
                        )}
                      </button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={onOpenChat}
                          className="text-xs text-[#D4A43C] hover:underline inline-flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Need help? Chat with MiniKitchen AI Assistant &rarr;</span>
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer onOpenAdmin={onOpenAdmin} onOpenChat={onOpenChat} onNavigate={onNavigate} />
    </div>
  );
};
