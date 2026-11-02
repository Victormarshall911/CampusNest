import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MessageStatus } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const userId = session.user.id;

    // Verify participant membership
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { participantAId: true, participantBId: true },
    });

    if (!conversation || (conversation.participantAId !== userId && conversation.participantBId !== userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Explicitly update unread received messages to READ
    const result = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        status: { not: MessageStatus.READ },
      },
      data: {
        status: MessageStatus.READ,
      },
    });

    return NextResponse.json({ success: true, updatedCount: result.count });
  } catch (error: any) {
    console.error('Mark Read Error:', error);
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
  }
}
