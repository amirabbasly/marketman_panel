'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { isOperator } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LeadRow } from '@/components/LeadRow';
import { PhoneCall } from 'lucide-react';
import Link from 'next/link';

export default function MyLeadsPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOperator()) {
      router.replace('/dashboard');
      return;
    }
    api.get('/leads').then((r) => { setLeads(r.data.leads || []); }).catch(() => {}).finally(() => { setLoading(false); setChecked(true); });
  }, [router]);

  if (!checked) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">لیست مشتریان امروز</h1>
        </div>
        <Link href="/profile" className="text-sm text-gray-600 hover:text-gray-900">
          پروفایل و اطلاعات شخصی
        </Link>
      </div>

      {(() => {
        const done = leads.filter((l) => l.status === 'CONTACTED').length;
        const cancelled = leads.filter((l) => l.status === 'CANCELLED').length;
        const fresh = leads.filter((l) => l.status === 'NEW').length;
        const pct = leads.length ? Math.round(((done + cancelled) / leads.length) * 100) : 0;
        return (
          <Card className="p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-extrabold text-slate-800">پیشرفت امروز شما</p>
              <p className="text-xs text-slate-500">{pct.toLocaleString('fa-IR')}٪ از لیست امروز بررسی شده است</p>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-l from-brand-500 to-teal-500 transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-amber-50 py-3 ring-1 ring-amber-100"><p className="text-lg font-black text-amber-600">{fresh.toLocaleString('fa-IR')}</p><p className="text-[11px] font-bold text-amber-700">در انتظار تماس</p></div>
              <div className="rounded-2xl bg-brand-50 py-3 ring-1 ring-brand-100"><p className="text-lg font-black text-brand-600">{done.toLocaleString('fa-IR')}</p><p className="text-[11px] font-bold text-brand-700">تماس موفق</p></div>
              <div className="rounded-2xl bg-rose-50 py-3 ring-1 ring-rose-100"><p className="text-lg font-black text-rose-600">{cancelled.toLocaleString('fa-IR')}</p><p className="text-[11px] font-bold text-rose-700">لغو شده</p></div>
            </div>
          </Card>
        );
      })()}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <p className="text-gray-800">
          لیست زیر مشتریان ثبت‌شده توسط مدیر است. برای ثبت تماس، روی دکمه «تماس گرفتـم» هر ردیف کلیک کنید، توضیحات و مبلغ پیشنهادی (اختیاری) را وارد کنید و تایید کنید.
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto p-6">
          {loading ? (
            <div className="text-center py-10">در حال بارگذاری...</div>
          ) : leads.length ? (
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">نام برند</th>
                  <th className="px-4 py-3 font-medium text-gray-600">نام شخص</th>
                  <th className="px-4 py-3 font-medium text-gray-600">شهر / منطقه</th>
                  <th className="px-4 py-3 font-medium text-gray-600">حوزه فعالیت</th>
                  <th className="px-4 py-3 font-medium text-gray-600">شماره تماس</th>
                  <th className="px-4 py-3 font-medium text-gray-600">وضعیت</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <LeadRow key={lead.id} lead={lead} onUpdate={() => {
                    api.get('/leads').then((r) => setLeads(r.data.leads || []));
                  }} />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10 text-gray-500">امروز مشتری ثبت نشده است</div>
          )}
        </div>
      </Card>
    </div>
  );
}
