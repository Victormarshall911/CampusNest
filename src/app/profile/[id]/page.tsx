'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { UserX, Compass } from 'lucide-react';
import { useSession } from 'next-auth/react';
import type { CampusUser } from '@/data/mockData';

import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs, { TabContent } from '@/components/profile/ProfileTabs';
import ListingsGrid from '@/components/profile/ListingsGrid';
import PostsList from '@/components/profile/PostsList';
import LandlordReviewsList from '@/components/profile/LandlordReviewsList';

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Banner */}
      <div className="skeleton w-full h-44" style={{ borderRadius: 0 }} />

      <div className="px-4">
        {/* Avatar + action row */}
        <div className="flex items-end justify-between -mt-12 mb-3">
          <div className="skeleton w-[86px] h-[86px] rounded-full" />
          <div className="skeleton h-9 w-28 rounded-xl" />
        </div>

        {/* Name + subtext */}
        <div className="space-y-2 mb-4">
          <div className="skeleton h-6 w-40" />
          <div className="skeleton h-4 w-56" />
          <div className="skeleton h-3 w-full max-w-xs" />
        </div>

        {/* Stats row */}
        <div className="flex gap-2 mb-5">
          <div className="flex-1 skeleton h-16 rounded-xl" />
          <div className="flex-1 skeleton h-16 rounded-xl" />
          <div className="flex-1 skeleton h-16 rounded-xl" />
        </div>

        {/* Tabs */}
        <div className="skeleton h-11 rounded-xl mb-4" />

        {/* Grid placeholder */}
        <div className="grid grid-cols-3 gap-0.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton aspect-square" style={{ borderRadius: 0 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Not Found ─────────────────────────────────────────────────────────────────
function UserNotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[var(--background)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="max-w-sm space-y-6"
      >
        <div className="w-20 h-20 rounded-2xl glass-solid border border-cn-coral/20 flex items-center justify-center mx-auto text-cn-coral">
          <UserX className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2
            className="text-xl font-extrabold text-text-primary"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            User Not Found
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            This profile doesn&apos;t exist or may have been removed. Let&apos;s get you back to
            exploring.
          </p>
        </div>
        <Link
          href="/discover"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white gradient-bg font-semibold shadow-lg shadow-cn-purple/20"
        >
          <Compass className="w-4 h-4" />
          Explore Listings
        </Link>
      </motion.div>
    </main>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();

  const [user, setUser] = useState<any>(undefined);
  const [activeTab, setActiveTab] = useState('');

  // Fetch profile details and collections from Postgres API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setActiveTab(data.role === 'student' ? 'saved' : 'listings');
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    };
    fetchProfile();
  }, [id]);

  // Loading
  if (user === undefined) return <ProfileSkeleton />;

  // Not found
  if (user === null) return <UserNotFound />;

  const currentUserId = (session?.user as any)?.id;
  const isOwnProfile = id === currentUserId;
  const isStudent = user.role === 'student';

  const savedListings = user.savedListings || [];
  const userPosts = user.userPosts || [];
  const activeListings = user.activeListings || [];
  const reviews = user.aggregateReviews || [];
  const { avg: avgRating, count: reviewCount } = user.ratingDetails || { avg: 0, count: 0 };

  const tabs = isStudent
    ? [
        { id: 'saved', label: `Saved (${savedListings.length})` },
        { id: 'posts', label: `Posts (${userPosts.length})` },
      ]
    : [
        { id: 'listings', label: `Listings (${activeListings.length})` },
        { id: 'reviews', label: `Reviews (${reviewCount})` },
      ];

  return (
    <main className="min-h-screen bg-[var(--background)] pb-24">
      {/* Profile Header — shared by both roles */}
      <ProfileHeader
        user={user}
        isOwnProfile={isOwnProfile}
        savedCount={savedListings.length}
        postsCount={userPosts.length}
        activeListingsCount={activeListings.length}
        avgRating={avgRating}
        reviewCount={reviewCount}
      />

      {/* Tabs + content */}
      <div className="px-4 space-y-4">
        {/* Segmented control */}
        <ProfileTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        <TabContent tabKey={activeTab}>
          {isStudent ? (
            activeTab === 'saved' ? (
              <ListingsGrid
                listings={savedListings}
                emptyMessage="No saved listings yet"
              />
            ) : (
              <PostsList posts={userPosts} />
            )
          ) : activeTab === 'listings' ? (
            <ListingsGrid
              listings={activeListings}
              emptyMessage="No active listings yet"
            />
          ) : (
            <LandlordReviewsList reviews={reviews} />
          )}
        </TabContent>
      </div>
    </main>
  );
}
