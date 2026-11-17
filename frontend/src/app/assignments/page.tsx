'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { isManager } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shuffle, UserCheck, Megaphone, Send } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function AssignmentsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'ASSIGNED' | 'OPEN'>('ASSIGNED');
  const [operators, setOperators] = useState<any[]>([]);
  const [openLeads, setOpenLeads] = useState<any[]>([]);
  const [assignedLeads, setAssignedLeads] = useState<any[]>([]);
  const [form, setForm] = useState({ brandName: '', personName: '', address: '', city: '', businessArea: '', description: '', phone: '', assignedToId: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const load = () => {
    api.get('/leads', { params: { mode: 'open' } }).then((r) => setOpenLeads(r.data.leads || [])).catch(() => {});
    api.get('/leads', { params: { mode: 'assigned' } }).then((r) => setAssignedLeads(r.data.leads || [])).catch(() => {});
  };
  const [q, setQ] = useState('');
  useEffect(() => { setQ(new URLSearchParams(window.location.search).get('q') || ''); }, []);
  const matchesQ = (l: any) => !q || `${l.brandName} ${l.personName} ${l.phone} ${l.businessArea} ${l.city || ''}`.includes(q);
  useEffect(() => {
    if (!isManager()) { router.replace('/my-customers'); return; }
    api.get('/users').then((r) => setOperators((r.data.users || []).filter((u: any) => u.role === 'OPERATOR' && u.isActive))).catch(() => {});
    load();
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setOk(''); setBusy(true);
    try {
      await api.post('/leads', { ...form, assignmentMode: tab, assignedToId: tab === 'ASSIGNED' ? form.assignedToId : undefined });
      setOk(tab === 'ASSIGNED' ? 'مشتری با موفقیت به اپراتور اختصاص داده شد.' : 'مشتری آزاد ثبت شد و درخواست آن برای همه اپراتورها ارسال شد؛ اولین اپراتوری که قبول کند، مشتری او می‌شود.');
      setForm({ brandName: '', personName: '', address: '', city: '', businessArea: '', description: '', phone: '', assignedToId: '' });
      load();
    } catch (err: any) { setError(err.response?.data?.error || 'خطا در ثبت مشتری'); }
    finally { setBusy(false); }
  };

  const reassign = async (leadId: string, operatorId: string) => {
    try { await api.patch(`/leads/${leadId}`, { assignmentMode: 'ASSIGNED', assignedToId: operatorId }); load(); }
    catch (err: any) { alert(err.response?.data?.error || 'خطا در اختصاص'); }
  };
  const releaseToPool = async (leadId: string) => {
    try { await api.patch(`/leads/${leadId}`, { assignmentMode: 'OPEN' }); load(); }
    catch (err: any) { alert(err.response?.data?.error || 'خطا'); }
  };

  const f = (k: string) => ({ value: (form as any)[k], onChange: (e: any) => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2"><Shuffle className="h-6 w-6 text-brand-600" /> اختصاص مشتری آزاد و اختصاصی</h1>
        <p className="page-subtitle">در حالت «اختصاصی» مشتری فقط برای اپراتور انتخاب‌شده ثبت می‌شود. در حالت «آزاد» درخواست به‌صورت مودال برای همه اپراتورها می‌رود و اولین نفری که قبول کند، مشتری برای او می‌شود.</p>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-200/70 p-1 sm:max-w-md">
        <button onClick={() => setTab('ASSIGNED')} className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition ${tab === 'ASSIGNED' ? 'bg-white text-brand-700 shadow' : 'text-slate-500'}`}><UserCheck className="h-4 w-4" /> اختصاص به اپراتور</button>
        <button onClick={() => setTab('OPEN')} className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition ${tab === 'OPEN' ? 'bg-white text-brand-700 shadow' : 'text-slate-500'}`}><Megaphone className="h-4 w-4" /> مشتری آزاد (همه اپراتورها)</button>
      </div>

      <Card>
        <div className="border-b border-slate-100 px-6 py-4"><h3 className="font-black text-slate-900">{tab === 'ASSIGNED' ? 'ثبت مشتری اختصاصی' : 'ثبت مشتری آزاد'}</h3></div>
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
          {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200 md:col-span-3">{error}</div>}
          {ok && <div className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700 ring-1 ring-brand-100 md:col-span-3">{ok}</div>}
          <Field label="نام برند *"><Input {...f('brandName')} placeholder="نام برند" /></Field>
          <Field label="نام شخص *"><Input {...f('personName')} placeholder="نام شخص" /></Field>
          <Field label="شماره تماس *"><Input {...f('phone')} placeholder="۰۹۱۲۳۴۵۶۷۸۹" /></Field>
          <Field label="شهر / منطقه"><Input {...f('city')} placeholder="مثل: تهران" /></Field>
          <Field label="حوزه فعالیت *"><Input {...f('businessArea')} placeholder="حوزه فعالیت" /></Field>
          {tab === 'ASSIGNED' && (
            <Field label="اپراتور مقصد *">
              <select value={form.assignedToId} onChange={(e) => setForm({ ...form, assignedToId: e.target.value })} className="w-full" required>
                <option value="">انتخاب اپراتور…</option>
                {operators.map((o) => <option key={o.id} value={o.id}>{o.firstName} {o.lastName} — {o.phone}</option>)}
              </select>
            </Field>
          )}
          <div className="md:col-span-2"><Field label="آدرس *"><Input {...f('address')} placeholder="آدرس کامل" /></Field></div>
          <Field label="توضیحات"><Input {...f('description')} placeholder="توضیحات (اختیاری)" /></Field>
          <div className="flex items-end md:col-span-3"><Button type="submit" disabled={busy} className="py-3"><Send className="h-4 w-4" />{busy ? 'در حال ثبت…' : tab === 'ASSIGNED' ? 'اختصاص به اپراتور' : 'ارسال آزاد برای همه اپراتورها'}</Button></div>
        </form>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4"><h3 className="font-black">مشتریان آزاد در انتظار قبول</h3><Badge variant="warning">{openLeads.length.toLocaleString('fa-IR')} مورد</Badge></div>
          <div className="max-h-96 overflow-auto">
            {openLeads.filter(matchesQ).length ? openLeads.filter(matchesQ).map((l) => (
              <div key={l.id} className="flex flex-wrap items-center gap-2 border-b border-slate-50 px-5 py-3 text-sm">
                <div className="min-w-0 flex-1"><p className="truncate font-bold">{l.brandName} — {l.personName}</p><p className="text-xs text-slate-400">{l.businessArea} · {l.city || '—'} · {formatDateTime(l.createdAt)}</p></div>
                <select defaultValue="" onChange={(e) => e.target.value && reassign(l.id, e.target.value)} className="py-1.5 text-xs"><option value="">اختصاص دستی به…</option>{operators.map((o) => <option key={o.id} value={o.id}>{o.firstName} {o.lastName}</option>)}</select>
              </div>
            )) : <p className="px-5 py-8 text-center text-sm text-slate-400">مشتری آزادِ در انتظاری نیست؛ همه قبول شده‌اند.</p>}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4"><h3 className="font-black">مشتریان اختصاص‌یافته</h3><Badge variant="success">{assignedLeads.length.toLocaleString('fa-IR')} مورد</Badge></div>
          <div className="max-h-96 overflow-auto">
            {assignedLeads.filter(matchesQ).length ? assignedLeads.filter(matchesQ).map((l) => (
              <div key={l.id} className="flex flex-wrap items-center gap-2 border-b border-slate-50 px-5 py-3 text-sm">
                <div className="min-w-0 flex-1"><p className="truncate font-bold">{l.brandName} — {l.personName}</p><p className="text-xs text-slate-400">اپراتور: <b className="text-slate-600">{l.assignedTo ? `${l.assignedTo.firstName} ${l.assignedTo.lastName}` : '—'}</b> · وضعیت: {l.status === 'NEW' ? 'جدید' : l.status === 'CONTACTED' ? 'تماس گرفته‌شده' : 'لغوشده'} · {formatDateTime(l.createdAt)}</p></div>
                {l.status === 'NEW' && <Button variant="outline" className="px-2.5 py-1.5 text-xs" onClick={() => releaseToPool(l.id)}>آزاد کردن</Button>}
              </div>
            )) : <p className="px-5 py-8 text-center text-sm text-slate-400">هنوز مشتری اختصاصی ثبت نشده است.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1.5 block text-sm font-bold text-slate-700">{label}</label>{children}</div>;
}
