'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    const user = getUser();
    if (!user || !user.role) {
      router.replace('/login');
      return;
    }
    router.replace(user.role === 'MANAGER' ? '/dashboard' : '/my-leads');
  }, [router]);
  return null;
}
