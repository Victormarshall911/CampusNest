import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ListingPost, ReviewPost, RoommatePost } from '@/data/mockData';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        university: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1. Fetch landlord active listings
    const dbActiveListings = await prisma.listing.findMany({
      where: { landlordId: id },
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

    const activeListings = dbActiveListings.map((l) => ({
      id: l.id,
      type: 'listing' as const,
      landlord: {
        id: l.landlord.id,
        name: l.landlord.name,
        avatar: l.landlord.avatarUrl || '',
        isVerified: l.landlord.verified,
        rating: 4.8,
        totalListings: dbActiveListings.length,
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
      likes: 12,
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

    // 2. Fetch saved listings
    const dbSavedListings = await prisma.savedListing.findMany({
      where: { userId: id },
      include: {
        listing: {
          include: {
            landlord: true,
            university: true,
            reviews: {
              include: {
                author: true,
              },
            },
          },
        },
      },
      orderBy: {
        savedAt: 'desc',
      },
    });

    const savedListings = dbSavedListings.map((s) => ({
      id: s.listing.id,
      type: 'listing' as const,
      landlord: {
        id: s.listing.landlord.id,
        name: s.listing.landlord.name,
        avatar: s.listing.landlord.avatarUrl || '',
        isVerified: s.listing.landlord.verified,
        rating: 4.8,
        totalListings: 1,
        responseTime: s.listing.landlord.responseTime || 'Responds quickly',
        joinedDate: s.listing.landlord.joinedDate || 'Joined Host',
      },
      university: {
        id: s.listing.university.id,
        name: s.listing.university.name,
        shortName: s.listing.university.shortName,
        state: s.listing.university.state,
        areas: s.listing.university.areas,
        lat: s.listing.university.lat,
        lng: s.listing.university.lng,
      },
      area: s.listing.area,
      title: s.listing.title,
      description: s.listing.description,
      price: s.listing.price,
      priceLabel: s.listing.priceLabel,
      roomType: s.listing.roomType,
      images: s.listing.images,
      amenities: s.listing.amenities,
      likes: 6,
      comments: s.listing.reviews.length,
      saves: 2,
      isLiked: false,
      isSaved: true,
      createdAt: s.listing.createdAt.toISOString(),
      distance: s.listing.distance,
      distanceKm: s.listing.distanceKm,
      lat: s.listing.lat,
      lng: s.listing.lng,
      videoUrl: s.listing.videoUrl || undefined,
      houseRules: s.listing.houseRules,
      reviews: s.listing.reviews.map((r) => ({
        id: r.id,
        authorName: r.author.name,
        authorAvatar: r.author.avatarUrl || '',
        verifiedTenant: r.verifiedTenant,
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt.toISOString(),
      })),
    }));

    // 3. Fetch roommate and review posts authored by user
    const dbPosts = await prisma.post.findMany({
      where: { authorId: id },
      include: {
        author: true,
        university: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const userPosts = dbPosts.map((p) => {
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
            level: '300 Level',
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
          likes: 2,
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

    // 4. Map landlord aggregate reviews
    const aggregateReviews = activeListings.flatMap((l) =>
      l.reviews.map((r) => ({
        ...r,
        listingId: l.id,
        listingTitle: l.title,
      }))
    );

    // 5. Compute average landlord rating
    const reviewCount = aggregateReviews.length;
    const avgRating = reviewCount > 0
      ? parseFloat((aggregateReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
      : 0;

    const mappedUser = {
      id: user.id,
      name: user.name,
      avatar: user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      role: user.role.toLowerCase(),
      isVerified: user.verified,
      joinedDate: user.joinedDate || 'Joined Host',
      bio: user.bio || '',
      universityId: user.universityId || undefined,
      universityShortName: user.university?.shortName || undefined,
      level: '300 Level',
      department: 'Student',
      
      // Content collections payload
      savedListings,
      userPosts,
      activeListings,
      aggregateReviews,
      ratingDetails: {
        avg: avgRating,
        count: reviewCount,
      },
    };

    return NextResponse.json(mappedUser);
  } catch (error) {
    console.error('Fetch User Content Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve user details and content' }, { status: 500 });
  }
}
