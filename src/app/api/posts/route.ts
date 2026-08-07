import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PostType } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      text,
      title,
      universityId,
      area,
      budget,
      rating,
      landlordName,
      images,
    } = body;

    if (!type || !text) {
      return NextResponse.json({ error: 'Missing post type or content' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Create the post inside Postgres
    const newPost = await prisma.post.create({
      data: {
        type: type === 'roommate-request' ? PostType.ROOMMATE_REQUEST : PostType.REVIEW,
        authorId: userId,
        text,
        title: title || null,
        universityId: universityId || null,
        area: area || null,
        budget: budget ? Number(budget) : null,
        rating: rating ? Number(rating) : null,
        landlordName: landlordName || null,
        images: images || [],
      },
    });

    return NextResponse.json({ success: true, id: newPost.id });
  } catch (error: any) {
    console.error('Create Post Error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
