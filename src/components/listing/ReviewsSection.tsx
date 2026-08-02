'use client';

import { Star, BadgeCheck, MessageSquareX } from 'lucide-react';
import { motion } from 'motion/react';
import Avatar from '@/components/ui/Avatar';
import { timeAgo, cn } from '@/lib/utils';
import type { ListingReview } from '@/data/mockData';

interface ReviewsSectionProps {
  reviews: ListingReview[];
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  // Calculate average rating
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? parseFloat(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)
        )
      : 0;

  return (
    <div className="space-y-4">
      {/* Review Header Stats */}
      {reviewCount > 0 ? (
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)]">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary">{averageRating}</span>
            <span className="text-xs text-text-tertiary">out of 5 stars</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, idx) => {
                const isFilled = idx < Math.round(averageRating);
                return (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 18,
                      delay: idx * 0.05,
                    }}
                  >
                    <Star
                      className={cn(
                        'w-4 h-4',
                        isFilled ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
                      )}
                    />
                  </motion.div>
                );
              })}
            </div>
            <span>({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
          </div>
        </div>
      ) : null}

      {/* Review Lists */}
      {reviewCount > 0 ? (
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-3.5 rounded-2xl bg-surface-secondary/70 border border-[var(--border-light)] space-y-2.5"
            >
              {/* Review Author header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar
                    src={review.authorAvatar}
                    alt={review.authorName}
                    size="sm"
                  />
                  <div>
                    <span className="text-xs font-bold text-text-primary block">
                      {review.authorName}
                    </span>
                    {review.verifiedTenant && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-cn-green">
                        <BadgeCheck className="w-3 h-3 fill-current text-cn-green text-white" />
                        Verified Tenant
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={cn(
                          'w-3 h-3',
                          idx < review.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-text-tertiary">
                    {timeAgo(review.date)}
                  </span>
                </div>
              </div>

              {/* Review Comments */}
              <p className="text-xs text-text-secondary leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      ) : (
        /* Empty review states */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-10 px-4 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-surface-secondary flex items-center justify-center mb-4">
            <MessageSquareX className="w-8 h-8 text-text-tertiary" />
          </div>
          <h4 className="text-sm font-semibold text-text-primary mb-1">
            No reviews yet
          </h4>
          <p className="text-xs text-text-secondary max-w-xs leading-normal">
            Be the first verified tenant to share your experience staying at this lodge!
          </p>
        </motion.div>
      )}
    </div>
  );
}
