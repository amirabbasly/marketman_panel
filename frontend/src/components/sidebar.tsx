'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Users, FileText, BarChart3, Settings, LogOut, Menu, X, PhoneCall, User } from 'lucide-react';
import { isManager, isOperator, logout } from '@/lib/auth';

const navItems = [
  { name: 'دیشبورد وآمار', href: '/dashboard', icon: BarChart3, roles: ['MANAGER'] },
  { name: 'لیست مشتریان امروز', href: '/my-leads', icon: PhoneCall, roles: ['OPERATOR'] },
  { name: 'مدیریت اپراتور‌ها', href: '/operators', icon: Users, roles: ['MANAGER'] },
  { name: 'ثبت لیست مشتریان', href: '/leads', icon: FileText, roles: ['MANAGER'] },
  { name: 'پروفایل من', href: '/profile', icon: User, roles: ['MANAGER', 'OPERATOR'] },
  { name: 'خروج', href: '#', icon: LogOut, roles: ['MANAGER', 'OPERATOR'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('mm_user') || 'null'));
  }, []);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 bg-white shadow-md z-30 md:flex flex-col transform -translate-x-full md:translate-x-0 transition-transform duration-300">
        <div className="flex items-center justify-end p-5 md:justify-center">
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="px-4 py-3 text-center font-bold text-emerald-700 tracking-tight text-lg">
          بازاریمن
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems
            .filter((item) => item.roles.includes(user?.role || 'OPERATOR'))
            .map((item) => {
              if (item.href === '#') {
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      logout();
                    }}
                    className="flex items-center w-full px-3 py-2.5 text-right text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <LogOut className="ml-2 w-5 h-5 text-gray-400" />
                    {item.name}
                  </button>
                );
              }
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={twCls(
                    'flex items-center w-full px-3 py-2.5 text-right text-sm font-medium rounded-lg transition-colors',
                    active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  )}
                >
                  <Icon className="ml-2 w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
                  {item.name}
                </Link>
              );
            })}
        </nav>
      </aside>
      <button
        className="md:hidden fixed left-4 top-4 z-50 flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
        onClick={() => setMobileOpen(true)}
        aria-label="منو"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  );
}

function twCls(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
