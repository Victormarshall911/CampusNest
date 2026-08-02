'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { UserX } from 'lucide-react';
import { formatNaira } from '@/lib/utils';
import type { ListingPost } from '@/data/mockData';

interface ListingsGridProps {
  listings: ListingPost[];
  emptyMessage?: string;
}

/**
 * Dense 3-column Instagram-style photo grid.
 * Each cell is square (aspect-square), showing the listing's primary image
 * with a ₦ price chip overlay.
 *
 * Stagger timing matches ResultsGrid: spring { stiffness: 300, damping: 30 },
 * delay: index * 0.025 capped at 0.25s.
 *
 * NOTE: No map/location affordance here — cells link to /listing/[id] only.
 */
export default function ListingsGrid({
  listings,
  emptyMessage = 'No listings yet',
}: ListingsGridProps) {
  // Empty state — same visual pattern as ResultsGrid
  if (listings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="flex flex-col items-center justify-center py-16 px-6 text-center"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl glass-elevated flex items-center justify-center mb-5"
        >
          <UserX className="w-8 h-8 text-text-tertiary" />
        </motion.div>
        <h3
          className="text-base font-semibold text-text-primary mb-1.5"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {emptyMessage}
        </h3>
        <p className="text-xs text-text-secondary max-w-xs">
          Listings will appear here once added.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5">
      <AnimatePresence mode="popLayout">
        {listings.map((listing, index) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              delay: Math.min(index * 0.025, 0.25),
            }}
          >
            <Link
              href={`/listing/${listing.id}`}
              className="block relative aspect-square overflow-hidden group"
            >
              {/* Primary listing image */}
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              {/* Price chip — bottom-right corner */}
              <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
                <span className="text-white text-[10px] font-bold leading-none">
                  {formatNaira(listing.price / 1000)}k
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
