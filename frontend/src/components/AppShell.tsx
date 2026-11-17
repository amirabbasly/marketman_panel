'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './sidebar';
import Topbar from './topbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // بستن منوی موبایل با تغییر صفحه و کلید Escape + قفل اسکرول بدنه هنگام باز بودن منو
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [menuOpen]);

  // صفحه ورود: فقط خود فرم، بدون هیچ شل/منو/هدر
  if (pathname === '/login') return <>{children}</>;

  return (
    <div className="min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {/* محتوای اصلی: در دسکتاپ به اندازه سایدبار (سمت راست) فاصله می‌گیرد */}
      <div className="flex min-h-screen min-w-0 flex-col lg:mr-[280px]">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main key={pathname} className="mx-auto w-full max-w-[1440px] flex-1 animate-fade-in p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
