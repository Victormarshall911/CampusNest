import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MessageStatus } from '@prisma/client';

const landlordReplies = [
  'Yes, the lodge is available for physical tours this Saturday morning. Let me know if that works for you.',
  'The prepaid meter is shared by only 2 rooms, and running water is pumped daily. You will love the setup!',
  'I usually prefer quiet, serious students who maintain cleanliness. The compound is peaceful and secure.',
  'We have a backup generator that runs from 7 PM to 11 PM daily if there is a grid failure. No light issues here.',
  'The price is slightly negotiable if you are paying for 2 years upfront. What budget are you working with?',
  'Security is 10/10. We have gate locks and a resident security guard. Let me know when you want to book.',
];

const studentReplies = [
  'Hey! I am interested in co-renting or sharing a flat. Are you comfortable with quiet hours during exam seasons?',
  'Is the running water supply stable during the dry season, or does it require tankers?',
  'I am a 300 Level student, very clean, and I do not throw large parties. Let me know when we can inspect.',
  'Sounds perfect to me. Do you have a copy of the tenancy rules or house rules?',
  'Awesome, thank you! I will get back to you by tomorrow after talking to my sponsor.',
];

// GET messages list
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const userId = (session.user as any).id;

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || (conversation.participantAId !== userId && conversation.participantBId !== userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Auto-update received messages to READ
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        status: { not: MessageStatus.READ },
      },
      data: {
        status: MessageStatus.READ,
      },
    });

    // Fetch latest messages
    const dbMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    const mapped = dbMessages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      text: m.text,
      timestamp: m.createdAt.toISOString(),
      status: m.status.toLowerCase(),
    }));

    return NextResponse.json({
      messages: mapped,
      typingParticipantId: conversation.typingParticipantId,
    });
  } catch (error) {
    console.error('Fetch Messages Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve messages' }, { status: 500 });
  }
}

// POST send message
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
    const userId = (session.user as any).id;
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Message content is empty' }, { status: 400 });
    }

    // Verify conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participantA: true,
        participantB: true,
      },
    });

    if (!conversation || (conversation.participantAId !== userId && conversation.participantBId !== userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Create message row
    const newMsg = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        text: text.trim(),
        status: MessageStatus.SENT,
      },
    });

    // 2. Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // ── PROGRESSIVE DELIVERY RECEIPT ACTIONS ──
    setTimeout(async () => {
      await prisma.message.update({
        where: { id: newMsg.id },
        data: { status: MessageStatus.DELIVERED },
      }).catch(() => {});

      // Read status trigger after additional 400ms
      setTimeout(async () => {
        await prisma.message.update({
          where: { id: newMsg.id },
          data: { status: MessageStatus.READ },
        }).catch(() => {});
      }, 400);
    }, 400);

    // ── BOT REPLY ENGINE SIMULATION ──
    const recipientId = conversation.participantAId === userId
      ? conversation.participantBId
      : conversation.participantAId;
    
    const recipientUser = conversation.participantAId === userId
      ? conversation.participantB
      : conversation.participantA;

    const isLandlordReply = recipientUser.role === 'LANDLORD';
    const delay = 1500 + Math.random() * 2000;

    // Trigger typing state after 600ms
    setTimeout(async () => {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { typingParticipantId: recipientId },
      }).catch(() => {});
    }, 600);

    // Trigger bot reply payload after delay
    setTimeout(async () => {
      const pool = isLandlordReply ? landlordReplies : studentReplies;
      const botText = pool[Math.floor(Math.random() * pool.length)];

      await prisma.$transaction([
        // Add bot message
        prisma.message.create({
          data: {
            conversationId,
            senderId: recipientId,
            text: botText,
            status: MessageStatus.READ, // Read instantly since user has it active
          },
        }),
        // Reset typing indicator and update conversation timestamp
        prisma.conversation.update({
          where: { id: conversationId },
          data: {
            typingParticipantId: null,
            lastMessageAt: new Date(),
          },
        }),
      ]).catch((err) => {
        console.error('Bot Reply Transaction failed:', err);
      });
    }, delay);

    return NextResponse.json({
      success: true,
      message: {
        id: newMsg.id,
        conversationId: newMsg.conversationId,
        senderId: newMsg.senderId,
        text: newMsg.text,
        timestamp: newMsg.createdAt.toISOString(),
        status: 'sent',
      },
    });
  } catch (error) {
    console.error('Send Message Error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
