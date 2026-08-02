'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles } from 'lucide-react';
import FeedHeader from '@/components/feed/FeedHeader';
import FeedCard from '@/components/feed/FeedCard';
import { SkeletonFeed } from '@/components/ui/SkeletonLoader';
import { mockFeed, type FeedPost } from '@/data/mockData';
import { mockPostStore } from '@/lib/mockPostStore';

const POSTS_PER_PAGE = 8;

export default function HomePage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Setup local data source
  const getFeedData = useCallback(() => {
    return mockPostStore.getMergedFeed(mockFeed);
  }, []);

  // Initial load and subscribe to store changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentFeed = getFeedData();
      setPosts(currentFeed.slice(0, POSTS_PER_PAGE));
      setPage(1);
      setLoading(false);
    }, 1200);

    const unsubscribe = mockPostStore.subscribe(() => {
      const currentFeed = getFeedData();
      const pageCount = Math.max(1, page);
      setPosts(currentFeed.slice(0, pageCount * POSTS_PER_PAGE));
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [getFeedData, page]);

  // Infinite scroll — load more posts
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    setTimeout(() => {
      const currentFeed = getFeedData();
      const start = page * POSTS_PER_PAGE;
      const end = start + POSTS_PER_PAGE;
      const newPosts = currentFeed.slice(start, end);

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
        setPage((prev) => prev + 1);
      }
      setLoadingMore(false);
    }, 800);
  }, [page, loadingMore, hasMore, getFeedData]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, loading]);

  // Pull to refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      const currentFeed = getFeedData();
      // Keep session-created posts at top, shuffle static mock posts for fresh feel
      const sessionPosts = currentFeed.filter((p) => p.id.startsWith('session-'));
      const staticPosts = currentFeed.filter((p) => !p.id.startsWith('session-'));
      const shuffledStatic = [...staticPosts].sort(() => Math.random() - 0.5);
      const shuffled = [...sessionPosts, ...shuffledStatic];
      setPosts(shuffled.slice(0, POSTS_PER_PAGE));
      setPage(1);
      setHasMore(true);
      setRefreshing(false);
    }, 1500);
  }, [getFeedData]);

  return (
    <main className="min-h-screen">
      <FeedHeader />

      {/* Header spacer */}
      <div className="h-16" />

      {/* Pull to refresh button */}
      <div className="max-w-xl mx-auto px-4 pt-3 pb-1">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl glass text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <motion.div
            animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={refreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
          >
            <RefreshCw className="w-4 h-4" />
          </motion.div>
          {refreshing ? 'Refreshing your feed…' : 'Pull to refresh'}
        </motion.button>
      </div>

      {/* Feed content */}
      <div className="max-w-xl mx-auto px-4 py-4">
        {loading ? (
          <SkeletonFeed count={3} />
        ) : (
          <>
            {/* University filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide">
              {['All', 'UNILAG', 'UI', 'OAU', 'ABU', 'UNN', 'LASU', 'FUTA', 'UNIBEN'].map((uni, i) => (
                <motion.button
                  key={uni}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                    delay: i * 0.04,
                  }}
                  whileTap={{ scale: 0.92 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                    i === 0
                      ? 'gradient-bg text-white shadow-md shadow-cn-purple/20'
                      : 'glass text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {uni}
                </motion.button>
              ))}
            </div>

            {/* Feed posts */}
            <AnimatePresence mode="popLayout">
              <div className="space-y-4">
                {posts.map((post, index) => (
                  <FeedCard key={post.id} post={post} index={index} />
                ))}
              </div>
            </AnimatePresence>

            {/* Loading more indicator */}
            {loadingMore && (
              <div className="py-8">
                <SkeletonFeed count={2} />
              </div>
            )}

            {/* End of feed */}
            {!hasMore && posts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12 text-center"
              >
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl glass">
                  <Sparkles className="w-4 h-4 text-cn-purple" />
                  <span className="text-sm font-medium text-text-secondary">
                    You&apos;ve seen all posts! Check back later for new listings.
                  </span>
                </div>
              </motion.div>
            )}

            {/* Intersection observer trigger */}
            <div ref={observerRef} className="h-4" />
          </>
        )}
      </div>
    </main>
  );
}
