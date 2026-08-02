import {
  mockFeed,
  mockUsers,
  type ListingPost,
  type ReviewPost,
  type RoommatePost,
  type ListingReview,
} from '@/data/mockData';

import { mockPostStore } from '@/lib/mockPostStore';

/**
 * Returns saved listings for a student user.
 * Returns [] for landlords or users without savedListingIds.
 */
export function getSavedListings(userId: string): ListingPost[] {
  const user = mockUsers.find((u) => u.id === userId);
  if (!user?.savedListingIds?.length) return [];
  
  const staticListings = mockFeed.filter((p): p is ListingPost => p.type === 'listing');
  const sessionListings = mockPostStore.getListings();
  const allListings = [...sessionListings, ...staticListings];
  
  return allListings.filter((l) => user.savedListingIds!.includes(l.id));
}

/**
 * Returns ReviewPost | RoommatePost feed items authored by this user.
 * Returns [] for landlords or users without postIds.
 */
export function getUserPosts(userId: string): (ReviewPost | RoommatePost)[] {
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) return [];
  
  const staticPosts = mockFeed.filter(
    (p): p is ReviewPost | RoommatePost =>
      p.type === 'review' || p.type === 'roommate-request'
  );
  const sessionReviews = mockPostStore.getReviews();
  const sessionRoommates = mockPostStore.getRoommates();
  
  const allPosts = [...sessionReviews, ...sessionRoommates, ...staticPosts];
  
  return allPosts.filter((p) => {
    if (user.postIds?.includes(p.id)) return true;
    if (p.id.startsWith('session-')) {
      if ('author' in p && p.author.name === user.name) return true;
    }
    return false;
  });
}

/**
 * Returns active listings owned by a landlord user.
 * Returns [] for students or landlords without activeListingIds.
 */
export function getUserActiveListings(userId: string): ListingPost[] {
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) return [];
  
  const staticListings = mockFeed.filter((p): p is ListingPost => p.type === 'listing');
  const sessionListings = mockPostStore.getListings();
  const allListings = [...sessionListings, ...staticListings];
  
  return allListings.filter((l) => l.landlord.id === userId);
}

/** Augmented review — carries the listing it came from for display. */
export type ReviewWithListing = ListingReview & {
  listingId: string;
  listingTitle: string;
};

/**
 * Aggregates all reviews across a landlord's listings, augmented with
 * the source listing id + title so the review list can show a linked chip.
 */
export function getAggregateReviews(userId: string): ReviewWithListing[] {
  const listings = getUserActiveListings(userId);
  return listings.flatMap((l) =>
    l.reviews.map((r) => ({ ...r, listingId: l.id, listingTitle: l.title }))
  );
}

/**
 * Computes average rating + total review count across all of a landlord's listings.
 */
export function getAggregateRating(userId: string): { avg: number; count: number } {
  const reviews = getAggregateReviews(userId);
  if (reviews.length === 0) return { avg: 0, count: 0 };
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return {
    avg: parseFloat((total / reviews.length).toFixed(1)),
    count: reviews.length,
  };
}
