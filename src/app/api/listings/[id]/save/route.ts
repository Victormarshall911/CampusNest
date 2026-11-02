import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST save listing (idempotent upsert)
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
    const userId = session.user.id;

    // Idempotent upsert by compound key
    await prisma.savedListing.upsert({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
      create: {
        userId,
        listingId,
      },
      update: {},
    });

    return NextResponse.json({ success: true, saved: true });
  } catch (error: any) {
    console.error('Save Listing Error:', error);
    return NextResponse.json({ error: 'Failed to save listing' }, { status: 500 });
  }
}

// DELETE unsave listing (idempotent deleteMany)
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
    const userId = session.user.id;

    // Idempotent delete (succeeds whether or not row exists)
    await prisma.savedListing.deleteMany({
      where: {
        userId,
        listingId,
      },
    });

    return NextResponse.json({ success: true, saved: false });
  } catch (error: any) {
    console.error('Unsave Listing Error:', error);
    return NextResponse.json({ error: 'Failed to unsave listing' }, { status: 500 });
  }
}
