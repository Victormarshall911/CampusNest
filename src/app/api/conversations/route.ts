import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all conversations for authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Fetch conversations where current user is participantA or participantB
    const dbConversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participantAId: userId },
          { participantBId: userId },
        ],
      },
      include: {
        participantA: true,
        participantB: true,
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    // Map to Conversation shape with eagerly loaded otherUser info
    const mapped = dbConversations.map((c) => {
      const otherUser = c.participantAId === userId ? c.participantB : c.participantA;
      const lastMsg = c.messages[c.messages.length - 1];

      return {
        id: c.id,
        participantIds: [c.participantAId, c.participantBId],
        listingId: c.listingId || undefined,
        lastMessageAt: c.lastMessageAt.toISOString(),
        typingParticipantId: null, // default runtime status
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          avatar: otherUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
          role: otherUser.role.toLowerCase(),
          isVerified: otherUser.verified,
        },
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Fetch Conversations Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve conversations' }, { status: 500 });
  }
}

// POST get or create conversation
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipientId, listingId } = body;

    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Determine participant A and B to ensure deterministic unique index constraints
    const [pA, pB] = [userId, recipientId].sort();

    // Query or Create
    const conversation = await prisma.conversation.upsert({
      where: {
        participantAId_participantBId_listingId: {
          participantAId: pA,
          participantBId: pB,
          listingId: listingId || null,
        },
      },
      update: {},
      create: {
        participantAId: pA,
        participantBId: pB,
        listingId: listingId || null,
        lastMessageAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, conversationId: conversation.id });
  } catch (error: any) {
    console.error('Get/Create Conversation Error:', error);
    return NextResponse.json({ error: 'Failed to access conversation' }, { status: 500 });
  }
}
