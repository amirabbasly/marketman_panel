'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Users, FileText, BarChart3, LogOut, Menu, X, PhoneCall, User, Sparkles } from 'lucide-react';
import { logout } from '@/lib/auth';

const navItems = [
  { name: 'داشبورد و آمار', href: '/dashboard', icon: BarChart3, roles: ['MANAGER'] },
  { name: 'لیست مشتریان امروز', href: '/my-leads', icon: PhoneCall, roles: ['OPERATOR'] },
  { name: 'مدیریت اپراتورها', href: '/operators', icon: Users, roles: ['MANAGER'] },
  { name: 'ثبت لیست مشتریان', href: '/leads', icon: FileText, roles: ['MANAGER'] },
  { name: 'پروفایل من', href: '/profile', icon: User, roles: ['MANAGER', 'OPERATOR'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  useEffect(() => { try { setUser(JSON.parse(localStorage.getItem('mm_user') || 'null')); } catch { setUser(null); } }, [pathname]);
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  const role = user?.role || 'OPERATOR';

  const nav = (
    <>
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30"><Sparkles className="h-5 w-5" /></span>
          <div><p className="text-lg font-black leading-5 text-white">مارکت‌من</p><p className="text-[11px] text-slate-400">Marketman CRM</p></div>
        </div>
        <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white md:hidden" aria-label="بستن منو"><X className="h-6 w-6" /></button>
      </div>
      {user && <div className="mx-4 mb-4 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10"><p className="text-sm font-bold text-white">{user.firstName} {user.lastName}</p><p className="mt-0.5 text-xs text-emerald-300">{role === 'MANAGER' ? 'مدیر سامانه' : 'اپراتور فروش'}</p></div>}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.filter(i => i.roles.includes(role)).map(item => {
          const active = pathname === item.href; const Icon = item.icon;
          return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}><Icon className="h-5 w-5" />{item.name}</Link>;
        })}
      </nav>
      <div className="p-3"><button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10"><LogOut className="h-5 w-5" />خروج از حساب</button></div>
    </>
  );

  return (
    <>
      <button className="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg md:hidden" onClick={() => setMobileOpen(true)} aria-label="باز کردن منو"><Menu className="h-5 w-5" /></button>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 right-0 z-50 flex w-64 flex-col bg-slate-900 shadow-2xl transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>{nav}</aside>
    </>
  );
}
