import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    // Generate 6-digit numeric verification code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 minutes

    // Store/Upsert verification token in DB
    await prisma.verificationToken.upsert({
      where: { token: otpCode },
      update: {
        identifier: email,
        expires,
      },
      create: {
        identifier: email,
        token: otpCode,
        expires,
      },
    }).catch(async () => {
      // If code collided, delete any existing token and create new one
      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      });
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: otpCode,
          expires,
        },
      });
    });

    // ── DEV OTP LOGGING ──
    console.log('\n==========================================');
    console.log(`[CAMPUSNEST OTP DEV LOG]`);
    console.log(`Email: ${email}`);
    console.log(`Your 6-digit OTP code is: ${otpCode}`);
    console.log('==========================================\n');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('OTP Send Error:', error);
    return NextResponse.json({ error: 'Failed to generate verification code' }, { status: 500 });
  }
}
