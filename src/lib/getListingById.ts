import { mockFeed, type ListingPost } from '@/data/mockData';

/**
 * Pure lookup function to retrieve a specific listing from the mock feed.
 * Kept separate so it is a simple drop-in swap for API fetches later.
 */
export function getListingById(id: string): ListingPost | undefined {
  return mockFeed.find(
    (post): post is ListingPost => post.type === 'listing' && post.id === id
  );
}
