'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { isManager } from '@/lib/auth';
import { toPersianDigits } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { JalaliDatePicker } from '@/components/ui/datepicker';
import { Badge } from '@/components/ui/badge';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BarChart as BarChartIcon, Users as UsersIcon, PhoneCall as PhoneIcon } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState({ from: '', to: '' });
  const [meetings, setMeetings] = useState<any[]>([]);

  useEffect(() => {
    if (!isManager()) return;
    api.get('/leads/meetings').then((r) => setMeetings(r.data.meetings || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isManager()) {
      router.replace('/my-leads');
      return;
    }
    setChecked(true);
    setLoading(true);
    const params: any = {};
    if (range.from) params.from = range.from;
    if (range.to) params.to = `${range.to}T23:59:59`;
    api.get('/stats/summary', { params }).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [router, range]);

  if (!checked) return null;
  if (loading) return <div className="text-center py-10">در حال بارگذاری...</div>;
  if (!data) return null;

  const { summary, byStatus, topAreas, topOperators, topCancellations, topCities, operatorStats = [], bestOperator, worstOperator, cityStats = [], bestCity, worstCity } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <h1 className="page-title">داشبورد مدیر</h1>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-bold text-slate-500">از تاریخ<JalaliDatePicker value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} className="mt-1" /></label>
          <label className="text-xs font-bold text-slate-500">تا تاریخ<JalaliDatePicker value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} className="mt-1" /></label>
          {(range.from || range.to) && <Button variant="outline" onClick={() => setRange({ from: '', to: '' })}>حذف فیلتر</Button>}
          <Button variant="outline" onClick={() => exportCsv(data)}><Download className="h-4 w-4" />خروجی CSV آمار</Button>
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

      {meetings.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-900">🗓️ جلسات ثبت‌شده و پیش‌رو (برای مدیریت)</h3>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {meetings.slice(0, 9).map((m: any) => (
              <div key={m.id} className="rounded-2xl bg-brand-50/60 px-4 py-3 ring-1 ring-brand-100">
                <p className="text-sm font-black text-slate-800">{m.brandName} — {m.personName}</p>
                <p className="mt-0.5 text-xs text-slate-500">جلسه: <b className="text-brand-700">{new Date(m.meetingAt).toLocaleString('fa-IR', { timeZone: 'Asia/Tehran', dateStyle: 'medium', timeStyle: 'short' })}</b></p>
                <p className="text-xs text-slate-500">اپراتور: {m.contactedBy ? `${m.contactedBy.firstName} ${m.contactedBy.lastName}` : (m.assignedTo ? `${m.assignedTo.firstName} ${m.assignedTo.lastName}` : '—')}{m.suggestedAmount ? ` · مبلغ: ${Number(m.suggestedAmount).toLocaleString('fa-IR')} تومان` : ''}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Insight title="🏆 بیشترین فروش — اپراتور" value={bestOperator ? `${bestOperator.operator}` : '—'} sub={bestOperator ? `${bestOperator.sales} فروش • ${Number(bestOperator.revenue).toLocaleString('fa-IR')} تومان` : 'داده‌ای نیست'} />
        <Insight title="کمترین فروش — اپراتور" value={worstOperator ? `${worstOperator.operator}` : '—'} sub={worstOperator ? `${worstOperator.sales} فروش • ${worstOperator.cancels} کنسلی` : 'داده‌ای نیست'} />
        <Insight title="🏙️ پرفروش‌ترین شهر" value={bestCity?.city || '—'} sub={bestCity ? `${bestCity.sales} فروش • ${bestCity.cancels} کنسلی` : 'داده‌ای نیست'} />
        <Insight title="کم‌فروش‌ترین شهر" value={worstCity?.city || '—'} sub={worstCity ? `${worstCity.sales} فروش • ${worstCity.cancels} کنسلی` : 'داده‌ای نیست'} />
      </div>
      {(operatorStats.length > 0 || cityStats.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RankTable title="رتبه‌بندی کامل اپراتورها (فروش ↓)" rows={operatorStats.map((o:any)=>({name:o.operator, a:`${o.sales} فروش`, b:`${o.cancels} کنسلی`, c:`${Number(o.revenue).toLocaleString('fa-IR')} تومان`}))} />
          <RankTable title="رتبه‌بندی کامل شهرها (فروش ↓)" rows={cityStats.map((c:any)=>({name:c.city, a:`${c.sales} فروش`, b:`${c.cancels} کنسلی`, c:`${Number(c.revenue).toLocaleString('fa-IR')} تومان`}))} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">توزیع وضعیت لیدها</h3>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'جدید', value: summary.totalNew },
                    { name: 'تماس گرفته شده', value: summary.totalContacted },
                    { name: 'لغو شده', value: summary.totalCancelled },
                  ].filter((d) => d.value > 0)}
                  dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={88} paddingAngle={3} cornerRadius={6}
                >
                  <Cell fill="#f59e0b" /><Cell fill="#10b981" /><Cell fill="#f43f5e" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">بیشترین فروش بر اساس حوزه فعالیت</h3>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topAreas} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="area" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">بیشترین کنسلی بر اساس حوزه فعالیت</h3>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCancellations} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="area" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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

function exportCsv(d: any) {
  if (!d) return;
  const rows: any[][] = [['بخش', 'نام', 'فروش', 'کنسلی', 'مبلغ پیشنهادی (تومان)']];
  (d.operatorStats || []).forEach((o: any) => rows.push(['اپراتور', o.operator, o.sales, o.cancels, o.revenue]));
  (d.cityStats || []).forEach((c: any) => rows.push(['شهر', c.city, c.sales, c.cancels, c.revenue]));
  (d.topAreas || []).forEach((a: any) => rows.push(['حوزه فروش', a.area, a.count, '', '']));
  (d.topCancellations || []).forEach((a: any) => rows.push(['حوزه کنسلی', a.area, '', a.count, '']));
  const csv = '\uFEFF' + rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `marketman-stats-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(a.href);
}

function Insight({ title, value, sub }: any) { return <Card className="p-5 border-r-4 border-r-emerald-500"><p className="text-xs text-gray-500">{title}</p><p className="mt-1 text-lg font-black text-gray-900">{value}</p><p className="text-xs text-gray-500">{sub}</p></Card>; }
function RankTable({ title, rows }: any) { return <Card><div className="p-5 border-b border-gray-100"><h3 className="text-sm font-semibold">{title}</h3></div><div className="max-h-72 overflow-auto">{rows.length ? rows.map((r:any,i:number)=>(<div key={i} className="flex items-center justify-between border-b border-gray-50 px-5 py-3 text-sm"><span className="font-medium">{i+1}. {r.name}</span><span className="flex gap-3 text-xs text-gray-500"><span>{r.a}</span><span>{r.b}</span><span className="font-bold text-emerald-600">{r.c}</span></span></div>)) : <p className="p-5 text-center text-sm text-gray-500">داده‌ای ثبت نشده است</p>}</div></Card>; }

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
