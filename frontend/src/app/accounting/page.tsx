'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { isManager } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { JalaliDatePicker } from '@/components/ui/datepicker';
import { Calculator, TrendingUp, Users, Receipt, PiggyBank, FileText, Upload, Trash2, Landmark } from 'lucide-react';
import { formatJalaliDateTime } from '@/lib/jalali';
import { fmtMoney } from '@/lib/utils';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/+$/, '').replace(/\/api$/, '');

export default function AccountingPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', amount: '', category: '', description: '', expenseDate: '' });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = () => api.get('/accounting/summary').then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => {
    if (!isManager()) { router.replace('/my-leads'); return; }
    load();
  }, [router]);

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title); fd.append('amount', form.amount);
      if (form.category) fd.append('category', form.category);
      if (form.description) fd.append('description', form.description);
      if (form.expenseDate) fd.append('expenseDate', form.expenseDate);
      if (file) fd.append('invoice', file);
      await api.post('/accounting/expenses', fd);
      setForm({ title: '', amount: '', category: '', description: '', expenseDate: '' }); setFile(null);
      load();
    } catch (err: any) { setError(err.response?.data?.error || 'خطا در ثبت هزینه'); }
    finally { setBusy(false); }
  };

  const issueInvoice = async (leadId: string) => {
    try { const r = await api.post(`/accounting/invoices/${leadId}`); alert(`فاکتور ${r.data.invoice.number} صادر شد.`); load(); }
    catch (err: any) { alert(err.response?.data?.error || 'خطا در صدور فاکتور'); }
  };
  const uploadInvoice = async (invoiceId: string, f: File) => {
    const fd = new FormData(); fd.append('invoice', f);
    try { await api.post(`/accounting/invoices/${invoiceId}/upload`, fd); load(); }
    catch (err: any) { alert(err.response?.data?.error || 'خطا در آپلود'); }
  };
  const delExpense = async (id: string) => {
    if (!confirm('حذف این هزینه؟')) return;
    try { await api.delete(`/accounting/expenses/${id}`); load(); } catch (e: any) { alert(e.response?.data?.error || 'خطا'); }
  };

  if (loading) return <div className="py-16 text-center text-slate-500">در حال بارگذاری حسابداری…</div>;
  if (!data) return null;
  const { summary, projects, expenses, invoices } = data;
  const invoicedLeadIds = new Set(invoices.map((i: any) => i.leadId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2"><Calculator className="h-6 w-6 text-brand-600" /> حسابداری</h1>
        <p className="page-subtitle">درآمد پروژه‌های تکمیل‌شده با قیمت نهایی مدیر محاسبه می‌شود؛ پورسانت تیم فروش از آن کسر می‌شود و هزینه‌ها و فاکتورها این‌جا مدیریت می‌شوند.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<TrendingUp className="h-5 w-5" />} color="bg-brand-500" title="درآمد کل (قیمت نهایی پروژه‌ها)" value={fmtMoney(summary.revenue)} />
        <Stat icon={<Users className="h-5 w-5" />} color="bg-amber-500" title="پورسانت تیم فروش (کسر از درآمد)" value={fmtMoney(summary.salesCommission)} />
        <Stat icon={<Receipt className="h-5 w-5" />} color="bg-rose-500" title="سایر هزینه‌های ثبت‌شده" value={fmtMoney(summary.totalExpenses)} />
        <Stat icon={<PiggyBank className="h-5 w-5" />} color="bg-violet-500" title="سود خالص" value={fmtMoney(summary.netProfit)} big />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        {/* ثبت هزینه */}
        <Card className="xl:col-span-2">
          <div className="border-b border-slate-100 px-6 py-4"><h3 className="font-black">ثبت هزینه جدید</h3></div>
          <form onSubmit={addExpense} className="space-y-3.5 p-6">
            {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>}
            <div><label className="mb-1 block text-xs font-bold text-slate-500">عنوان هزینه *</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثل: اجاره دفتر، تبلیغات…" required /></div>
            <div><label className="mb-1 block text-xs font-bold text-slate-500">مبلغ (تومان) *</label><MoneyInput value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-xs font-bold text-slate-500">دسته‌بندی</label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="اداری، بازاریابی…" /></div>
              <div><label className="mb-1 block text-xs font-bold text-slate-500">تاریخ هزینه (شمسی)</label><JalaliDatePicker value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} /></div>
            </div>
            <div><label className="mb-1 block text-xs font-bold text-slate-500">توضیحات</label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">آپلود فاکتور هزینه</label>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <Button type="submit" disabled={busy} className="w-full py-3">{busy ? 'در حال ثبت…' : 'ثبت هزینه'}</Button>
          </form>
          <div className="border-t border-slate-100">
            <p className="px-6 pt-4 text-sm font-black">هزینه‌های اخیر</p>
            <div className="max-h-80 overflow-auto p-3">
              {expenses.length ? expenses.map((e: any) => (
                <div key={e.id} className="flex items-center gap-2 rounded-2xl px-3 py-2.5 hover:bg-slate-50">
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{e.title}</p><p className="text-[11px] text-slate-400">{e.category || '—'} · {formatJalaliDateTime(e.expenseDate)}</p></div>
                  <span className="text-sm font-black text-rose-600">− {fmtMoney(e.amount)}</span>
                  {e.invoiceUrl && <a href={`${API_BASE}${e.invoiceUrl}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-sky-600">فاکتور</a>}
                  <button onClick={() => delExpense(e.id)} className="text-slate-300 hover:text-rose-500" aria-label="حذف هزینه"><Trash2 className="h-4 w-4" /></button>
                </div>
              )) : <p className="px-3 py-6 text-center text-sm text-slate-400">هزینه‌ای ثبت نشده است</p>}
            </div>
          </div>
        </Card>

        {/* پروژه‌های تکمیل‌شده و صدور فاکتور */}
        <Card className="xl:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="font-black">پروژه‌های تکمیل‌شده و فاکتور</h3>
            <Badge variant="info">{Number(summary.completedCount).toLocaleString('fa-IR')} پروژه · {Number(summary.invoicedCount).toLocaleString('fa-IR')} فاکتور صادرشده</Badge>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead><tr><th>پروژه</th><th>اپراتور</th><th>قیمت نهایی</th><th>پورسانت فروش</th><th>خالص شرکت</th><th>فاکتور</th></tr></thead>
              <tbody>
                {projects.map((l: any) => {
                  const inv = invoices.find((i: any) => i.leadId === l.id);
                  const net = l.finalPrice - (l.commission || 0);
                  return (
                    <tr key={l.id}>
                      <td><b>{l.brandName}</b><span className="block text-xs text-slate-400">{l.personName} · {l.city || '—'} · تکمیل: {formatJalaliDateTime(l.completedAt)}</span></td>
                      <td className="text-slate-600">{l.contactedBy ? `${l.contactedBy.firstName} ${l.contactedBy.lastName}` : (l.assignedTo ? `${l.assignedTo.firstName} ${l.assignedTo.lastName}` : '—')}</td>
                      <td className="whitespace-nowrap font-bold">{fmtMoney(l.finalPrice)}</td>
                      <td className="whitespace-nowrap text-amber-600">− {fmtMoney(l.commission || 0)}</td>
                      <td className="whitespace-nowrap font-black text-brand-700">{fmtMoney(net)}</td>
                      <td>
                        {inv ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="success"><FileText className="h-3 w-3" /> {inv.number}</Badge>
                            {inv.fileUrl ? <a href={`${API_BASE}${inv.fileUrl}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-sky-600">مشاهده</a>
                            : <label className="flex cursor-pointer items-center gap-1 text-xs font-bold text-slate-500 hover:text-brand-600"><Upload className="h-3.5 w-3.5" /> آپلود فاکتور<input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && uploadInvoice(inv.id, e.target.files[0])} /></label>}
                          </div>
                        ) : <Button className="px-3 py-1.5 text-xs" onClick={() => issueInvoice(l.id)}><FileText className="h-3.5 w-3.5" /> صدور فاکتور</Button>}
                      </td>
                    </tr>
                  );
                })}
                {!projects.length && <tr><td colSpan={6} className="py-10 text-center text-slate-400">هنوز پروژه تکمیل‌شده‌ای نیست</td></tr>}
              </tbody>
            </table>
          </div>

          {invoices.length > 0 && (
            <div className="border-t border-slate-100 px-6 py-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-black"><Landmark className="h-4 w-4 text-slate-400" /> فاکتورهای صادرشده</p>
              <div className="flex flex-wrap gap-2">
                {invoices.map((i: any) => <span key={i.id} className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-100">{i.number} — {i.lead?.brandName} · خالص: {fmtMoney(i.netAmount)}</span>)}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({ icon, color, title, value, big }: any) {
  return <Card className="p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-bold text-slate-400">{title}</p><p className={`mt-1 font-black text-slate-900 ${big ? 'text-xl text-violet-700' : 'text-lg'}`}>{value}</p></div><span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white ${color}`}>{icon}</span></div></Card>;
}
