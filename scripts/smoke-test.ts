import { PrismaClient } from '@prisma/client';
import '@/lib/env';

const prisma = new PrismaClient();

async function smokeTest() {
  console.log('🔌 Running smoke test against DATABASE_URL...');
  try {
    // 1. Test basic connectivity
    const now: Array<{ now: Date }> = await prisma.$queryRaw`SELECT NOW() as now;`;
    console.log(`✅ DB Connection established successfully. Server timestamp: ${now[0].now}`);

    // 2. Read one row from University or User
    const uniCount = await prisma.university.count();
    console.log(`📊 University table count: ${uniCount}`);

    const userCount = await prisma.user.count();
    console.log(`📊 User table count: ${userCount}`);

    if (uniCount > 0) {
      const sampleUni = await prisma.university.findFirst();
      console.log(`✅ Read sample university row: ${sampleUni?.name} (${sampleUni?.shortName})`);
    }

    console.log('✅ Smoke test PASSED successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Smoke test FAILED:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

smokeTest();
