'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { isOperator } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { LeadRow } from '@/components/LeadRow';
import { Input } from '@/components/ui/input';
import { UserCheck, Search } from 'lucide-react';

export default function MyCustomersPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const load = () => {
    const params: any = { scope: 'exclusive' };
    if (search) params.search = search;
    if (status) params.status = status;
    api.get('/leads', { params }).then((r) => setLeads(r.data.leads || [])).catch(() => {}).finally(() => { setLoading(false); setChecked(true); });
  };
  useEffect(() => {
    if (!isOperator()) { router.replace('/assignments'); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, search, status]);

  if (!checked && loading) return null;

  const fresh = leads.filter((l) => l.status === 'NEW').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2"><UserCheck className="h-6 w-6 text-brand-600" /> مشتریان اختصاصی من</h1>
        <p className="page-subtitle">مشتری‌هایی که مدیر مستقیم به شما اختصاص داده یا از مشتریان آزاد قبول کرده‌اید؛ این لیست فقط برای شماست{fresh ? ` — ${fresh.toLocaleString('fa-IR')} مشتری در انتظار تماس دارید` : ''}.</p>
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 md:flex-row md:items-center">
          <div className="flex-1"><Input placeholder="جستجوی برند، شخص، شماره، شهر…" value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} /></div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">همه وضعیت‌ها</option><option value="NEW">جدید</option><option value="CONTACTED">تماس گرفته‌شده</option><option value="CANCELLED">لغوشده</option>
          </select>
        </div>
        <div className="overflow-x-auto p-2 sm:p-4">
          {loading ? <div className="py-12 text-center text-slate-500">در حال بارگذاری…</div>
          : leads.length ? (
            <table>
              <thead><tr><th>نام برند</th><th>نام شخص</th><th>شهر / منطقه</th><th>حوزه فعالیت</th><th>شماره تماس</th><th>وضعیت</th><th>مبلغ پیشنهادی</th><th>تماس توسط</th><th>زمان تماس</th><th>عملیات</th></tr></thead>
              <tbody>{leads.map((lead) => <LeadRow key={lead.id} lead={lead} onUpdate={load} />)}</tbody>
            </table>
          ) : <div className="py-12 text-center text-slate-400">هنوز مشتری اختصاصی ندارید؛ مشتریان آزاد از طریق درخواست‌هایی که روی صفحه می‌آید قابل قبول‌کردن هستند.</div>}
        </div>
      </Card>
    </div>
  );
}
