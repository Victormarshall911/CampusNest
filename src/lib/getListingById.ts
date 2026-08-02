import { mockFeed, type ListingPost } from '@/data/mockData';
import { mockPostStore } from '@/lib/mockPostStore';

/**
 * Pure lookup function to retrieve a specific listing from the mock feed.
 * Searches mockPostStore first, then falls back to mockFeed.
 */
export function getListingById(id: string): ListingPost | undefined {
  const sessionListing = mockPostStore.getListings().find((l) => l.id === id);
  if (sessionListing) return sessionListing;

  return mockFeed.find(
    (post): post is ListingPost => post.type === 'listing' && post.id === id
  );
}
