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

        // Find active verification token in DB
        const tokenRecord = await prisma.verificationToken.findUnique({
          where: {
            token: credentials.code,
          },
        });

        if (!tokenRecord || tokenRecord.identifier !== credentials.email) {
          throw new Error('Invalid verification code');
        }

        if (tokenRecord.expires < new Date()) {
          // Clean up expired token
          await prisma.verificationToken.delete({ where: { token: credentials.code } }).catch(() => {});
          throw new Error('Verification code has expired');
        }

        // Delete/expire the token after successful verification
        await prisma.verificationToken.delete({
          where: { token: credentials.code },
        }).catch(() => {});

        // Find or create the user in the database
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          // Create new user (role will be set during role-selection step)
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              verified: false,
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
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as any;
        token.id = u.id;
        token.role = u.role;
        token.verified = u.verified;
        token.universityId = u.universityId;
      }
      
      // Support dynamic session updates (for role selection page redirect)
      if (trigger === 'update' && session) {
        token.role = session.role;
        token.universityId = session.universityId;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as any;
        u.id = token.id;
        u.role = token.role;
        u.verified = token.verified;
        u.universityId = token.universityId;
      }
      return session;
    },
  },
};
