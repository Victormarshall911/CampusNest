import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';
import { Adapter } from 'next-auth/adapters';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'google-client-id-placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'google-client-secret-placeholder',
    }),
    CredentialsProvider({
      id: 'otp',
      name: 'OTP',
      credentials: {
        email: { label: 'Email', type: 'text' },
        code: { label: 'Verification Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) {
          throw new Error('Email and Verification Code are required');
        }

        // TEMPORARY: Existing console-OTP flow for development.
        // This will be replaced by Supabase OTP wiring in Phase 2.
        const tokenRecord = await prisma.verificationToken.findUnique({
          where: {
            token: credentials.code,
          },
        });

        if (!tokenRecord || tokenRecord.identifier !== credentials.email) {
          throw new Error('Invalid verification code');
        }

        if (tokenRecord.expires < new Date()) {
          await prisma.verificationToken.delete({ where: { token: credentials.code } }).catch(() => {});
          throw new Error('Verification code has expired');
        }

        // Delete the token after successful verification
        await prisma.verificationToken.delete({
          where: { token: credentials.code },
        }).catch(() => {});

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              verified: false,
              joinedDate: null,
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          verified: user.verified,
          universityId: user.universityId,
          joinedDate: user.joinedDate,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.verified = user.verified;
        token.universityId = user.universityId;
        token.avatarUrl = user.avatarUrl;
        token.joinedDate = user.joinedDate;
      }

      // Dynamic session updates (for role selection, joinedDate, and avatar changes)
      if (trigger === 'update' && session) {
        if (session.role) token.role = session.role;
        if (session.universityId !== undefined) token.universityId = session.universityId;
        if (session.avatarUrl) token.avatarUrl = session.avatarUrl;
        if (session.joinedDate) token.joinedDate = session.joinedDate;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.verified = token.verified;
        session.user.universityId = token.universityId;
        session.user.avatarUrl = token.avatarUrl;
        session.user.joinedDate = token.joinedDate;
      }
      return session;
    },
  },
};
