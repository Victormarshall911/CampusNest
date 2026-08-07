import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const body = await request.json();
    const { rating, comment, verifiedTenant } = body;

    if (!rating || !comment) {
      return NextResponse.json({ error: 'Rating and comment are required' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Create review inside PostgreSQL
    await prisma.review.create({
      data: {
        listingId,
        authorId: userId,
        rating: Number(rating),
        comment,
        verifiedTenant: verifiedTenant || false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Create Review Error:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
