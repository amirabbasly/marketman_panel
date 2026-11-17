'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    if (getToken()) {
      const user = JSON.parse(localStorage.getItem('mm_user') || 'null');
      router.replace(user?.role === 'MANAGER' ? '/dashboard' : '/my-leads');
    } else {
      router.replace('/login');
    }
  }, [router]);
  return null;
}
