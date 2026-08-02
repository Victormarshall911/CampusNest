'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Check } from 'lucide-react';
import Link from 'next/link';
import { formatNaira } from '@/lib/utils';
import FilterSheet from '@/components/discover/FilterSheet';

interface StickyBottomBarProps {
  price: number;
  priceLabel: string;
  landlordId: string;
  landlordName: string;
}

export default function StickyBottomBar({
  price,
  priceLabel,
  landlordId,
  landlordName,
}: StickyBottomBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Monitor scroll height to show sticky bar
  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past hero section (roughly 350px)
      setIsVisible(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBook = () => {
    if (!bookingDate || !bookingTime) {
      alert('Please select both a date and a time.');
      return;
    }
    // Mock success: close sheet and show toast confirmation
    setIsSheetOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  return (
    <>
      {/* Sticky Bottom Bar */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:pl-64"
          >
            <div className="glass-nav px-4 py-3.5 flex items-center justify-between border-t border-[var(--border-light)] bg-white/80 backdrop-blur-md">
              <div className="flex flex-col">
                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wide">
                  Lodge Rent
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-extrabold gradient-text">
                    {formatNaira(price)}
                  </span>
                  <span className="text-[10px] text-text-secondary">
                    {priceLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSheetOpen(true)}
                  className="px-4 py-2.5 rounded-xl border border-cn-purple/20 text-cn-purple hover:bg-cn-purple/5 text-xs font-semibold transition-all active:scale-95 whitespace-nowrap"
                >
                  Book Inspection
                </button>
                <Link
                  href={`/messages/${landlordId}`}
                  className="px-5 py-2.5 rounded-xl text-white gradient-bg text-xs font-bold shadow-lg shadow-cn-purple/20 hover:shadow-xl hover:brightness-110 transition-all active:scale-95 whitespace-nowrap"
                >
                  Chat Landlord
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Book Inspection bottom sheet */}
      <FilterSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={`Book with ${landlordName}`}
        onApply={handleBook}
        onClear={() => {
          setBookingDate('');
          setBookingTime('');
        }}
      >
        <div className="space-y-4">
          <p className="text-xs text-text-secondary leading-relaxed">
            Select a preferred date and time to visit the premises. The landlord will confirm your inspection slot.
          </p>

          <div className="space-y-3">
            {/* Date Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cn-purple" />
                Select Date
              </label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-secondary border border-transparent focus:border-cn-purple/35 text-sm text-text-primary outline-none transition-colors"
              />
            </div>

            {/* Time Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cn-purple" />
                Select Time Slot
              </label>
              <select
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-secondary border border-transparent focus:border-cn-purple/35 text-sm text-text-primary outline-none transition-colors"
              >
                <option value="">-- Choose a Time --</option>
                <option value="09:00">Morning (09:00 AM)</option>
                <option value="11:00">Late Morning (11:00 AM)</option>
                <option value="14:00">Afternoon (02:00 PM)</option>
                <option value="16:00">Late Afternoon (04:00 PM)</option>
              </select>
            </div>
          </div>
        </div>
      </FilterSheet>

      {/* Success Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 z-50 md:w-80"
          >
            <div className="p-4 rounded-xl bg-neutral-900/95 backdrop-blur-md text-white shadow-xl flex items-center gap-3 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-cn-green/20 flex items-center justify-center text-cn-green shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold">Booking Request Sent!</p>
                <p className="text-[10px] text-white/70 truncate">
                  Landlord has been notified.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
