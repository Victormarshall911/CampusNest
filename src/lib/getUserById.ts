import type { CampusUser } from '@/data/mockData';

/**
 * Client-safe helper that fetches user profile details from the database API.
 */
export async function getUserById(id: string): Promise<CampusUser | undefined> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) return undefined;
    return await res.json();
  } catch (error) {
    console.error('Error in getUserById:', error);
    return undefined;
  }
}
