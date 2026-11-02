import assert from 'node:assert';
import { authOptions } from '../src/lib/auth';
import { validateEnv } from '../src/lib/env';
import {
  mockChatStore,
  setChatTransport,
  ChatTransport,
  Conversation,
  Message,
} from '../src/lib/mockChatStore';

async function runTests() {
  console.log('🧪 Starting Phase 1 Stabilize Unit Tests (with Mocks)...\n');
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => void | Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     ${err.message}`);
      failed++;
    }
  }

  // ── TEST SUITE 1: Auth Session & JWT Persistence ────────────────────────────
  await test('jwt callback persists joinedDate and avatarUrl on initial sign-in', async () => {
    const jwtCallback = authOptions.callbacks?.jwt;
    assert(jwtCallback, 'jwt callback must be defined in authOptions');

    const initialUser: any = {
      id: 'usr-123',
      name: 'Chioma Test',
      email: 'chioma@example.com',
      role: 'STUDENT',
      verified: true,
      universityId: 'unilag',
      joinedDate: 'August 2026',
      avatarUrl: 'https://images.example.com/avatar.jpg',
    };

    const token = await (jwtCallback as any)({
      token: {},
      user: initialUser,
      account: null,
    });

    assert.strictEqual(token.id, 'usr-123');
    assert.strictEqual(token.joinedDate, 'August 2026');
    assert.strictEqual(token.avatarUrl, 'https://images.example.com/avatar.jpg');
    assert.strictEqual(token.role, 'STUDENT');
  });

  await test('jwt callback updates joinedDate, role, and avatar on trigger update', async () => {
    const jwtCallback = authOptions.callbacks?.jwt;
    assert(jwtCallback);

    const existingToken: any = {
      id: 'usr-123',
      role: 'STUDENT',
      joinedDate: null,
      avatarUrl: null,
    };

    const updatedToken = await (jwtCallback as any)({
      token: existingToken,
      trigger: 'update',
      session: {
        role: 'LANDLORD',
        joinedDate: 'November 2026',
        avatarUrl: 'https://cloudinary.com/new.jpg',
      },
    });

    assert.strictEqual(updatedToken.role, 'LANDLORD');
    assert.strictEqual(updatedToken.joinedDate, 'November 2026');
    assert.strictEqual(updatedToken.avatarUrl, 'https://cloudinary.com/new.jpg');
  });

  await test('session callback exposes joinedDate and avatarUrl on session.user', async () => {
    const sessionCallback = authOptions.callbacks?.session;
    assert(sessionCallback, 'session callback must be defined');

    const token: any = {
      id: 'usr-456',
      role: 'STUDENT',
      verified: false,
      universityId: 'unilag',
      joinedDate: 'September 2026',
      avatarUrl: 'https://images.example.com/photo.png',
    };

    const sessionObj: any = {
      user: { name: 'Femi', email: 'femi@example.com' },
      expires: '2026-12-01',
    };

    const resultSession: any = await (sessionCallback as any)({
      session: sessionObj,
      token,
      user: {},
      newSession: null,
      trigger: 'update',
    });

    assert(resultSession.user, 'session.user must exist');
    assert.strictEqual(resultSession.user.id, 'usr-456');
    assert.strictEqual(resultSession.user.joinedDate, 'September 2026');
    assert.strictEqual(resultSession.user.avatarUrl, 'https://images.example.com/photo.png');
    assert.strictEqual(resultSession.user.role, 'STUDENT');
  });

  // ── TEST SUITE 2: Env Validation Fallbacks ───────────────────────────────────
  await test('validateEnv() bypasses fail-fast during NODE_ENV=test', () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = 'test';
    try {
      const config = validateEnv();
      assert(config.DATABASE_URL, 'DATABASE_URL mock returned in test environment');
    } finally {
      (process.env as any).NODE_ENV = originalEnv;
    }
  });

  await test('validateEnv() bypasses fail-fast when SKIP_ENV_VALIDATION=true in dev', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSkip = process.env.SKIP_ENV_VALIDATION;
    (process.env as any).NODE_ENV = 'development';
    process.env.SKIP_ENV_VALIDATION = 'true';
    try {
      const config = validateEnv();
      assert(config, 'Config returned without throwing');
    } finally {
      (process.env as any).NODE_ENV = originalEnv;
      process.env.SKIP_ENV_VALIDATION = originalSkip;
    }
  });

  // ── TEST SUITE 3: Chat Transport Abstraction & Explicit Read Call ────────────
  await test('mockChatStore delegates to mock ChatTransport and calls markAsRead on active chat', async () => {
    let markAsReadCalledWith: string | null = null;
    let fetchConversationsCalled = false;

    const mockTransport: ChatTransport = {
      async fetchConversations(): Promise<Conversation[]> {
        fetchConversationsCalled = true;
        return [
          {
            id: 'conv-1',
            participantIds: ['u1', 'u2'],
            lastMessageAt: new Date().toISOString(),
            typingParticipantId: null,
            otherUser: {
              id: 'u2',
              name: 'Host John',
              avatar: '',
              role: 'landlord',
              isVerified: true,
            },
          },
        ];
      },
      async fetchMessages(): Promise<{ messages: Message[]; typingParticipantId: string | null }> {
        return { messages: [], typingParticipantId: null };
      },
      async sendMessage(conversationId: string, text: string): Promise<Message> {
        return {
          id: 'msg-1',
          conversationId,
          senderId: 'u1',
          text,
          timestamp: new Date().toISOString(),
          status: 'sent',
        };
      },
      async markAsRead(conversationId: string): Promise<void> {
        markAsReadCalledWith = conversationId;
      },
      start(onSync) {
        onSync();
      },
      stop() {},
    };

    setChatTransport(mockTransport);

    const unsub = mockChatStore.subscribe(() => {});
    assert.strictEqual(fetchConversationsCalled, true, 'fetchConversations called upon subscription');

    mockChatStore.setActiveConversation('conv-1');
    assert.strictEqual(markAsReadCalledWith, 'conv-1', 'markAsRead explicitly called for active conversation');

    unsub();
  });

  // ── SUMMARY REPORT ─────────────────────────────────────────────────────────
  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
