import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const universitiesList = await prisma.university.findMany({
      select: {
        id: true,
        name: true,
        shortName: true,
      },
      orderBy: {
        shortName: 'asc',
      },
    });

    return NextResponse.json(universitiesList);
  } catch (error) {
    console.error('Fetch Universities API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 });
  }
}
