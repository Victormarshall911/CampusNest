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
  participantIds: [string, string];
  listingId?: string;
  lastMessageAt: string;
  typingParticipantId: string | null;
  otherUser?: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    isVerified: boolean;
  };
}

type Subscriber = () => void;
const subscribers = new Set<Subscriber>();

let conversationsCache: Conversation[] = [];
let messagesCacheMap: Record<string, Message[]> = {};
let activeConversationId: string | null = null;
let currentUserId: string | null = null;
let pollingInterval: any = null;

// 🚨 TODO: HIGH-PRIORITY (PHASE 9)
// This client-side polling mechanism is a temporary stopgap to simulate database-backed sync.
// It polling `/api/conversations` every 1.2s will cause high database loads under concurrent traffic.
// Remove this polling loop entirely in Phase 9 and replace it with push delivery (e.g. Socket.io, WebSockets, or SSE).
const startPolling = () => {
  if (typeof window === 'undefined' || pollingInterval) return;

  const poll = async () => {
    try {
      // 1. Fetch conversations from Postgres API
      const convRes = await fetch('/api/conversations');
      if (convRes.ok) {
        const rooms = await convRes.json();
        conversationsCache = rooms;
      }

      // 2. Fetch messages for active conversation if one is open
      if (activeConversationId) {
        const msgRes = await fetch(`/api/conversations/${activeConversationId}/messages`);
        if (msgRes.ok) {
          const data = await msgRes.json();
          messagesCacheMap[activeConversationId] = data.messages;
          
          // Sync transient typing indicator state
          const matchingConv = conversationsCache.find((c) => c.id === activeConversationId);
          if (matchingConv) {
            matchingConv.typingParticipantId = data.typingParticipantId;
          }
        }
      }

      // 3. Notify all reactive subscribers
      subscribers.forEach((cb) => cb());
    } catch (err) {
      console.error('Chat polling error:', err);
    }
  };

  poll();
  pollingInterval = setInterval(poll, 1200);
};

export const mockChatStore = {
  subscribe(callback: Subscriber): () => void {
    subscribers.add(callback);
    startPolling();
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
      // Optimistically update status to read locally
      const messages = messagesCacheMap[id] || [];
      messages.forEach((m) => {
        if (m.senderId !== currentUserId) m.status = 'read';
      });
      this.notify();
      
      // Hit GET messages endpoint to trigger read receipts on database row
      fetch(`/api/conversations/${id}/messages`).catch(() => {});
    }
  },

  getConversations(): Conversation[] {
    return conversationsCache;
  },

  getMessages(conversationId: string): Message[] {
    return messagesCacheMap[conversationId] || [];
  },

  getUnreadCount(userId: string): number {
    currentUserId = userId;
    let count = 0;
    // Check unread status from latest messages in conversation lists
    conversationsCache.forEach((c) => {
      const msgs = messagesCacheMap[c.id];
      if (msgs && msgs.length > 0) {
        const last = msgs[msgs.length - 1];
        if (last.senderId !== userId && last.status !== 'read') {
          count++;
        }
      }
    });
    return count;
  },

  async sendMessage(conversationId: string, senderId: string, text: string): Promise<void> {
    currentUserId = senderId;
    
    // 1. Optimistic local append for fast typing responsiveness
    const tempId = `temp-${Date.now()}`;
    const newMsg: Message = {
      id: tempId,
      conversationId,
      senderId,
      text,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    const currentMsgs = messagesCacheMap[conversationId] || [];
    messagesCacheMap[conversationId] = [...currentMsgs, newMsg];
    this.notify();

    try {
      // 2. Persist message in PostgreSQL DB
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();
        // Swap optimistic message with official DB record mapping
        const updatedMsgs = messagesCacheMap[conversationId] || [];
        messagesCacheMap[conversationId] = updatedMsgs.map((m) =>
          m.id === tempId ? data.message : m
        );
        this.notify();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  },
};
