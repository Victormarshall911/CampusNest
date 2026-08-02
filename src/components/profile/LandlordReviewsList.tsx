'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Star, BadgeCheck, MessageSquareX } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { timeAgo, cn } from '@/lib/utils';
import type { ReviewWithListing } from '@/lib/getUserContent';

interface LandlordReviewsListProps {
  reviews: ReviewWithListing[];
}

/**
 * Aggregated review list across all of a landlord's listings.
 *
 * Review card markup reuses the exact styling from ReviewsSection
 * (p-3.5 rounded-2xl bg-surface-secondary/70 border spacing) to stay
 * visually consistent with Phase 3. Each card adds a linked chip
 * showing which listing the review is for.
 *
 * Stagger timing matches ListingsGrid: spring { stiffness: 300, damping: 30 }.
 */
export default function LandlordReviewsList({ reviews }: LandlordReviewsListProps) {
  if (reviews.length === 0) {
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
          <MessageSquareX className="w-8 h-8 text-text-tertiary" />
        </motion.div>
        <h3
          className="text-base font-semibold text-text-primary mb-1.5"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          No reviews yet
        </h3>
        <p className="text-xs text-text-secondary max-w-xs">
          Reviews from verified tenants will appear here once lodges are occupied.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3 px-4 pb-4">
      <AnimatePresence mode="popLayout">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              delay: Math.min(index * 0.025, 0.25),
            }}
            className="p-3.5 rounded-2xl bg-surface-secondary/70 border border-[var(--border-light)] space-y-2.5"
          >
            {/* Review author header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar src={review.authorAvatar} alt={review.authorName} size="sm" />
                <div>
                  <span className="text-xs font-bold text-text-primary block">
                    {review.authorName}
                  </span>
                  {review.verifiedTenant && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-cn-green">
                      <BadgeCheck className="w-3 h-3 fill-current text-cn-green" />
                      Verified Tenant
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                {/* Star row */}
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={cn(
                        'w-3 h-3',
                        idx < review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-neutral-200'
                      )}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-text-tertiary">{timeAgo(review.date)}</span>
              </div>
            </div>

            {/* Review body */}
            <p className="text-xs text-text-secondary leading-relaxed">{review.comment}</p>

            {/* Listing chip — links to the source listing */}
            <Link
              href={`/listing/${review.listingId}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cn-purple/10 text-cn-purple text-[10px] font-semibold hover:bg-cn-purple/20 transition-colors"
            >
              <Star className="w-2.5 h-2.5 fill-current" />
              {review.listingTitle}
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
