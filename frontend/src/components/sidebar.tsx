'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Users, FileText, LayoutDashboard, LogOut, X, PhoneCall, CircleUserRound, ChevronLeft, Trophy, ScrollText, Phone, UserCheck, Shuffle, Mic, CalendarCheck, Wallet, Calculator } from 'lucide-react';
import { logout } from '@/lib/auth';
import { api } from '@/lib/api';

const navItems = [
  { name: 'داشبورد و آمار', desc: 'نمای کلی عملکرد فروش', href: '/dashboard', icon: LayoutDashboard, roles: ['MANAGER'] },
  { name: 'لیست مشتریان امروز', desc: 'مشتریان امروز و ثبت تماس', href: '/my-leads', icon: PhoneCall, roles: ['OPERATOR'] },
  { name: 'مشتریان اختصاصی من', desc: 'مشتری‌های اختصاص‌یافته به شما', href: '/my-customers', icon: UserCheck, roles: ['OPERATOR'] },
  { name: 'پروژه‌ها و جلسات', desc: 'جلسات، تعلیق و تکمیل پروژه', href: '/projects', icon: CalendarCheck, roles: ['MANAGER', 'OPERATOR'] },
  { name: 'کیف پول', desc: 'فروش، طلب و شارژها', href: '/wallet', icon: Wallet, roles: ['MANAGER', 'OPERATOR'] },
  { name: 'مدیریت اپراتورها', desc: 'ساخت و ویرایش اپراتور', href: '/operators', icon: Users, roles: ['MANAGER'] },
  { name: 'اختصاص مشتری', desc: 'ثبت و اختصاص مشتری آزاد و اختصاصی', href: '/assignments', icon: Shuffle, roles: ['MANAGER'] },
  { name: 'لیگ و سطوح فروش', desc: 'رتبه‌بندی و مدیریت سطوح', href: '/league', icon: Trophy, roles: ['MANAGER', 'OPERATOR'] },
  { name: 'ضبط صدا', desc: 'آرشیو تماس‌ها (به‌زودی)', href: '/recordings', icon: Mic, roles: ['MANAGER'] },
  { name: 'حسابداری', desc: 'درآمد، پورسانت، هزینه و فاکتور', href: '/accounting', icon: Calculator, roles: ['MANAGER'] },
  { name: 'قوانین و کسب درآمد', desc: 'شرایط همکاری و درآمد', href: '/rules', icon: ScrollText, roles: ['OPERATOR'] },
  { name: 'شماره‌گیر', desc: 'صفحه‌کلید شماره‌گیر (به‌زودی)', href: '/dialer', icon: Phone, roles: ['MANAGER', 'OPERATOR'] },
  { name: 'پروفایل من', desc: 'اطلاعات شخصی و درخواست تغییر', href: '/profile', icon: CircleUserRound, roles: ['MANAGER', 'OPERATOR'] },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem('mm_user') || 'null')); } catch { setUser(null); }
  }, [pathname]);

  // شمارنده درخواست‌های تغییر در انتظار تایید (فقط مدیر)
  useEffect(() => {
    if (user?.role !== 'MANAGER') return;
    api.get('/users/change-requests')
      .then((r) => setPendingCount((r.data.requests || []).filter((x: any) => x.status === 'PENDING').length))
      .catch(() => {});
  }, [user, pathname]);

  const role = user?.role || 'OPERATOR';
  const initials = user ? `${(user.firstName || ' ')[0]}${(user.lastName || ' ')[0]}` : '؟';

  return (
    <>
      {/* لایه تیره موبایل — بالاتر از محتوا، پایین‌تر از خود منو */}
      <div
        onClick={onClose}
        aria-hidden={!open}
        className={`fixed inset-0 z-[80] bg-ink-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* سایدبار سمت راست — در دسکتاپ همیشه ثابت، در موبایل کشویی از راست */}
      <aside
        className={`fixed inset-y-0 right-0 z-[90] flex w-[280px] flex-col overflow-hidden bg-ink-950 text-white shadow-2xl transition-transform duration-300 ease-out will-change-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* هاله نور تزئینی */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-10 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />

        {/* لوگو */}
        <div className="relative flex items-center justify-between px-5 pb-2 pt-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="لوگوی مارکت‌من" width={46} height={46} className="rounded-2xl shadow-glow ring-1 ring-white/20" priority />
            <div>
              <p className="text-[17px] font-black leading-5">مارکت‌من</p>
              <p className="mt-0.5 text-[11px] font-medium tracking-wide text-slate-400">MARKETMAN CRM</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden" aria-label="بستن منو">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* کارت کاربر */}
        {user && (
          <div className="relative mx-4 mb-5 mt-3 flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-teal-600 text-sm font-black shadow-glow">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{user.firstName} {user.lastName}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-brand-300">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                {role === 'MANAGER' ? 'مدیر سامانه' : 'اپراتور فروش'}
              </p>
            </div>
          </div>
        )}

        {/* ناوبری */}
        <nav className="relative flex-1 space-y-1.5 overflow-y-auto px-3">
          <p className="px-2 pb-1 text-[11px] font-bold text-slate-500">منوی اصلی</p>
          {navItems.filter((i) => i.roles.includes(role)).map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-l from-brand-500 to-teal-600 text-white shadow-glow'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${active ? 'bg-white/20' : 'bg-white/[0.06] group-hover:bg-white/10'}`}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{item.name}</span>
                  <span className={`block truncate text-[11px] ${active ? 'text-white/75' : 'text-slate-500'}`}>{item.desc}</span>
                </span>
                {item.href === '/operators' && pendingCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-black text-white shadow">
                    {pendingCount.toLocaleString('fa-IR')}
                  </span>
                )}
                {active && <ChevronLeft className="h-4 w-4 shrink-0 opacity-80" />}
              </Link>
            );
          })}
        </nav>

        {/* خروج */}
        <div className="relative p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10"><LogOut className="h-[18px] w-[18px]" /></span>
            خروج از حساب
          </button>
          <p className="pb-1 pt-2 text-center text-[10px] text-slate-600">Marketman CRM — نسخه ۲٫۰</p>
        </div>
      </aside>
    </>
  );
}
