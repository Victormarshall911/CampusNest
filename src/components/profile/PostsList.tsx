'use client';

import { motion } from 'motion/react';
import { FileText } from 'lucide-react';
import FeedCard from '@/components/feed/FeedCard';
import type { ReviewPost, RoommatePost } from '@/data/mockData';

interface PostsListProps {
  posts: (ReviewPost | RoommatePost)[];
}

/**
 * Renders a student's review/roommate-request posts using the existing
 * FeedCard component directly — no new card type, consistent with the feed.
 */
export default function PostsList({ posts }: PostsListProps) {
  if (posts.length === 0) {
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
          <FileText className="w-8 h-8 text-text-tertiary" />
        </motion.div>
        <h3
          className="text-base font-semibold text-text-primary mb-1.5"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          No posts yet
        </h3>
        <p className="text-xs text-text-secondary max-w-xs">
          Reviews and roommate requests will appear here.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 px-4 pb-4">
      {posts.map((post, index) => (
        <FeedCard key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}
