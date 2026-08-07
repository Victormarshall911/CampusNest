import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, universityId } = await request.json();

    if (!role || !['STUDENT', 'LANDLORD'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role selection' }, { status: 400 });
    }

    // Format current date, e.g. "August 2026"
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    const joinedDate = `${months[now.getMonth()]} ${now.getFullYear()}`;

    // Update user profile in PostgreSQL
    const userId = (session.user as any).id;
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: role as Role,
        universityId: role === 'STUDENT' ? universityId || null : null,
        joinedDate,
        bio: role === 'STUDENT' ? 'Student seeking accommodation.' : 'Host managing property listings.',
        // Give a landlord a default response time
        responseTime: role === 'LANDLORD' ? 'Usually responds within 1hr' : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Role Selection API Error:', error);
    return NextResponse.json({ error: 'Failed to update profile settings' }, { status: 500 });
  }
}
