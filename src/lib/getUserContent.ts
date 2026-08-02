import {
  mockFeed,
  mockUsers,
  type ListingPost,
  type ReviewPost,
  type RoommatePost,
  type ListingReview,
} from '@/data/mockData';

/** All listing posts in the feed, pre-filtered for efficiency. */
const allListings = mockFeed.filter((p): p is ListingPost => p.type === 'listing');

/**
 * Returns saved listings for a student user.
 * Returns [] for landlords or users without savedListingIds.
 */
export function getSavedListings(userId: string): ListingPost[] {
  const user = mockUsers.find((u) => u.id === userId);
  if (!user?.savedListingIds?.length) return [];
  return allListings.filter((l) => user.savedListingIds!.includes(l.id));
}

/**
 * Returns ReviewPost | RoommatePost feed items authored by this user.
 * Returns [] for landlords or users without postIds.
 */
export function getUserPosts(userId: string): (ReviewPost | RoommatePost)[] {
  const user = mockUsers.find((u) => u.id === userId);
  if (!user?.postIds?.length) return [];
  return mockFeed.filter(
    (p): p is ReviewPost | RoommatePost =>
      (p.type === 'review' || p.type === 'roommate-request') &&
      user.postIds!.includes(p.id)
  );
}

/**
 * Returns active listings owned by a landlord user.
 * Returns [] for students or landlords without activeListingIds.
 */
export function getUserActiveListings(userId: string): ListingPost[] {
  const user = mockUsers.find((u) => u.id === userId);
  if (!user?.activeListingIds?.length) return [];
  return allListings.filter((l) => user.activeListingIds!.includes(l.id));
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
