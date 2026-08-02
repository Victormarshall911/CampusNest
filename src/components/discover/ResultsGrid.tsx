'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SearchX, Sparkles, SlidersHorizontal } from 'lucide-react';
import FeedCard from '@/components/feed/FeedCard';
import type { ListingPost } from '@/data/mockData';

interface ResultsGridProps {
  listings: ListingPost[];
  onClearFilters: () => void;
}

// Animated count component
function AnimatedCount({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = value;
    if (prev === value) return;

    const diff = value - prev;
    const steps = 15;
    const stepSize = diff / steps;
    let current = prev;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += stepSize;
      setDisplayValue(Math.round(current));
      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
}

export default function ResultsGrid({ listings, onClearFilters }: ResultsGridProps) {
  // Empty state
  if (listings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex flex-col items-center justify-center py-16 px-6 text-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-2xl glass-elevated flex items-center justify-center mb-6"
        >
          <SearchX className="w-10 h-10 text-text-tertiary" />
        </motion.div>
        <h3 className="text-lg font-semibold text-text-primary mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          No rooms found
        </h3>
        <p className="text-sm text-text-secondary max-w-xs mb-6">
          Try adjusting your filters or search to find more listings near your campus.
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold shadow-lg shadow-cn-purple/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Clear all filters
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Result count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 mb-4"
      >
        <Sparkles className="w-4 h-4 text-cn-purple" />
        <span className="text-sm font-medium text-text-secondary">
          <AnimatedCount value={listings.length} />{' '}
          {listings.length === 1 ? 'room' : 'rooms'} found
        </span>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <AnimatePresence mode="popLayout">
          {listings.map((listing, index) => (
            <FeedCard
              key={listing.id}
              post={listing}
              index={index}
              compact
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
