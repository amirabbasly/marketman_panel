'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { isManager } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ListFilter, Trash2 } from 'lucide-react';
import { formatJalaliDateTime } from '@/lib/jalali';
import { fmtMoney } from '@/lib/utils';

const TABS = [
  { key: '', label: 'کل لیدها' },
  { key: 'NEW', label: 'جدید' },
  { key: 'CONTACTED', label: 'تماس گرفته‌شده' },
  { key: 'CANCELLED', label: 'لغوشده' },
];

const fa = (n: any) => Number(n || 0).toLocaleString('fa-IR');
const statusBadge = (s: string) => s === 'CONTACTED' ? <Badge variant="success">تماس گرفته‌شده</Badge> : s === 'CANCELLED' ? <Badge variant="danger">لغوشده</Badge> : <Badge variant="warning">جدید</Badge>;
const stageLabel = (s: string) => s === 'COMPLETED' ? 'تکمیل‌شده' : s === 'PENDING_APPROVAL' ? 'در تعلیق — مرحله نهایی' : s === 'REJECTED' ? 'ردشده' : '—';

export default function ListsPage() {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [leads, setLeads] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isManager()) { router.replace('/my-leads'); return; }
    setStatus(new URLSearchParams(window.location.search).get('status') || '');
  }, [router]);

  const load = () => {
    setLoading(true);
    const params: any = {};
    if (status) params.status = status;
    api.get('/leads', { params }).then((r) => setLeads(r.data.leads || [])).catch(() => {}).finally(() => setLoading(false));
    api.get('/leads').then((r) => {
      const all = r.data.leads || [];
      setCounts({ all: all.length, NEW: all.filter((l: any) => l.status === 'NEW').length, CONTACTED: all.filter((l: any) => l.status === 'CONTACTED').length, CANCELLED: all.filter((l: any) => l.status === 'CANCELLED').length });
    }).catch(() => {});
  };
  useEffect(load, [status]); // eslint-disable-line

  const del = async (l: any) => {
    if (!confirm(`حذف کامل «${l.brandName}» از همه لیست‌ها؟ قابل بازگشت نیست.`)) return;
    try { await api.delete(`/leads/${l.id}`); load(); } catch (e: any) { alert(e.response?.data?.error || 'خطا'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2"><ListFilter className="h-6 w-6 text-brand-600" /> لیست‌های مشتریان</h1>
        <p className="page-subtitle">نمای لیستی هر بخش از آمار صفحه اصلی — روی هر تب کلیک کنید تا همان لیست با جزئیات کامل نمایش داده شود.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setStatus(t.key)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${status === t.key ? 'bg-gradient-to-l from-brand-500 to-teal-600 text-white shadow-glow' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>
            {t.label}<span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${status === t.key ? 'bg-white/25' : 'bg-slate-100 text-slate-500'}`}>{fa(t.key ? counts[t.key] : counts.all)}</span>
          </button>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          {loading ? <div className="py-14 text-center text-slate-500">در حال بارگذاری…</div> : (
            <table>
              <thead><tr><th>برند / شخص</th><th>شهر · حوزه</th><th>تماس</th><th>وضعیت</th><th>مرحله پروژه</th><th>اپراتور</th><th>مبلغ</th><th>جلسه / تماس</th><th></th></tr></thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td><b className="text-slate-800">{l.brandName}</b><span className="block text-xs text-slate-400">{l.personName}</span></td>
                    <td className="text-slate-500">{l.city || '—'} · {l.businessArea}</td>
                    <td className="text-slate-500">{l.phone}</td>
                    <td>{statusBadge(l.status)}</td>
                    <td className="text-xs font-bold text-slate-600">{stageLabel(l.projectStage)}</td>
                    <td className="text-slate-600">{l.contactedBy ? `${l.contactedBy.firstName} ${l.contactedBy.lastName}` : (l.assignedTo ? `${l.assignedTo.firstName} ${l.assignedTo.lastName}` : '—')}</td>
                    <td className="whitespace-nowrap font-bold">{l.finalPrice ? fmtMoney(l.finalPrice) : (l.suggestedAmount ? fmtMoney(l.suggestedAmount) : '—')}</td>
                    <td className="whitespace-nowrap text-xs text-slate-500">{l.meetingAt ? `جلسه: ${formatJalaliDateTime(l.meetingAt)}` : (l.contactedAt ? formatJalaliDateTime(l.contactedAt) : '—')}</td>
                    <td><Button variant="ghost" className="px-2 py-1.5 text-rose-500 hover:bg-rose-50" onClick={() => del(l)}><Trash2 className="h-4 w-4" /></Button></td>
                  </tr>
                ))}
                {!leads.length && <tr><td colSpan={9} className="py-12 text-center text-slate-400">موردی در این لیست نیست</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
