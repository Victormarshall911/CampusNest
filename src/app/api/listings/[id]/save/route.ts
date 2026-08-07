import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST save listing
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: listingId } = await params;
    const userId = (session.user as any).id;

    // Check if already saved
    const existing = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    if (!existing) {
      await prisma.savedListing.create({
        data: {
          userId,
          listingId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save Listing Error:', error);
    return NextResponse.json({ error: 'Failed to save listing' }, { status: 500 });
  }
}

// DELETE unsave listing
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: listingId } = await params;
    const userId = (session.user as any).id;

    await prisma.savedListing.delete({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unsave Listing Error:', error);
    return NextResponse.json({ error: 'Failed to unsave listing' }, { status: 500 });
  }
}
