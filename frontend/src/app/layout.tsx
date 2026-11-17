import type { Metadata } from 'next';
import Sidebar from '@/components/sidebar';
import Topbar from '@/components/topbar';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'بازاریمن | پنل CRM',
  description: 'پنل مدیریت مشتری برای تیم فروش و بازاریابی بازاریمن',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-50 antialiased">
        <Sidebar />
        <div className="page-wrapper">
          <Topbar />
          <main className="page-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
