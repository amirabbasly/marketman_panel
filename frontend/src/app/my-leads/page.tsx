'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { isOperator } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LeadRow } from '@/components/LeadRow';
import { PhoneCall } from 'lucide-react';
import Link from 'next/link';

if (typeof window !== 'undefined' && !isOperator()) {
  window.location.href = '/dashboard';
}

export default function MyLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leads?mine=true').then((r) => {
      setLeads(r.data.leads || []);
      setLoading(false);
    });
  }, []);

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
                    api.get('/leads?mine=true').then((r) => setLeads(r.data.leads || []));
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
