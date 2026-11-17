'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { isManager } from '@/lib/auth';
import { toPersianDigits } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { BarChart as BarChartIcon, Users as UsersIcon, PhoneCall as PhoneIcon } from 'lucide-react';

if (typeof window !== 'undefined' && !isManager()) {
  window.location.href = '/my-leads';
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats/summary').then((r) => { setData(r.data); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-10">در حال بارگذاری...</div>;
  if (!data) return null;

  const { summary, byStatus, topAreas, topOperators, topCancellations, topCities } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <h1 className="text-2xl font-bold text-gray-900">دیشبورد مدیر</h1>
        <div className="flex gap-2">
          <Badge variant="info">{new Date().toLocaleDateString('fa-IR')}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="کل لیدها" value={summary.totalLeads} icon={<PhoneIcon className="w-5 h-5" />} color="bg-blue-500" />
        <StatCard title="جدید" value={summary.totalNew} color="bg-amber-500" />
        <StatCard title="تماس گرفته شده" value={summary.totalContacted} color="bg-emerald-500" />
        <StatCard title="لغو شده" value={summary.totalCancelled} color="bg-rose-500" />
        <StatCard title="درآمد پیشنهادی (تومان)" value={toPersianDigits(summary.revenue)} icon={<BarChartIcon className="w-5 h-5" />} color="bg-purple-500" />
        <StatCard title="نرخ تبدیل" value={`${summary.conversionRate}%`} color="bg-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">توزیع وضعیت لیدها</h3>
          <div className="h-64">
            <PieChart>
              <Pie
                data={[
                  { name: 'جدید', value: summary.totalNew },
                  { name: 'تماس گرفته شده', value: summary.totalContacted },
                  { name: 'لغو شده', value: summary.totalCancelled },
                ].filter((d) => d.value > 0)}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              />
              <Tooltip />
            </PieChart>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">بیشترین فروش بر اساس حوزه فعالیت</h3>
          <div className="h-64">
            <BarChart width={400} height={300} data={topAreas}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="area" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">بیشترین کنسلی بر اساس حوزه فعالیت</h3>
          <div className="h-64">
            <BarChart width={400} height={300} data={topCancellations}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="area" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <UsersIcon className="w-4 h-4" /> برترین و ضعیف‌ترین اپراتورها
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">اپراتور</th>
                  <th className="px-4 py-3 font-medium text-gray-600">تعداد تماس‌ها</th>
                </tr>
              </thead>
              <tbody>
                {topOperators.map((op: any, i: number) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-4 py-3">{op.operator}</td>
                    <td className="px-4 py-3 font-medium">{op.count}</td>
                  </tr>
                ))}
                {!topOperators.length && (
                  <tr><td colSpan={2} className="px-4 py-4 text-center text-gray-500">داده‌ای ثبت نشده است</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <PinIcon /> شهرهای فعال
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">شهر</th>
                  <th className="px-4 py-3 font-medium text-gray-600">تعداد فروش</th>
                </tr>
              </thead>
              <tbody>
                {topCities.map((c: any, i: number) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-4 py-3">{c.city}</td>
                    <td className="px-4 py-3 font-medium">{c.count}</td>
                  </tr>
                ))}
                {!topCities.length && (
                  <tr><td colSpan={2} className="px-4 py-4 text-center text-gray-500">داده‌ای ثبت نشده است</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon }: { title: string; value: any; color: string; icon?: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${color}`}>{icon}</div>}
      </div>
    </Card>
  );
}

function PinIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
