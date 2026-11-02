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

export interface ChatTransport {
  fetchConversations(): Promise<Conversation[]>;
  fetchMessages(conversationId: string): Promise<{ messages: Message[]; typingParticipantId: string | null }>;
  sendMessage(conversationId: string, text: string): Promise<Message>;
  markAsRead(conversationId: string): Promise<void>;
  start(onSync: () => void): void;
  stop(): void;
}

const POLLING_INTERVAL_MS = 30000; // 30s interim interval per Phase 1 requirements

/**
 * HTTP Polling transport implementation.
 * Respects document.visibilityState to halt network requests when backgrounded.
 * Will be swapped with Ably/Pusher push delivery in Phase 4.
 */
export class HttpPollingTransport implements ChatTransport {
  private timer: NodeJS.Timeout | null = null;
  private onSyncCallback: (() => void) | null = null;
  private isStarted = false;

  async fetchConversations(): Promise<Conversation[]> {
    const res = await fetch('/api/conversations');
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return res.json();
  }

  async fetchMessages(conversationId: string): Promise<{ messages: Message[]; typingParticipantId: string | null }> {
    const res = await fetch(`/api/conversations/${conversationId}/messages`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  }

  async sendMessage(conversationId: string, text: string): Promise<Message> {
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    const data = await res.json();
    return data.message;
  }

  async markAsRead(conversationId: string): Promise<void> {
    await fetch(`/api/conversations/${conversationId}/read`, {
      method: 'POST',
    }).catch(() => {});
  }

  private startTimer(): void {
    this.stopTimer();
    if (typeof window === 'undefined') return;

    this.timer = setInterval(async () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return; // Don't poll in background
      }
      this.onSyncCallback?.();
    }, POLLING_INTERVAL_MS);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  start(onSync: () => void): void {
    this.onSyncCallback = onSync;
    if (this.isStarted || typeof window === 'undefined') return;
    this.isStarted = true;

    // Listen to visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    this.startTimer();
  }

  stop(): void {
    this.stopTimer();
    this.isStarted = false;
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  private handleVisibilityChange = (): void => {
    if (typeof document === 'undefined') return;
    if (document.visibilityState === 'visible') {
      // Immediate sync upon returning to tab
      this.onSyncCallback?.();
      this.startTimer();
    } else {
      this.stopTimer();
    }
  };
}

// ── Store Implementation ───────────────────────────────────────────────────────
type Subscriber = () => void;
const subscribers = new Set<Subscriber>();

let conversationsCache: Conversation[] = [];
const messagesCacheMap: Record<string, Message[]> = {};
let activeConversationId: string | null = null;
let currentUserId: string | null = null;

// Active transport instance (pluggable for Phase 4 push delivery)
let transport: ChatTransport = new HttpPollingTransport();

export function setChatTransport(customTransport: ChatTransport): void {
  transport.stop();
  transport = customTransport;
  if (subscribers.size > 0) {
    transport.start(sync);
  }
}

const sync = async () => {
  try {
    const rooms = await transport.fetchConversations();
    conversationsCache = rooms;

    if (activeConversationId) {
      const data = await transport.fetchMessages(activeConversationId);
      messagesCacheMap[activeConversationId] = data.messages;

      const matchingConv = conversationsCache.find((c) => c.id === activeConversationId);
      if (matchingConv) {
        matchingConv.typingParticipantId = data.typingParticipantId;
      }
    }

    subscribers.forEach((cb) => cb());
  } catch (err) {
    console.error('Chat sync error:', err);
  }
};

export const mockChatStore = {
  subscribe(callback: Subscriber): () => void {
    subscribers.add(callback);
    if (subscribers.size === 1) {
      transport.start(sync);
      // Trigger initial fetch immediately
      sync();
    }
    return () => {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        transport.stop();
      }
    };
  },

  notify(): void {
    subscribers.forEach((cb) => cb());
  },

  setActiveConversation(id: string | null): void {
    activeConversationId = id;
    if (id) {
      // Optimistically update message statuses to read locally
      const messages = messagesCacheMap[id] || [];
      messages.forEach((m) => {
        if (m.senderId !== currentUserId) m.status = 'read';
      });
      this.notify();

      // Trigger explicit POST /read endpoint
      transport.markAsRead(id);
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
      const persistedMsg = await transport.sendMessage(conversationId, text);
      const updatedMsgs = messagesCacheMap[conversationId] || [];
      messagesCacheMap[conversationId] = updatedMsgs.map((m) =>
        m.id === tempId ? persistedMsg : m
      );
      this.notify();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  },
};
