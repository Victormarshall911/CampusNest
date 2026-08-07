import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all listings (mapped to ListingPost[])
export async function GET() {
  try {
    const dbListings = await prisma.listing.findMany({
      include: {
        landlord: true,
        university: true,
        reviews: {
          include: {
            author: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const mapped = dbListings.map((l) => ({
      id: l.id,
      type: 'listing' as const,
      landlord: {
        id: l.landlord.id,
        name: l.landlord.name,
        avatar: l.landlord.avatarUrl || '',
        isVerified: l.landlord.verified,
        rating: 4.8,
        totalListings: 1,
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
      likes: 8,
      comments: l.reviews.length,
      saves: 3,
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

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Fetch Listings Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve listing items' }, { status: 500 });
  }
}

// POST create listing (published from wizard)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      priceLabel,
      roomType,
      lat,
      lng,
      area,
      amenities,
      houseRules,
      images,
      universityId,
    } = body;

    if (!title || !price || !universityId) {
      return NextResponse.json({ error: 'Missing required listing fields' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Create listing row in Postgres
    const newListing = await prisma.listing.create({
      data: {
        title,
        description: description || '',
        price: Number(price),
        priceLabel: priceLabel || '/year',
        roomType: roomType || 'Self-Contain',
        lat: Number(lat) || 6.5157, // Default UNILAG coords fallback
        lng: Number(lng) || 3.3897,
        area: area || 'Yaba',
        distance: '0.8 km from campus', // Default computed mock tags
        distanceKm: 0.8,
        amenities: amenities || [],
        houseRules: houseRules || [],
        images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'],
        landlordId: userId,
        universityId: universityId,
      },
    });

    return NextResponse.json({ success: true, id: newListing.id });
  } catch (error: any) {
    console.error('Create Listing Error:', error);
    return NextResponse.json({ error: 'Failed to publish listing' }, { status: 500 });
  }
}
