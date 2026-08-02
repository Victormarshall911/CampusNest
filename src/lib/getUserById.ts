import { mockUsers, type CampusUser } from '@/data/mockData';

/**
 * Pure lookup — finds a user by id from mockUsers.
 * Drop-in swap for a real API fetch later.
 */
export function getUserById(id: string): CampusUser | undefined {
  return mockUsers.find((u) => u.id === id);
}
