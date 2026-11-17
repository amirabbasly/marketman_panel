'use client';
import { usePathname } from 'next/navigation';
import Sidebar from './sidebar';
import Topbar from './topbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/login') return <>{children}</>;
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex min-h-screen flex-col md:mr-64">
        <Topbar />
        <main className="mx-auto w-full max-w-[1400px] flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
