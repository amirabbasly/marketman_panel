'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getUser, isManager } from '@/lib/auth';
import { formatDate, formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const me = getUser();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!me) return;
    api.get(`/users/${me.id}`).then((r) => {
      setUser(r.data.user);
      setLoading(false);
    });
  }, [me]);

  if (loading) return <div className="text-center py-10">در حال بارگذاری...</div>;
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">پروفایل من</h1>
        <Link href="/profile/request">
          <Button>درخواست تغییر اطلاعات شخصی</Button>
        </Link>
        {isManager() && (
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">بازگشت به دیشبورد</Link>
        )}
      </div>

      <Card>
        <div className="px-6 py-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-shrink-0">
              {user.nationalIdPhoto ? (
                <img src={user.nationalIdPhoto} alt="شناسه" className="w-32 h-32 rounded-xl object-cover border border-gray-200" />
              ) : (
                <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
              <p className="text-sm text-gray-600 mb-1">نقش: {user.role === 'MANAGER' ? 'مدیر سامانه' : 'اپراتور فروش'}</p>
              <p className="text-sm text-gray-600 mb-1">شماره تماس: {user.phone || '—'}</p>
              <p className="text-sm text-gray-600 mb-1">کد ملی: {user.nationalId || '—'}</p>
              <p className="text-sm text-gray-600 mb-1">تاریخ تولد: {formatDate(user.birthDate)}</p>
              <p className="text-sm text-gray-600 mb-1">وضعیت حساب: {user.isActive ? 'فعال' : 'غیرفعال'}</p>
              <p className="text-sm text-gray-600 mb-1">عضو از: {formatDateTime(user.createdAt)}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">نکته مهم</h3>
        <p className="text-sm text-gray-700">
          شما فقط می‌توانید اطلاعات خود را مشاهده کنید. برای هر تغییری (نام، کد ملی، شماره تماس، تاریخ تولد یا عکس شناسنامه)
          باید از طریق بخش «درخواست تغییر اطلاعات شخصی» درخواست بفرستید تا مدیر تایید نماید.
        </p>
      </div>
    </div>
  );
}
