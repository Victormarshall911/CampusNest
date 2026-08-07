import type { ListingPost } from '@/data/mockData';

/**
 * Client-safe helper that fetches listing details from the local database API.
 */
export async function getListingById(id: string): Promise<ListingPost | undefined> {
  try {
    const res = await fetch(`/api/listings/${id}`);
    if (!res.ok) return undefined;
    return await res.json();
  } catch (error) {
    console.error('Error in getListingById:', error);
    return undefined;
  }
}
