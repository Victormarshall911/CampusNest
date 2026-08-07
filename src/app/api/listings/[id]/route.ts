import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        landlord: {
          include: {
            listings: true,
          },
        },
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
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const mappedListing = {
      id: listing.id,
      type: 'listing' as const,
      landlord: {
        id: listing.landlord.id,
        name: listing.landlord.name,
        avatar: listing.landlord.avatarUrl || '',
        isVerified: listing.landlord.verified,
        rating: 4.8,
        totalListings: listing.landlord.listings.length,
        responseTime: listing.landlord.responseTime || 'Usually responds within 1hr',
        joinedDate: listing.landlord.joinedDate || 'Joined Host',
      },
      university: {
        id: listing.university.id,
        name: listing.university.name,
        shortName: listing.university.shortName,
        state: listing.university.state,
        areas: listing.university.areas,
        lat: listing.university.lat,
        lng: listing.university.lng,
      },
      area: listing.area,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      priceLabel: listing.priceLabel,
      roomType: listing.roomType,
      images: listing.images,
      amenities: listing.amenities,
      likes: 15,
      comments: listing.reviews.length,
      saves: 4,
      isLiked: false,
      isSaved: false,
      createdAt: listing.createdAt.toISOString(),
      distance: listing.distance,
      distanceKm: listing.distanceKm,
      lat: listing.lat,
      lng: listing.lng,
      videoUrl: listing.videoUrl || undefined,
      houseRules: listing.houseRules,
      reviews: listing.reviews.map((r) => ({
        id: r.id,
        authorName: r.author.name,
        authorAvatar: r.author.avatarUrl || '',
        verifiedTenant: r.verifiedTenant,
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(mappedListing);
  } catch (error) {
    console.error('Fetch Single Listing Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve listing details' }, { status: 500 });
  }
}
