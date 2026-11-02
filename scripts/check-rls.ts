import { prisma } from '@/lib/prisma';

async function checkRLS() {
  console.log('🔍 Checking Row Level Security (RLS) status and role privileges on all public tables...');
  let hasFailure = false;

  try {
    // 1. Verify RLS is enabled on every public table
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
      hasFailure = true;
    } else {
      console.log('✅ PASS: All public tables have Row Level Security (RLS) enabled.');
    }

    // 2. Verify neither 'anon' nor 'authenticated' holds any table privileges in public schema
    const activePrivileges: Array<{ grantee: string; table_name: string; privilege_type: string }> = await prisma.$queryRaw`
      SELECT grantee, table_name, privilege_type
      FROM information_schema.table_privileges
      WHERE table_schema = 'public'
        AND grantee IN ('anon', 'authenticated');
    `;

    if (activePrivileges.length > 0) {
      console.error('\n❌ PRIVILEGE VIOLATION: Roles "anon" or "authenticated" hold active privileges on public tables:');
      for (const p of activePrivileges) {
        console.error(`   - Role [${p.grantee}] has [${p.privilege_type}] on table [${p.table_name}]`);
      }
      hasFailure = true;
    } else {
      console.log('✅ PASS: Roles "anon" and "authenticated" have no table privileges in public schema.');
    }

    if (hasFailure) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Failed to verify RLS and privileges status:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkRLS();
