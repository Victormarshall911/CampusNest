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

    const { id } = await params;
    const userId = (session.user as any).id;

    if (id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, bio, universityId } = body;

    // Update user profile in Postgres
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        bio: bio !== undefined ? bio : undefined,
        universityId: universityId || undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update User Error:', error);
    return NextResponse.json({ error: 'Failed to update profile settings' }, { status: 500 });
  }
}
