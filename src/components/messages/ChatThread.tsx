'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, BadgeCheck, Check, CheckCheck, MapPin } from 'lucide-react';
import { timeAgo, formatNaira, cn } from '@/lib/utils';
import { mockFeed, type ListingPost } from '@/data/mockData';
import { mockChatStore, type Message } from '@/lib/mockChatStore';
import Avatar from '@/components/ui/Avatar';

interface ChatThreadProps {
  conversationId: string;
  messages: Message[];
  currentUserId: string;
  isTyping: boolean;
}

export default function ChatThread({
  conversationId,
  messages,
  currentUserId,
  isTyping,
}: ChatThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mark all as read when thread is open and visible
  useEffect(() => {
    mockChatStore.setActiveConversation(conversationId);
    return () => {
      mockChatStore.setActiveConversation(null);
    };
  }, [conversationId, messages]);

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll to bottom on mount (long thread support)
  useEffect(() => {
    scrollToBottom('auto');
    const timer = setTimeout(() => scrollToBottom('auto'), 80);
    return () => clearTimeout(timer);
  }, [conversationId]);

  // Scroll smoothly when messages list updates or typing state changes
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages.length, isTyping]);

  // Find the other participant in the conversation
  const conv = mockChatStore.getConversations().find((c) => c.id === conversationId);
  const otherUser = conv?.otherUser;

  // Find listing details if linked
  let listing: ListingPost | undefined;
  if (conv?.listingId) {
    listing = mockFeed.find(
      (p): p is ListingPost => p.type === 'listing' && p.id === conv.listingId
    );
  }

  if (!otherUser) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
        <p className="text-xs text-text-tertiary">Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      {/* Thread Header */}
      <div className="glass-nav border-b border-[var(--border-light)] px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Back button */}
          <Link
            href="/messages"
            className="p-1 rounded-full hover:bg-surface-secondary text-text-secondary transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          {/* Participant details linking to profile */}
          <Link href={`/profile/${otherUser.id}`} className="flex items-center gap-2.5 group cursor-pointer">
            <Avatar src={otherUser.avatar} alt={otherUser.name} size="sm" />
            <div>
              <span className="text-xs font-black text-text-primary group-hover:text-cn-purple transition-colors flex items-center gap-1">
                {otherUser.name}
                {otherUser.isVerified && (
                  <BadgeCheck className="w-3.5 h-3.5 text-cn-blue fill-white shrink-0" />
                )}
              </span>
              <span className="text-[9px] text-text-tertiary font-medium block leading-none mt-0.5">
                {otherUser.role === 'landlord' ? 'Landlord' : 'Student'}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Listing Link persistent top chip banner */}
      {listing && (
        <div className="px-4 py-2 border-b border-[var(--border-light)] bg-surface-secondary/20 sticky top-[53px] z-20">
          <Link
            href={`/listing/${listing.id}`}
            className="flex items-center justify-between gap-3 p-1.5 rounded-xl glass-solid border border-[var(--border-light)] hover:border-cn-purple/30 transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-8 rounded-lg overflow-hidden shrink-0">
                <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] font-bold text-text-primary truncate">{listing.title}</h4>
                <div className="flex items-center gap-0.5 text-[8px] text-text-tertiary">
                  <MapPin className="w-2 h-2" />
                  <span>{listing.area}</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-cn-purple bg-cn-purple/10 px-2 py-1 rounded-lg shrink-0">
              {formatNaira(listing.price / 1000)}k{listing.priceLabel.replace('/year', '/yr')}
            </span>
          </Link>
        </div>
      )}

      {/* Chat scroll content area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const isMe = m.senderId === currentUserId;

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                className={cn('flex flex-col max-w-[80%]', isMe ? 'ml-auto items-end' : 'mr-auto items-start')}
              >
                {/* Chat bubble body */}
                <div
                  className={cn(
                    'px-3.5 py-2 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm break-words max-w-full',
                    isMe
                      ? 'gradient-bg text-white rounded-tr-sm'
                      : 'glass-solid text-text-primary rounded-tl-sm border border-[var(--border-light)]'
                  )}
                >
                  {m.text}
                </div>

                {/* Sub-label details row (date & read receipt checkmarks) */}
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[8px] text-text-tertiary font-medium">
                    {timeAgo(m.timestamp)}
                  </span>

                  {isMe && (
                    <span className="shrink-0 flex items-center justify-center">
                      {m.status === 'sent' && (
                        <Check className="w-2.5 h-2.5 text-text-tertiary/75" />
                      )}
                      {m.status === 'delivered' && (
                        <CheckCheck className="w-2.5 h-2.5 text-text-tertiary/75" />
                      )}
                      {m.status === 'read' && (
                        <CheckCheck className="w-2.5 h-2.5 text-cn-purple fill-current" />
                      )}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Typing indicator bounce dot bubble */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mr-auto items-start"
            >
              <div className="flex items-center gap-1 px-3.5 py-2.5 rounded-2xl glass-solid border border-[var(--border-light)] w-fit rounded-tl-sm shadow-sm">
                <div className="flex gap-1.5 items-center justify-center py-0.5">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <motion.div
                      key={idx}
                      className="w-1.5 h-1.5 rounded-full bg-text-tertiary"
                      animate={{
                        y: [0, -3.5, 0],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: idx * 0.15,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
