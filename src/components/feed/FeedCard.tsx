'use client';

import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Share2, Bookmark, MapPin, Star, Users, BadgeCheck } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import ImageCarousel from '@/components/feed/ImageCarousel';
import { formatNaira, timeAgo, formatCount, cn } from '@/lib/utils';
import type { FeedPost, ListingPost, ReviewPost, RoommatePost } from '@/data/mockData';

interface FeedCardProps {
  post: FeedPost;
  index: number;
  compact?: boolean;
}

export default function FeedCard({ post, index, compact = false }: FeedCardProps) {
  switch (post.type) {
    case 'listing':
      return <ListingCard post={post} index={index} compact={compact} />;
    case 'review':
      return <ReviewCard post={post} index={index} />;
    case 'roommate-request':
      return <RoommateCard post={post} index={index} />;
  }
}

// ============================================
// Listing Card
// ============================================
function ListingCard({ post, index, compact = false }: { post: ListingPost; index: number; compact?: boolean }) {
  const [liked, setLiked] = useState(post.isLiked);
  const [saved, setSaved] = useState(post.isSaved);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [expanded, setExpanded] = useState(false);

  const handleLike = useCallback(() => {
    setLiked((prev) => {
      setLikeCount((c) => prev ? c - 1 : c + 1);
      return !prev;
    });
  }, []);

  const handleDoubleTap = useCallback(() => {
    if (!liked) {
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  }, [liked]);

  // ===== Compact variant for Discover grid =====
  if (compact) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          delay: Math.min(index * 0.03, 0.3),
        }}
        className="glass-solid rounded-xl overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
      >
        {/* Image — single image, no carousel in compact */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={post.images[0]}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Price overlay */}
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
            <span className="text-white text-sm font-bold">{formatNaira(post.price)}</span>
            <span className="text-white/70 text-xs">{post.priceLabel}</span>
          </div>
          {/* Save button */}
          <motion.button
            whileTap={{ scale: 0.75 }}
            onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 backdrop-blur-sm"
          >
            <Bookmark className={cn(
              'w-4 h-4',
              saved ? 'fill-white text-white' : 'text-white/80'
            )} />
          </motion.button>
          {/* Image count */}
          {post.images.length > 1 && (
            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium">
              1/{post.images.length}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs font-medium text-cn-purple bg-cn-purple/10 px-1.5 py-0.5 rounded">
              {post.roomType}
            </span>
            {post.landlord.isVerified && (
              <span className="text-[10px] text-cn-blue font-medium">✓ Verified</span>
            )}
          </div>
          <h3 className="text-xs font-semibold text-text-primary leading-tight line-clamp-1 mb-1">
            {post.title}
          </h3>
          <div className="flex items-center gap-1 text-[11px] text-text-tertiary">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{post.university.shortName} · {post.area}</span>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); handleLike(); }} className="flex items-center gap-0.5">
                <Heart className={cn('w-3.5 h-3.5', liked ? 'fill-[var(--like-red)] text-[var(--like-red)]' : 'text-text-tertiary')} />
                <span className="text-[10px] text-text-tertiary">{formatCount(likeCount)}</span>
              </button>
            </div>
            <span className="text-[10px] text-text-tertiary">{post.distance}</span>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: Math.min(index * 0.08, 0.4),
      }}
      className="glass-solid rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar
          src={post.landlord.avatar}
          alt={post.landlord.name}
          size="md"
          isVerified={post.landlord.isVerified}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-text-primary truncate">
              {post.landlord.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <MapPin className="w-3 h-3" />
            <span>{post.university.shortName} · {post.area}</span>
            <span>·</span>
            <span>{timeAgo(post.createdAt)}</span>
          </div>
        </div>
        {/* Room type badge */}
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-cn-purple/10 text-cn-purple whitespace-nowrap">
          {post.roomType}
        </span>
      </div>

      {/* Image carousel */}
      <ImageCarousel
        images={post.images}
        alt={post.title}
        onDoubleTap={handleDoubleTap}
      />

      {/* Action bar */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-1">
        {/* Like */}
        <motion.button
          whileTap={{ scale: 0.75 }}
          onClick={handleLike}
          className="p-2 rounded-full hover:bg-surface-secondary transition-colors"
        >
          <motion.div
            animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 10 }}
          >
            <Heart
              className={cn(
                'w-6 h-6 transition-colors',
                liked ? 'fill-[var(--like-red)] text-[var(--like-red)]' : 'text-text-secondary'
              )}
            />
          </motion.div>
        </motion.button>

        {/* Comment */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          className="p-2 rounded-full hover:bg-surface-secondary transition-colors"
        >
          <MessageCircle className="w-6 h-6 text-text-secondary" />
        </motion.button>

        {/* Share */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          className="p-2 rounded-full hover:bg-surface-secondary transition-colors"
        >
          <Share2 className="w-5 h-5 text-text-secondary" />
        </motion.button>

        <div className="flex-1" />

        {/* Save */}
        <motion.button
          whileTap={{ scale: 0.75 }}
          onClick={() => setSaved(!saved)}
          className="p-2 rounded-full hover:bg-surface-secondary transition-colors"
        >
          <motion.div
            animate={saved ? { scale: [1, 1.3, 1], rotate: [0, -15, 0] } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Bookmark
              className={cn(
                'w-6 h-6 transition-colors',
                saved ? 'fill-[var(--save-amber)] text-[var(--save-amber)]' : 'text-text-secondary'
              )}
            />
          </motion.div>
        </motion.button>
      </div>

      {/* Social stats */}
      <div className="px-4 pb-1">
        <span className="text-sm font-semibold text-text-primary">
          {formatCount(likeCount)} likes
        </span>
      </div>

      {/* Price + description */}
      <div className="px-4 pb-3">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-bold gradient-text">
            {formatNaira(post.price)}
          </span>
          <span className="text-xs text-text-tertiary">{post.priceLabel}</span>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          {expanded ? post.description : post.description.slice(0, 100)}
          {post.description.length > 100 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-text-tertiary font-medium ml-1 hover:text-text-secondary"
            >
              {expanded ? ' less' : '… more'}
            </button>
          )}
        </p>

        {/* Amenity pills (show first 4) */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {post.amenities.slice(0, 4).map((amenity) => (
            <span
              key={amenity}
              className="px-2 py-0.5 rounded-full text-xs bg-surface-secondary text-text-secondary"
            >
              {amenity}
            </span>
          ))}
          {post.amenities.length > 4 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-surface-secondary text-text-tertiary">
              +{post.amenities.length - 4} more
            </span>
          )}
        </div>

        {/* Distance */}
        <div className="flex items-center gap-1 mt-2 text-xs text-text-tertiary">
          <MapPin className="w-3 h-3" />
          <span>{post.distance}</span>
        </div>
      </div>

      {/* Comments preview */}
      <div className="px-4 pb-3">
        <button className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">
          View all {post.comments} comments
        </button>
      </div>
    </motion.article>
  );
}

// ============================================
// Review Card
// ============================================
function ReviewCard({ post, index }: { post: ReviewPost; index: number }) {
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likes);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: Math.min(index * 0.08, 0.4),
      }}
      className="glass-solid rounded-2xl overflow-hidden"
    >
      {/* Review badge */}
      <div className="px-4 pt-3 pb-2">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-cn-green/10 text-cn-green">
          <Star className="w-3 h-3 fill-current" />
          Review
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-3">
        <Avatar
          src={post.author.avatar}
          alt={post.author.name}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-text-primary truncate">
              {post.author.name}
            </span>
            {post.isVerifiedTenant && (
              <BadgeCheck className="w-4 h-4 text-cn-green fill-cn-green/10" strokeWidth={2.5} />
            )}
            {post.isVerifiedTenant && (
              <span className="text-xs text-cn-green font-medium">Verified Tenant</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <span>Reviewing {post.landlordName}</span>
            <span>·</span>
            <span>{post.university.shortName} · {post.area}</span>
          </div>
        </div>
      </div>

      {/* Rating stars */}
      <div className="px-4 pb-2 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'w-4 h-4',
              i < post.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
            )}
          />
        ))}
        <span className="text-sm font-semibold text-text-primary ml-1">{post.rating}/5</span>
      </div>

      {/* Images if any */}
      {post.images.length > 0 && (
        <ImageCarousel
          images={post.images}
          alt={post.title}
        />
      )}

      {/* Content */}
      <div className="px-4 py-3">
        <h3 className="text-sm font-semibold text-text-primary mb-1">{post.title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{post.content}</p>
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 flex items-center gap-1">
        <motion.button
          whileTap={{ scale: 0.75 }}
          onClick={() => {
            setLiked(!liked);
            setLikeCount(liked ? likeCount - 1 : likeCount + 1);
          }}
          className="p-2 rounded-full hover:bg-surface-secondary transition-colors"
        >
          <Heart
            className={cn(
              'w-5 h-5 transition-colors',
              liked ? 'fill-[var(--like-red)] text-[var(--like-red)]' : 'text-text-secondary'
            )}
          />
        </motion.button>
        <span className="text-sm text-text-secondary">{formatCount(likeCount)}</span>

        <motion.button
          whileTap={{ scale: 0.85 }}
          className="p-2 rounded-full hover:bg-surface-secondary transition-colors ml-2"
        >
          <MessageCircle className="w-5 h-5 text-text-secondary" />
        </motion.button>
        <span className="text-sm text-text-secondary">{post.comments}</span>

        <div className="flex-1" />
        <span className="text-xs text-text-tertiary">{timeAgo(post.createdAt)}</span>
      </div>
    </motion.article>
  );
}

// ============================================
// Roommate Request Card
// ============================================
function RoommateCard({ post, index }: { post: RoommatePost; index: number }) {
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likes);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: Math.min(index * 0.08, 0.4),
      }}
      className="glass-solid rounded-2xl overflow-hidden"
    >
      {/* Roommate badge */}
      <div className="px-4 pt-3 pb-2">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-cn-blue/10 text-cn-blue">
          <Users className="w-3 h-3" />
          Roommate Request
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-3">
        <Avatar
          src={post.author.avatar}
          alt={post.author.name}
          size="md"
          hasGradientBorder
        />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-text-primary truncate block">
            {post.author.name}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <span>{post.author.level} · {post.author.department}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <MapPin className="w-3 h-3" />
            <span>{post.university.shortName} · {post.area}</span>
          </div>
        </div>
        {/* Budget badge */}
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cn-blue/10 text-cn-blue whitespace-nowrap">
          Budget: {formatNaira(post.budget)}
        </span>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <h3 className="text-sm font-semibold text-text-primary mb-1">{post.title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{post.description}</p>

        {/* Preference tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.preferences.map((pref) => (
            <span
              key={pref}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-cn-purple/8 text-cn-purple border border-cn-purple/15"
            >
              {pref}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 flex items-center gap-1 border-t border-[var(--border-light)] pt-3">
        <motion.button
          whileTap={{ scale: 0.75 }}
          onClick={() => {
            setLiked(!liked);
            setLikeCount(liked ? likeCount - 1 : likeCount + 1);
          }}
          className="p-2 rounded-full hover:bg-surface-secondary transition-colors"
        >
          <Heart
            className={cn(
              'w-5 h-5 transition-colors',
              liked ? 'fill-[var(--like-red)] text-[var(--like-red)]' : 'text-text-secondary'
            )}
          />
        </motion.button>
        <span className="text-sm text-text-secondary">{formatCount(likeCount)}</span>

        <motion.button
          whileTap={{ scale: 0.85 }}
          className="p-2 rounded-full hover:bg-surface-secondary transition-colors ml-2"
        >
          <MessageCircle className="w-5 h-5 text-text-secondary" />
        </motion.button>
        <span className="text-sm text-text-secondary">{post.comments}</span>

        <div className="flex-1" />

        {/* Connect button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="px-4 py-1.5 rounded-full text-xs font-semibold gradient-bg text-white shadow-md shadow-cn-purple/20"
        >
          Connect
        </motion.button>
      </div>
    </motion.article>
  );
}
