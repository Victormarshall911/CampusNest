import type { ListingPost } from '@/data/mockData';

export interface Filters {
  university: string | null;
  priceRange: [number, number];
  roomTypes: string[];
  amenities: string[];
  maxDistanceKm: number | null;
  searchQuery: string;
}

export const defaultFilters: Filters = {
  university: null,
  priceRange: [0, 1000000],
  roomTypes: [],
  amenities: [],
  maxDistanceKm: null,
  searchQuery: '',
};

/**
 * Pure filter function — decoupled from UI so it's a drop-in swap
 * for a real API call later.  All filters combine with AND logic.
 */
export function filterListings(
  listings: ListingPost[],
  filters: Filters
): ListingPost[] {
  return listings.filter((listing) => {
    // University filter
    if (filters.university && listing.university.id !== filters.university) {
      return false;
    }

    // Price range filter
    if (
      listing.price < filters.priceRange[0] ||
      listing.price > filters.priceRange[1]
    ) {
      return false;
    }

    // Room type filter (multi-select, OR within the group)
    if (
      filters.roomTypes.length > 0 &&
      !filters.roomTypes.includes(listing.roomType)
    ) {
      return false;
    }

    // Amenities filter (AND — listing must have ALL selected amenities)
    if (filters.amenities.length > 0) {
      const hasAll = filters.amenities.every((amenity) =>
        listing.amenities.includes(amenity)
      );
      if (!hasAll) return false;
    }

    // Distance filter
    if (
      filters.maxDistanceKm !== null &&
      listing.distanceKm > filters.maxDistanceKm
    ) {
      return false;
    }

    // Text search (title, area, university name, landlord name)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const searchable = [
        listing.title,
        listing.area,
        listing.university.name,
        listing.university.shortName,
        listing.landlord.name,
        listing.roomType,
        listing.description,
      ]
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    return true;
  });
}

/**
 * Count how many active filters are set (for badge display)
 */
export function countActiveFilters(filters: Filters): number {
  let count = 0;
  if (filters.university) count++;
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) count++;
  if (filters.roomTypes.length > 0) count++;
  if (filters.amenities.length > 0) count++;
  if (filters.maxDistanceKm !== null) count++;
  return count;
}
