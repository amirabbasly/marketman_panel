'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Bell, Menu, Search, ChevronDown, CircleUserRound, LogOut, Inbox } from 'lucide-react';
import { getUser, isManager, logout } from '@/lib/auth';
import { api } from '@/lib/api';

const titles: Record<string, string> = {
  '/dashboard': 'داشبورد و آمار',
  '/my-leads': 'لیست مشتریان امروز',
  '/operators': 'مدیریت اپراتورها',
  '/leads': 'ثبت لیست مشتریان',
  '/profile': 'پروفایل من',
};

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userMenu, setUserMenu] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [pending, setPending] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setUser(getUser()); setUserMenu(false); setBellOpen(false); }, [pathname]);

  useEffect(() => {
    if (!isManager()) return;
    api.get('/users/change-requests')
      .then((r) => setPending((r.data.requests || []).filter((x: any) => x.status === 'PENDING')))
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) { setUserMenu(false); setBellOpen(false); } };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const title = Object.entries(titles).find(([k]) => pathname === k || pathname.startsWith(k + '/'))?.[1] || 'پنل مارکت‌من';
  const today = new Date().toLocaleDateString('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' });

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/leads?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] w-full max-w-[1440px] items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        {/* دکمه همبرگر — سمت راست (شروع صفحه در RTL)، فقط موبایل/تبلت */}
        <button
          onClick={onMenu}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-white shadow-md transition hover:bg-ink-800 active:scale-95 lg:hidden"
          aria-label="باز کردن منو"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* لوگوی موبایل */}
        <Link href={isManager() ? '/dashboard' : '/my-leads'} className="flex items-center gap-2 lg:hidden">
          <Image src="/logo.png" alt="مارکت‌من" width={34} height={34} className="rounded-[10px] ring-1 ring-slate-200" />
        </Link>

        {/* عنوان صفحه + تاریخ */}
        <div className="min-w-0">
          <h1 className="truncate text-base font-extrabold text-slate-900 sm:text-lg">{title}</h1>
          <p className="hidden text-[11px] text-slate-400 sm:block">{today}</p>
        </div>

        <div className="flex-1" />

        {/* جستجوی سریع (مدیر) */}
        {isManager() && (
          <form onSubmit={submitSearch} className="relative hidden md:block">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی مشتری، برند، شماره…"
              className="w-56 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-9 text-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/15 xl:w-72"
            />
          </form>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2" ref={menuRef}>
          {/* اعلان درخواست‌های در انتظار */}
          {isManager() && (
            <div className="relative">
              <button onClick={() => { setBellOpen((p) => !p); setUserMenu(false); }} className="relative flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" aria-label="اعلان‌ها">
                <Bell className="h-5 w-5" />
                {pending.length > 0 && <span className="absolute left-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">{pending.length.toLocaleString('fa-IR')}</span>}
              </button>
              {bellOpen && (
                <div className="absolute left-0 top-[52px] w-80 animate-scale-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
                  <p className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-800">درخواست‌های تغییر اپراتورها</p>
                  {pending.length ? pending.slice(0, 5).map((r) => (
                    <Link key={r.id} href={`/operators/${r.operatorId}`} onClick={() => setBellOpen(false)} className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><Inbox className="h-4 w-4" /></span>
                      <span className="min-w-0 text-sm"><b>{r.operator?.firstName} {r.operator?.lastName}</b> <span className="text-slate-500">درخواست تغییر ثبت کرده است</span></span>
                    </Link>
                  )) : <p className="px-4 py-6 text-center text-sm text-slate-400">درخواست در انتظاری وجود ندارد</p>}
                </div>
              )}
            </div>
          )}

          {/* منوی کاربر */}
          <div className="relative">
            <button onClick={() => { setUserMenu((p) => !p); setBellOpen(false); }} className="flex items-center gap-2.5 rounded-xl py-1.5 pl-2 pr-1.5 transition hover:bg-slate-100">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-teal-600 text-xs font-black text-white">
                {user ? `${(user.firstName || ' ')[0]}${(user.lastName || ' ')[0]}` : '؟'}
              </span>
              <span className="hidden text-right sm:block">
                <span className="block max-w-[120px] truncate text-sm font-bold leading-4 text-slate-800">{user?.firstName} {user?.lastName}</span>
                <span className="block text-[11px] text-slate-400">{user?.role === 'MANAGER' ? 'مدیر سامانه' : 'اپراتور فروش'}</span>
              </span>
              <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
            </button>
            {userMenu && (
              <div className="absolute left-0 top-[52px] w-56 animate-scale-in overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-card">
                <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"><CircleUserRound className="h-4 w-4 text-slate-400" />پروفایل و اطلاعات شخصی</Link>
                {isManager() && <Link href="/operators" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"><Bell className="hidden" /><span className="pr-6">مدیریت اپراتورها</span></Link>}
                <button onClick={logout} className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50"><LogOut className="h-4 w-4" />خروج از حساب</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
