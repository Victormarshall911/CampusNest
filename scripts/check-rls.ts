import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRLS() {
  console.log('🔍 Checking Row Level Security (RLS) status on all public tables...');
  try {
    const unshieldedTables: Array<{ tablename: string }> = await prisma.$queryRaw`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND rowsecurity = false;
    `;

    if (unshieldedTables.length > 0) {
      console.error('\n❌ SECURITY VIOLATION: The following public tables do NOT have RLS enabled:');
      for (const t of unshieldedTables) {
        console.error(`   - ${t.tablename}`);
      }
      console.error('\nPlease create a migration with: ALTER TABLE "<tablename>" ENABLE ROW LEVEL SECURITY;\n');
      process.exit(1);
    }

    console.log('✅ PASS: All public tables have Row Level Security (RLS) enabled.');
  } catch (error: any) {
    console.error('❌ Failed to verify RLS status:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkRLS();
