'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bell, ShieldCheck, User as UserIcon } from 'lucide-react';
import { getUser, isManager, logout } from '@/lib/auth';

export default function Topbar() {
  const [userMenu, setUserMenu] = useState(false);
  const user = getUser();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-gray-900">
          {isManager() ? 'پنل مدیریت' : 'پنل اپراتور'}
        </h1>
        <BadgeInline variant="info">
          {user?.role === 'MANAGER' ? 'مدیر سامانه' : 'اپراتور فروش'}
        </BadgeInline>
      </div>
      <div className="flex items-center gap-3">
        <button className="text-gray-500 hover:text-gray-700">
          <Bell className="w-5 h-5" />
        </button>
        <div className="relative">
          <button
            onClick={() => setUserMenu((p) => !p)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium"
          >
            <UserIcon className="w-4 h-4" />
            {user?.firstName} {user?.lastName}
          </button>
          {userMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg py-2 z-50">
              <Link
                href="/profile"
                className="flex items-center justify-end px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                پروفایل و اطلاعات شخصی
              </Link>
              {isManager() && (
                <Link
                  href="/operators"
                  className="flex items-center justify-end px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                >
                  مدیریت اپراتورها
                </Link>
              )}
              <button
                onClick={() => logout()}
                className="flex items-center justify-end w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 border-t border-gray-100"
              >
                خروج از حساب
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function BadgeInline({ variant = 'default', children }: { variant?: string; children: React.ReactNode }) {
  const variants: Record<string, string> = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
    info: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
