'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { mockChatStore, type Message, type Conversation } from '@/lib/mockChatStore';
import ChatThread from '@/components/messages/ChatThread';
import MessageInput from '@/components/messages/MessageInput';

// Skeleton Loader
function ChatSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-[var(--background)]">
      {/* Header Skeleton */}
      <div className="px-4 py-3 border-b border-[var(--border-light)] flex items-center gap-3 animate-pulse">
        <div className="w-8 h-8 rounded-full bg-surface-secondary" />
        <div className="space-y-1">
          <div className="h-3 bg-surface-secondary rounded w-24" />
          <div className="h-2 bg-surface-secondary rounded w-16" />
        </div>
      </div>
      {/* Messages Skeleton */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="flex flex-col gap-1 items-start max-w-[70%] animate-pulse">
          <div className="h-9 bg-surface-secondary rounded-2xl rounded-tl-sm w-44" />
          <div className="h-2 bg-surface-secondary rounded w-10 ml-1" />
        </div>
        <div className="flex flex-col gap-1 items-end max-w-[70%] ml-auto animate-pulse">
          <div className="h-9 bg-surface-secondary rounded-2xl rounded-tr-sm w-56" />
          <div className="h-2 bg-surface-secondary rounded w-10 mr-1" />
        </div>
        <div className="flex flex-col gap-1 items-start max-w-[70%] animate-pulse">
          <div className="h-9 bg-surface-secondary rounded-2xl rounded-tl-sm w-36" />
          <div className="h-2 bg-surface-secondary rounded w-10 ml-1" />
        </div>
      </div>
    </div>
  );
}

// Conversation Not Found Error
function ConversationNotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[var(--background)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-sm space-y-6"
      >
        <div className="w-20 h-20 rounded-2xl glass-solid border border-cn-coral/20 flex items-center justify-center mx-auto text-cn-coral">
          <MessageSquare className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2
            className="text-xl font-extrabold text-text-primary"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Chat Not Found
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            This chat thread does not exist, or you do not have permission to access it.
          </p>
        </div>
        <Link
          href="/messages"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white gradient-bg font-semibold shadow-lg shadow-cn-purple/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Messages
        </Link>
      </motion.div>
    </main>
  );
}

// Inner page component that safely reads useSearchParams
function ChatRoomInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const id = params.id as string;
  const listingId = searchParams.get('listingId') || undefined;

  const currentUserId = (session?.user as any)?.id;

  const [conversation, setConversation] = useState<Conversation | null | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);

  // Fetch conversations and check if active ID matches an existing room
  useEffect(() => {
    if (status === 'loading' || !currentUserId) return;

    const findOrCreateRoom = async () => {
      try {
        const res = await fetch('/api/conversations');
        if (res.ok) {
          const rooms: Conversation[] = await res.json();
          const activeRoom = rooms.find((r) => r.id === id);

          if (activeRoom) {
            setConversation(activeRoom);
            mockChatStore.setActiveConversation(activeRoom.id);
          } else {
            // It could be a User ID path: call POST to api/conversations to check/upsert room
            const upsertRes = await fetch('/api/conversations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ recipientId: id, listingId }),
            });
            if (upsertRes.ok) {
              const upsertData = await upsertRes.json();
              router.replace(`/messages/${upsertData.conversationId}`);
            } else {
              setConversation(null);
            }
          }
        } else {
          setConversation(null);
        }
      } catch (err) {
        console.error(err);
        setConversation(null);
      }
    };

    findOrCreateRoom();
  }, [id, currentUserId, status, listingId, router]);

  // Subscribe to updates when conversation is loaded
  useEffect(() => {
    if (!conversation) return;

    const unsubscribe = mockChatStore.subscribe(() => {
      const activeConv = mockChatStore.getConversations().find((c) => c.id === conversation.id);
      if (activeConv) {
        setConversation(activeConv);
        setMessages(mockChatStore.getMessages(activeConv.id));
      }
    });

    return unsubscribe;
  }, [conversation]);

  if (status === 'loading' || conversation === undefined) return <ChatSkeleton />;
  if (conversation === null) {
    return <ConversationNotFound />;
  }

  const handleSendMessage = (text: string) => {
    if (currentUserId) {
      mockChatStore.sendMessage(conversation.id, currentUserId, text);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] pb-20 flex flex-col justify-between max-w-xl mx-auto border-x border-[var(--border-light)]">
      {/* Scrollable Chat Message Area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <ChatThread
          conversationId={conversation.id}
          messages={messages}
          currentUserId={currentUserId}
          isTyping={conversation.typingParticipantId !== null}
        />
      </div>

      {/* Sticky Bottom Message Input box */}
      <MessageInput onSend={handleSendMessage} />
    </main>
  );
}

// Main page component wrapped in Suspense for Next.js useSearchParams compliance
export default function ChatRoomPage() {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatRoomInner />
    </Suspense>
  );
}
