import { mockUsers, type ListingPost, type ReviewPost, type RoommatePost, type FeedPost } from '@/data/mockData';

/**
 * ⚠️ In-Memory Mock Post Store ⚠️
 *
 * This holds all posts (listings, reviews, roommate requests) created by the user during
 * the current session. Since this is a pure frontend demo, all added items will reset
 * upon page refresh.
 *
 * It implements a simple Pub/Sub observer pattern so that components/pages rendering feed or
 * discover grid data are notified and re-render when new items are published.
 */

const createdListings: ListingPost[] = [];
const createdReviews: ReviewPost[] = [];
const createdRoommates: RoommatePost[] = [];

type Subscriber = () => void;
const subscribers = new Set<Subscriber>();

export const mockPostStore = {
  subscribe(callback: Subscriber): () => void {
    subscribers.add(callback);
    return () => {
      subscribers.delete(callback);
    };
  },

  notify(): void {
    subscribers.forEach((cb) => cb());
  },

  getListings(): ListingPost[] {
    return createdListings;
  },

  getReviews(): ReviewPost[] {
    return createdReviews;
  },

  getRoommates(): RoommatePost[] {
    return createdRoommates;
  },

  addListing(listing: ListingPost): void {
    createdListings.unshift(listing);
    // Automatically update the landlord's active listings
    const user = mockUsers.find((u) => u.id === listing.landlord.id);
    if (user) {
      if (!user.activeListingIds) user.activeListingIds = [];
      user.activeListingIds.unshift(listing.id);
    }
    this.notify();
  },

  addReview(review: ReviewPost): void {
    createdReviews.unshift(review);
    // Find the student author to update their profile posts tab list
    const user = mockUsers.find((u) => u.name === review.author.name);
    if (user) {
      if (!user.postIds) user.postIds = [];
      user.postIds.unshift(review.id);
    }
    this.notify();
  },

  addRoommate(roommate: RoommatePost): void {
    createdRoommates.unshift(roommate);
    // Find the student author to update their profile posts tab list
    const user = mockUsers.find((u) => u.name === roommate.author.name);
    if (user) {
      if (!user.postIds) user.postIds = [];
      user.postIds.unshift(roommate.id);
    }
    this.notify();
  },

  /**
   * Helper to merge mockFeed (static mock posts) with user-created posts.
   * Maintains correct layout mix.
   */
  getMergedFeed(staticFeed: FeedPost[]): FeedPost[] {
    // Return all session posts first, followed by static mock posts
    const sessionPosts: FeedPost[] = [
      ...createdListings,
      ...createdReviews,
      ...createdRoommates,
    ];
    // Sort session posts by createdAt descending if they have dates, otherwise unshifted
    return [...sessionPosts, ...staticFeed];
  }
};
