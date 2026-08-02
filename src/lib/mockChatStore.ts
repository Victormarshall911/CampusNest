import { mockUsers } from '@/data/mockData';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  participantIds: [string, string]; // [StudentId, LandlordId]
  listingId?: string; // Links to a listing if started from "Chat Landlord"
  lastMessageAt: string;
  typingParticipantId: string | null; // ID of participant currently typing
}

type Subscriber = () => void;
const subscribers = new Set<Subscriber>();

// Initial seed data
const initialConversations: Conversation[] = [
  {
    id: 'c1',
    participantIds: ['s1', 'l1'],
    listingId: 'listing-1',
    lastMessageAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    typingParticipantId: null,
  },
  {
    id: 'c2',
    participantIds: ['s1', 'l2'],
    listingId: 'listing-2',
    lastMessageAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    typingParticipantId: null,
  },
];

const initialMessages: Message[] = [
  // Conversation c1
  {
    id: 'm1',
    conversationId: 'c1',
    senderId: 's1',
    text: 'Hello Chief Adebayo, is the room at Yaba still available?',
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    status: 'read',
  },
  {
    id: 'm2',
    conversationId: 'c1',
    senderId: 'l1',
    text: 'Yes Chioma, the Self-Contain is still available. When would you like to inspect it?',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'read',
  },
  // Conversation c2
  {
    id: 'm3',
    conversationId: 'c2',
    senderId: 's1',
    text: 'Good day Mrs. Okonkwo, I saw your listing near UI.',
    timestamp: new Date(Date.now() - 3600000 * 25).toISOString(),
    status: 'read',
  },
  {
    id: 'm4',
    conversationId: 'c2',
    senderId: 'l2',
    text: 'Hello! Yes, that flat is highly sought after. We can schedule a tour tomorrow.',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'read',
  },
];

// In-Memory store arrays
const conversations: Conversation[] = [...initialConversations];
const messages: Message[] = [...initialMessages];

// Pools of simulated response quotes
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

// Track current active conversation ID to auto-read incoming messages
let activeConversationId: string | null = null;

export const mockChatStore = {
  subscribe(callback: Subscriber): () => void {
    subscribers.add(callback);
    return () => {
      subscribers.delete(callback);
    };
  },

  notify(): void {
    subscribers.forEach((cb) => cb());
  },

  setActiveConversation(id: string | null): void {
    activeConversationId = id;
    if (id) {
      this.markAllAsRead(id);
    }
  },

  getConversations(): Conversation[] {
    return conversations.sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  },

  getMessages(conversationId: string): Message[] {
    return messages.filter((m) => m.conversationId === conversationId);
  },

  getUnreadCount(userId: string): number {
    // Find conversations where the last message was NOT sent by userId and is NOT status 'read'
    let count = 0;
    conversations.forEach((c) => {
      const convMessages = this.getMessages(c.id);
      if (convMessages.length === 0) return;
      const last = convMessages[convMessages.length - 1];
      if (last.senderId !== userId && last.status !== 'read') {
        count++;
      }
    });
    return count;
  },

  markAllAsRead(conversationId: string): void {
    let changed = false;
    messages.forEach((m) => {
      if (m.conversationId === conversationId && m.status !== 'read') {
        m.status = 'read';
        changed = true;
      }
    });
    if (changed) {
      this.notify();
    }
  },

  getOrCreateConversation(userIdA: string, userIdB: string, listingId?: string): string {
    const existing = conversations.find(
      (c) =>
        c.participantIds.includes(userIdA) &&
        c.participantIds.includes(userIdB) &&
        (!listingId || c.listingId === listingId)
    );

    if (existing) return existing.id;

    const newId = `conv-${Date.now()}`;
    conversations.push({
      id: newId,
      participantIds: [userIdA, userIdB],
      listingId,
      lastMessageAt: new Date().toISOString(),
      typingParticipantId: null,
    });
    this.notify();
    return newId;
  },

  sendMessage(conversationId: string, senderId: string, text: string): void {
    const newMsgId = `msg-${Date.now()}`;
    const newMsg: Message = {
      id: newMsgId,
      conversationId,
      senderId,
      text,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    messages.push(newMsg);

    // Update conversation last message timestamp
    const conv = conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessageAt = newMsg.timestamp;
    }

    this.notify();

    // ── PROGRESSIVE RECEIPT ANIMATION TIMEOUTS ──
    // Step 1: Sent -> Delivered (400ms)
    setTimeout(() => {
      const msg = messages.find((m) => m.id === newMsgId);
      if (msg && msg.status === 'sent') {
        msg.status = 'delivered';
        this.notify();

        // Step 2: Delivered -> Read (800ms total, if recipient has this thread open)
        setTimeout(() => {
          const finalMsg = messages.find((m) => m.id === newMsgId);
          if (finalMsg && finalMsg.status === 'delivered') {
            const currentConv = conversations.find((c) => c.id === conversationId);
            const isTargetActive = activeConversationId === conversationId;
            if (isTargetActive || currentConv?.participantIds.includes(senderId)) {
              finalMsg.status = 'read';
              this.notify();
            }
          }
        }, 400);
      }
    }, 400);

    // ── SIMULATED BOT REPLY TIMEOUT ──
    if (conv) {
      const recipientId = conv.participantIds.find((id) => id !== senderId);
      if (!recipientId) return;

      const recipientUser = mockUsers.find((u) => u.id === recipientId);
      const isLandlordReply = recipientUser?.role === 'landlord';

      const delay = 1500 + Math.random() * 2000; // 1.5s to 3.5s delay

      // Trigger typing indicator shortly after delivery (e.g., 600ms)
      setTimeout(() => {
        conv.typingParticipantId = recipientId;
        this.notify();
      }, 600);

      // Trigger message delivery
      setTimeout(() => {
        // Turn off typing indicator
        conv.typingParticipantId = null;

        // Choose random, varied response from pool
        const pool = isLandlordReply ? landlordReplies : studentReplies;
        const randomText = pool[Math.floor(Math.random() * pool.length)];

        const replyMsgId = `msg-reply-${Date.now()}`;
        const replyMsg: Message = {
          id: replyMsgId,
          conversationId,
          senderId: recipientId,
          text: randomText,
          timestamp: new Date().toISOString(),
          // If the user has this conversation active, the bot message reads instantly
          status: activeConversationId === conversationId ? 'read' : 'delivered',
        };

        messages.push(replyMsg);
        conv.lastMessageAt = replyMsg.timestamp;
        this.notify();
      }, delay);
    }
  },
};
