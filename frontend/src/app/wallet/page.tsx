'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { isManager } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, Landmark, CheckCircle2, Hourglass } from 'lucide-react';
import { formatJalaliDateTime } from '@/lib/jalali';

const fa = (n: any) => Number(n || 0).toLocaleString('fa-IR');
const money = (n: any) => `${fa(n)} تومان`;

export default function WalletPage() {
  const manager = isManager();
  return manager ? <ManagerWallet /> : <OperatorWallet />;
}

function OperatorWallet() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/wallet/me').then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="py-16 text-center text-slate-500">در حال بارگذاری کیف پول…</div>;
  if (!data) return <div className="py-16 text-center text-slate-500">خطا در دریافت کیف پول</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2"><Wallet className="h-6 w-6 text-brand-600" /> کیف پول من</h1>
        <p className="page-subtitle">هر پروژه‌ای که مدیر تأیید نهایی کند، بر اساس سطح لیگ‌تان شارژ می‌شود و این‌جا می‌بینید چقدر فروخته‌اید و چقدر از شرکت طلب دارید.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<Landmark className="h-5 w-5" />} title="طلب شما از شرکت (قابل تسویه)" value={money(data.totalEarned)} color="bg-brand-500" big />
        <Stat icon={<TrendingUp className="h-5 w-5" />} title="مجموع فروش پروژه‌های تکمیل‌شده" value={money(data.totalSold)} color="bg-sky-500" />
        <Stat icon={<CheckCircle2 className="h-5 w-5" />} title="پروژه تکمیل‌شده" value={`${fa(data.completedCount)} پروژه`} color="bg-violet-500" />
        <Stat icon={<Hourglass className="h-5 w-5" />} title="در انتظار تأیید مدیر" value={`${fa(data.pendingCount)} پروژه`} color="bg-amber-500" />
      </div>

      <Card>
        <div className="border-b border-slate-100 px-6 py-4"><h3 className="font-black text-slate-900">تراکنش‌های کیف پول (شارژهای شرکت)</h3></div>
        {data.transactions.length ? (
          <div className="overflow-x-auto"><table>
            <thead><tr><th>تاریخ شارژ</th><th>پروژه</th><th>شهر / حوزه</th><th>شرح</th><th>مبلغ شارژ</th></tr></thead>
            <tbody>{data.transactions.map((t: any) => (
              <tr key={t.id}>
                <td className="whitespace-nowrap text-slate-500">{formatJalaliDateTime(t.createdAt)}</td>
                <td className="font-bold">{t.lead?.brandName || '—'}</td>
                <td className="text-slate-500">{t.lead?.city || '—'} · {t.lead?.businessArea || '—'}</td>
                <td className="text-xs text-slate-500">{t.description}</td>
                <td className="whitespace-nowrap font-black text-brand-700">+ {money(t.amount)}</td>
              </tr>))}
            </tbody></table></div>
        ) : <p className="px-6 py-10 text-center text-sm text-slate-400">هنوز شارژی ثبت نشده است؛ با تکمیل‌شدن اولین پروژه‌تان (تأیید مدیر) کیف پول‌تان شارژ می‌شود.</p>}
      </Card>

      <Card>
        <div className="border-b border-slate-100 px-6 py-4"><h3 className="font-black text-slate-900">پروژه‌های تکمیل‌شده من</h3></div>
        {data.completedProjects.length ? (
          <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
            {data.completedProjects.map((l: any) => (
              <div key={l.id} className="rounded-2xl bg-brand-50/60 px-4 py-3 ring-1 ring-brand-100">
                <p className="font-black text-slate-800">{l.brandName}</p>
                <p className="mt-0.5 text-xs text-slate-500">مبلغ فروش: <b>{money(l.suggestedAmount)}</b></p>
                <p className="text-xs text-slate-400">تکمیل: {formatJalaliDateTime(l.completedAt)}</p>
              </div>
            ))}
          </div>
        ) : <p className="px-6 py-10 text-center text-sm text-slate-400">هنوز پروژه تکمیل‌شده‌ای ندارید</p>}
      </Card>
    </div>
  );
}

function ManagerWallet() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/wallet/operators').then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="py-16 text-center text-slate-500">در حال بارگذاری…</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2"><Wallet className="h-6 w-6 text-brand-600" /> کیف پول اپراتورها</h1>
        <p className="page-subtitle">موجودی هر اپراتور همان طلب او از شرکت است که با تأیید نهایی پروژه‌ها شارژ شده است.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat icon={<Landmark className="h-5 w-5" />} title="مجموع بدهی شرکت به اپراتورها" value={money(data.totalPayable)} color="bg-rose-500" big />
        <Stat icon={<CheckCircle2 className="h-5 w-5" />} title="اپراتور دارای موجودی" value={`${fa(data.operators.filter((o: any) => o.balance > 0).length)} نفر`} color="bg-brand-500" />
      </div>
      <Card>
        <div className="overflow-x-auto"><table>
          <thead><tr><th>اپراتور</th><th>شماره تماس</th><th>پروژه تکمیل‌شده</th><th>مجموع فروش</th><th>موجودی / طلب از شرکت</th><th>وضعیت</th></tr></thead>
          <tbody>
            {data.operators.map((o: any) => (
              <tr key={o.operatorId}>
                <td className="font-bold">{o.name}</td><td className="text-slate-500">{o.phone}</td>
                <td>{fa(o.completedCount)}</td><td>{money(o.totalSold)}</td>
                <td className="font-black text-brand-700">{money(o.balance)}</td>
                <td><Badge variant={o.isActive ? 'success' : 'danger'}>{o.isActive ? 'فعال' : 'غیرفعال'}</Badge></td>
              </tr>
            ))}
            {!data.operators.length && <tr><td colSpan={6} className="py-8 text-center text-slate-400">اپراتوری ثبت نشده است</td></tr>}
          </tbody></table></div>
      </Card>
    </div>
  );
}

function Stat({ icon, title, value, color, big }: any) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div><p className="text-xs font-bold text-slate-400">{title}</p><p className={`mt-1 font-black text-slate-900 ${big ? 'text-xl' : 'text-lg'}`}>{value}</p></div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white ${color}`}>{icon}</span>
      </div>
    </Card>
  );
}
