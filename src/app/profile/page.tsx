'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfileRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    } else if (status === 'authenticated' && session?.user) {
      const userId = (session.user as any).id;
      router.replace(`/profile/${userId}`);
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
      <div className="skeleton h-12 w-12 rounded-full animate-spin border-4 border-cn-purple border-t-transparent" />
    </div>
  );
}
