'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { isManager } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';

const fa = (n: any) => Number(n || 0).toLocaleString('fa-IR');
const money = (n: any) => `${fa(n)} تومان`;

export default function LeaguePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const manager = isManager();

  const load = () => api.get('/league').then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const setLevel = async (operatorId: string, value: string) => {
    setSavingId(operatorId);
    try {
      await api.patch(`/users/${operatorId}`, { levelOverride: value === 'auto' ? null : Number(value) });
      await load();
    } catch (err: any) { alert(err.response?.data?.error || 'خطا در تغییر سطح'); }
    finally { setSavingId(''); }
  };

  if (loading) return <div className="py-16 text-center text-slate-500">در حال بارگذاری لیگ…</div>;
  if (!data) return <div className="py-16 text-center text-slate-500">خطا در دریافت اطلاعات لیگ</div>;

  const { tiers, ranking, topOfWeek, me, monthLabel } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2"><Trophy className="h-6 w-6 text-amber-500" /> لیگ و سطوح فروش</h1>
        <p className="page-subtitle">رتبه‌بندی بر اساس فروش موفق در {monthLabel} — سطح هر اپراتور خودکار با فروش ماهانه‌اش ارتقا پیدا می‌کند{manager ? ' و مدیر می‌تواند سطح را دستی هم تنظیم کند' : ''}.</p>
      </div>

      {topOfWeek && (
        <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-gradient-to-l from-amber-400 via-yellow-500 to-amber-500 px-5 py-4 text-white shadow-lg shadow-amber-500/25">
          <Crown className="h-8 w-8" />
          <div className="flex-1">
            <p className="text-[11px] font-bold text-white/85">کارشناس فروش برتر هفته</p>
            <p className="text-lg font-black">{topOfWeek.name} — {fa(topOfWeek.weekSales)} فروش این هفته</p>
          </div>
          <Badge className="bg-white/25 text-white ring-white/30">سطح {fa(topOfWeek.level)} · {topOfWeek.levelName}</Badge>
        </div>
      )}

      {!manager && me && (
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">سطح فعلی شما در {monthLabel}</p>
              <p className="mt-1 text-2xl font-black" style={{ color: me.levelColor }}>سطح {fa(me.level)} · {me.levelName}{me.isOverride && <span className="mr-2 align-middle text-xs text-slate-400">(تنظیم‌شده توسط مدیر)</span>}</p>
              <p className="mt-1 text-sm text-slate-500">{fa(me.monthSales)} فروش این ماه · درآمد تقریبی این ماه: <b className="text-brand-700">{money(me.estimatedIncome)}</b></p>
            </div>
            <div className="min-w-[240px] flex-1 sm:max-w-sm">
              {me.nextLevel ? (
                <>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-600"><TrendingUp className="h-4 w-4 text-brand-600" /> تا سطح «{me.nextLevel.name}» فقط {fa(me.nextLevel.salesNeeded)} فروش دیگر</p>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-l from-brand-500 to-teal-500 transition-all duration-700" style={{ width: `${me.progressToNext}%` }} /></div>
                  <p className="mt-1 text-left text-[11px] text-slate-400">{fa(me.progressToNext)}٪ مسیر سطح بعد</p>
                </>
              ) : <p className="rounded-2xl bg-violet-50 px-4 py-3 text-sm font-bold text-violet-700 ring-1 ring-violet-100">🎉 شما در بالاترین سطح لیگ هستید!</p>}
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {tiers.map((t: any) => (
          <Card key={t.level} className="p-5" >
            <div style={{ borderTop: `4px solid ${t.color}` }} className="-m-5 mb-0 h-0" />
            <p className="text-xs font-bold text-slate-400">سطح {fa(t.level)}</p>
            <p className="mt-1 text-lg font-black" style={{ color: t.color }}>{t.name}</p>
            <p className="mt-2 text-sm text-slate-500">از {fa(t.minSales)} فروش در ماه</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{money(t.rate)} <span className="text-xs font-medium text-slate-400">به‌ازای هر پروژه</span></p>
            {!manager && me?.level === t.level && <Badge variant="success" className="mt-3">سطح فعلی شما</Badge>}
          </Card>
        ))}
      </div>

      <Card>
        <div className="border-b border-slate-100 px-6 py-4"><h3 className="font-black text-slate-900">جدول رتبه‌بندی اپراتورها — {monthLabel}</h3></div>
        <div className="overflow-x-auto">
          <table>
            <thead><tr><th>رتبه</th><th>اپراتور</th><th>فروش ماه</th><th>فروش هفته</th><th>سطح</th><th>درآمد تقریبی ماه</th>{manager && <th>تنظیم سطح توسط مدیر</th>}</tr></thead>
            <tbody>
              {ranking.map((r: any) => (
                <tr key={r.operatorId} className={!manager && me?.operatorId === r.operatorId ? 'bg-brand-50/60' : ''}>
                  <td>{r.rank === 1 ? <Medal className="h-5 w-5 text-amber-500" /> : r.rank === 2 ? <Medal className="h-5 w-5 text-slate-400" /> : r.rank === 3 ? <Medal className="h-5 w-5 text-amber-700" /> : <span className="font-bold text-slate-500">{fa(r.rank)}</span>}</td>
                  <td className="font-bold text-slate-800">{r.name}{!r.isActive && <span className="mr-2 text-[11px] text-rose-500">(غیرفعال)</span>}</td>
                  <td className="font-bold">{fa(r.monthSales)}</td>
                  <td>{fa(r.weekSales)}</td>
                  <td><span className="rounded-full px-2.5 py-1 text-[11px] font-black text-white" style={{ background: r.levelColor }}>سطح {fa(r.level)} · {r.levelName}</span>{r.isOverride && <span className="mr-1 text-[10px] text-slate-400">دستی</span>}</td>
                  <td className="font-bold text-brand-700">{money(r.estimatedIncome)}</td>
                  {manager && (
                    <td>
                      <select value={r.levelOverride ?? 'auto'} disabled={savingId === r.operatorId} onChange={(e) => setLevel(r.operatorId, e.target.value)} className="py-2 text-xs">
                        <option value="auto">خودکار (بر اساس فروش)</option>
                        {tiers.map((t: any) => <option key={t.level} value={t.level}>سطح {fa(t.level)} · {t.name}</option>)}
                      </select>
                    </td>
                  )}
                </tr>
              ))}
              {!ranking.length && <tr><td colSpan={manager ? 7 : 6} className="py-8 text-center text-slate-400">هنوز اپراتوری ثبت نشده است</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-3 font-black text-slate-900">طرح لیگ چطور کار می‌کند؟</h3>
        <div className="space-y-2.5 text-sm leading-7 text-slate-600">
          <p>هر فروش موفق شما (تماسی که در سیستم با مبلغ پیشنهادی ثبت و نهایی می‌شود) در فروش ماهانه‌تان حساب می‌شود. با رسیدن فروش ماه به آستانه هر سطح، سطح حساب‌تان <b>خودکار</b> ارتقا پیدا می‌کند و نرخ درآمد پروژه‌ای‌تان بیشتر می‌شود؛ از ۵ میلیون تومان در سطح برنزی تا <b>۲۰ میلیون تومان به‌ازای هر پروژه</b> در سطح الماس.</p>
          <p>رتبه‌بندی ماهانه و «کارشناس فروش برتر هفته» برای همه اپراتورها نمایش داده می‌شود تا رقابت سالم و انگیزه رشد همیشه زنده باشد. مدیر مجموعه هم می‌تواند در شرایط خاص، سطح یک اپراتور را به‌صورت دستی تنظیم کند.</p>
          <p>فراموش نکنید: در مدل درآمدی دوم، با ۱۰ فروش موفق تا ۸۰ میلیون تومان درآمد ممکن است — و با ارتقای سطح در لیگ، این سقف بالاتر هم می‌رود. فروش واقعی، درآمد واقعی، فرصت رشد واقعی.</p>
        </div>
        {manager && <p className="mt-3 text-xs text-slate-400">نکته مدیر: تغییر سطح از ستون آخر جدول انجام می‌شود؛ «خودکار» یعنی سطح از روی فروش ماه محاسبه شود.</p>}
      </Card>
    </div>
  );
}
