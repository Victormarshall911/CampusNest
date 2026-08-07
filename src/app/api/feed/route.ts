import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { FeedPost } from '@/data/mockData';

export async function GET() {
  try {
    // 1. Fetch listings
    const dbListings = await prisma.listing.findMany({
      include: {
        landlord: true,
        university: true,
        reviews: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 2. Fetch roommate requests and review posts
    const dbPosts = await prisma.post.findMany({
      include: {
        author: true,
        university: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 3. Map listings to ListingPost shape
    const mappedListings = dbListings.map((l) => ({
      id: l.id,
      type: 'listing' as const,
      landlord: {
        id: l.landlord.id,
        name: l.landlord.name,
        avatar: l.landlord.avatarUrl || '',
        isVerified: l.landlord.verified,
        rating: 4.8, // default fallback
        totalListings: 1, // default fallback
        responseTime: l.landlord.responseTime || 'Responds quickly',
        joinedDate: l.landlord.joinedDate || 'Joined Host',
      },
      university: {
        id: l.university.id,
        name: l.university.name,
        shortName: l.university.shortName,
        state: l.university.state,
        areas: l.university.areas,
        lat: l.university.lat,
        lng: l.university.lng,
      },
      area: l.area,
      title: l.title,
      description: l.description,
      price: l.price,
      priceLabel: l.priceLabel,
      roomType: l.roomType,
      images: l.images,
      amenities: l.amenities,
      likes: 12, // mock value for social engagement
      comments: l.reviews.length,
      saves: 5,
      isLiked: false,
      isSaved: false,
      createdAt: l.createdAt.toISOString(),
      distance: l.distance,
      distanceKm: l.distanceKm,
      lat: l.lat,
      lng: l.lng,
      videoUrl: l.videoUrl || undefined,
      houseRules: l.houseRules,
      reviews: l.reviews.map((r) => ({
        id: r.id,
        authorName: r.author.name,
        authorAvatar: r.author.avatarUrl || '',
        verifiedTenant: r.verifiedTenant,
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt.toISOString(),
      })),
    }));

    // 4. Map dbPosts to RoommatePost or ReviewPost shapes
    const mappedPosts = dbPosts.map((p) => {
      const baseAuthor = {
        name: p.author.name,
        avatar: p.author.avatarUrl || '',
        university: p.university?.shortName || '',
      };

      if (p.type === 'ROOMMATE_REQUEST') {
        return {
          id: p.id,
          type: 'roommate-request' as const,
          author: {
            ...baseAuthor,
            level: '300 Level', // Default fallback details
            department: 'Student',
          },
          university: {
            id: p.university?.id || 'unilag',
            name: p.university?.name || '',
            shortName: p.university?.shortName || '',
            state: p.university?.state || '',
            areas: p.university?.areas || [],
            lat: p.university?.lat || 6.5,
            lng: p.university?.lng || 3.4,
          },
          area: p.area || '',
          budget: p.budget || 0,
          title: p.title || '',
          description: p.text,
          preferences: ['Clean', 'Quiet'], // Fallback tags
          likes: 3,
          comments: 0,
          createdAt: p.createdAt.toISOString(),
          isLiked: false,
        };
      } else {
        return {
          id: p.id,
          type: 'review' as const,
          author: baseAuthor,
          landlordName: p.landlordName || '',
          area: p.area || '',
          university: {
            id: p.university?.id || 'unilag',
            name: p.university?.name || '',
            shortName: p.university?.shortName || '',
            state: p.university?.state || '',
            areas: p.university?.areas || [],
            lat: p.university?.lat || 6.5,
            lng: p.university?.lng || 3.4,
          },
          rating: p.rating || 5,
          title: p.title || '',
          content: p.text,
          images: p.images || [],
          likes: 4,
          comments: 0,
          createdAt: p.createdAt.toISOString(),
          isLiked: false,
          isVerifiedTenant: true,
        };
      }
    });

    // 5. Merge and sort
    const merged = [...mappedListings, ...mappedPosts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(merged);
  } catch (error) {
    console.error('Fetch Feed API Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve feed items' }, { status: 500 });
  }
}
