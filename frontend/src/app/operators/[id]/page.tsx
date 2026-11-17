'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { isManager } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { JalaliDatePicker } from '@/components/ui/datepicker';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatJalaliDateTime } from '@/lib/jalali';
import { fmtMoney } from '@/lib/utils';

if (typeof window !== 'undefined' && !isManager()) {
  window.location.href = '/my-leads';
}

export default function OperatorDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '', lastName: '', nationalId: '', phone: '', birthDate: '', isActive: true, email: '', password: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/users/${params.id}`).then((r) => {
      const u = r.data.user;
      setUser(u);
      setRequests(u.changeRequests || []);
      setForm({
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        nationalId: u.nationalId || '',
        phone: u.phone || '',
        birthDate: u.birthDate ? u.birthDate.slice(0, 10) : '',
        isActive: u.isActive,
        email: u.email || '',
        password: '',
      });
      setLoading(false);
    });
  }, [params.id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const fd = new FormData();
    fd.append('firstName', form.firstName);
    fd.append('lastName', form.lastName);
    fd.append('nationalId', form.nationalId);
    fd.append('phone', form.phone);
    fd.append('birthDate', form.birthDate);
    fd.append('isActive', String(form.isActive));
    fd.append('email', form.email);
    if (form.password) fd.append('password', form.password);
    if (file) fd.append('nationalIdPhoto', file);

    try {
      await api.patch(`/users/${params.id}`, fd);
      const r = await api.get(`/users/${params.id}`);
      const u = r.data.user;
      setUser(u);
      setRequests(u.changeRequests || []);
      setForm({ ...form, email: u.email || '', password: '', birthDate: u.birthDate ? u.birthDate.slice(0, 10) : '', isActive: u.isActive });
    } catch (err: any) {
      setError(err.response?.data?.error || 'خطا در به‌روزرسانی');
    } finally {
      setSaving(false);
    }
  };

  const handleReview = async (crId: string, approve: boolean) => {
    try {
      await api.patch(`/users/change-requests/${crId}/${approve ? 'approve' : 'reject'}`);
      const r = await api.get(`/users/${params.id}`);
      const u = r.data.user;
      setUser(u);
      setRequests(u.changeRequests || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'خطا در بررسی درخواست');
    }
  };

  if (loading) return <div className="text-center py-10">در حال بارگذاری...</div>;
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link href="/operators">
          <Button variant="ghost">بازگشت به لیست</Button>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant={user.isActive ? 'success' : 'danger'}>{user.isActive ? 'فعال' : 'غیرفعال'}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">ویرایش اطلاعات اپراتور</h3>
          </div>
          <div className="p-6">
            {error && <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">{error}</div>}
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">کد ملی</label>
                <Input value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">شماره تماس</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ تولد</label>
                <JalaliDatePicker value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} placeholder="تاریخ تولد (شمسی)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">فعالسازی حساب</label>
                <select
                  value={form.isActive ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="true">فعال</option>
                  <option value="false">غیرفعال</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عکس کارت ملی / شناسنامه (برای تغییر)</label>
                <input type="file" accept="image/*,application/pdf" className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام کاربری (ایمیل ورود)</label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@marketman.ir" />
                <p className="mt-1 text-[11px] text-gray-400">مدیر بدون نیاز به درخواست، مستقیم نام کاربری و رمز را تغییر می‌دهد. اپراتور با شماره تماس یا همین نام کاربری وارد می‌شود.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور جدید (خالی = بدون تغییر)</label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </Button>
            </form>
          </div>
        </Card>

        <Card className="lg:col-span-1">
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">مشخصات فعلی</h3>
            <div className="flex items-center gap-4 mb-6">
              {user.nationalIdPhoto ? (
                <img src={user.nationalIdPhoto} alt="شناسه" className="w-24 h-24 rounded-lg object-cover border border-gray-200" />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-600">کد ملی: {user.nationalId || '—'}</p>
                <p className="text-sm text-gray-600">تلفن: {user.phone || '—'}</p>
                <p className="text-sm text-gray-600">تاریخ تولد: {user.birthDate ? new Date(user.birthDate).toLocaleDateString('fa-IR') : '—'}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-900">درخواست‌های تغییر اطلاعات</h3>
        </div>
        <div className="overflow-x-auto p-6">
          {requests.length ? (
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">فیلد</th>
                  <th className="px-4 py-3 font-medium text-gray-600">مقدار قبل</th>
                  <th className="px-4 py-3 font-medium text-gray-600">مقدار جدید</th>
                  <th className="px-4 py-3 font-medium text-gray-600">وضعیت</th>
                  <th className="px-4 py-3 font-medium text-gray-600">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((cr) => (
                  <tr key={cr.id} className="border-b border-gray-100">
                    <td className="px-4 py-3">{cr.field}</td>
                    <td className="px-4 py-3 text-gray-600">{cr.oldValue}</td>
                    <td className="px-4 py-3 text-gray-600">{cr.newValue || cr.photoUrl || '—'}</td>
                    <td className="px-4 py-3"><Badge variant={cr.status === 'APPROVED' ? 'success' : cr.status === 'REJECTED' ? 'danger' : 'warning'}>{cr.status === 'PENDING' ? 'در انتظار' : cr.status === 'APPROVED' ? 'تایید شده' : 'رد شده'}</Badge></td>
                    <td className="px-4 py-3">
                      {cr.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => handleReview(cr.id, true)}>تایید</Button>
                          <Button variant="outline" onClick={() => handleReview(cr.id, false)}>رد</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-6 text-gray-500">درخواستی ثبت نشده است</div>
          )}
        </div>
      </Card>

      <OperatorCustomers operatorId={params.id} operatorName={`${user.firstName} ${user.lastName}`} />
    </div>
  );
}


const STATUS_TABS = [
  { key: '', label: 'همه مشتریان' },
  { key: 'CONTACTED', label: 'تأییدشده‌ها (تماس گرفته‌شده)' },
  { key: 'CANCELLED', label: 'کنسل‌شده‌ها' },
  { key: 'NEW', label: 'جدید / در انتظار' },
];

function OperatorCustomers({ operatorId, operatorName }: { operatorId: string; operatorName: string }) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });

  useEffect(() => {
    setLoading(true);
    const params: any = { operatorId };
    if (tab) params.status = tab;
    if (range.from) params.from = range.from;
    if (range.to) params.to = `${range.to}T23:59:59`;
    api.get('/leads', { params }).then((r) => setLeads(r.data.leads || [])).catch(() => {}).finally(() => setLoading(false));
  }, [operatorId, tab, range]);

  // گروه‌بندی بر اساس روز (تاریخ شمسی ثبت)
  const groups: Record<string, any[]> = {};
  for (const l of leads) {
    const day = new Date(l.createdAt).toLocaleDateString('fa-IR', { timeZone: 'Asia/Tehran', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    (groups[day] = groups[day] || []).push(l);
  }

  const stageFa = (l: any) => l.projectStage === 'COMPLETED' ? '✅ تکمیل‌شده' : l.projectStage === 'PENDING_APPROVAL' ? '⏳ در تعلیق — مرحله نهایی' : l.projectStage === 'REJECTED' ? 'ردشده' : '—';

  return (
    <Card>
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">مشتریان این اپراتور — {operatorName}</h3>
        <p className="mt-1 text-xs text-gray-400">همه مشتری‌هایی که به این اپراتور اختصاص داده شده یا با آن‌ها تماس گرفته است؛ به تفکیک روز و وضعیت. برای لیست کل مشتریان همه اپراتورها به «اختصاص مشتری» یا داشبورد مراجعه کنید.</p>
      </div>
      <div className="flex flex-wrap items-end gap-2 px-6 pt-4">
        {STATUS_TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${tab === t.key ? 'bg-gradient-to-l from-brand-500 to-teal-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t.label}{t.key === '' ? ` (${leads.length.toLocaleString('fa-IR')})` : ''}
          </button>
        ))}
        <div className="flex-1" />
        <label className="text-[11px] font-bold text-slate-500">از تاریخ<JalaliDatePicker value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} className="mt-1 w-44" /></label>
        <label className="text-[11px] font-bold text-slate-500">تا تاریخ<JalaliDatePicker value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} className="mt-1 w-44" /></label>
        {(range.from || range.to) && <Button variant="outline" className="py-2 text-xs" onClick={() => setRange({ from: '', to: '' })}>حذف فیلتر</Button>}
      </div>
      <div className="p-6 pt-3">
        {loading ? <div className="py-8 text-center text-gray-500">در حال بارگذاری...</div>
        : leads.length ? Object.entries(groups).map(([day, rows]) => (
          <div key={day} className="mb-5">
            <p className="mb-2 flex items-center gap-2 text-xs font-black text-slate-500"><span className="h-px flex-1 bg-slate-100" />{day} — {rows.length.toLocaleString('fa-IR')} مشتری<span className="h-px flex-1 bg-slate-100" /></p>
            <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-100">
              <table>
                <thead><tr><th>برند / شخص</th><th>شهر · حوزه</th><th>تلفن</th><th>وضعیت</th><th>مرحله پروژه</th><th>مبلغ</th><th>جلسه</th><th>جزئیات تماس</th></tr></thead>
                <tbody>
                  {rows.map((l) => (
                    <tr key={l.id}>
                      <td><b>{l.brandName}</b><span className="block text-xs text-gray-400">{l.personName}</span></td>
                      <td className="text-gray-500">{l.city || '—'} · {l.businessArea}</td>
                      <td className="text-gray-500">{l.phone}</td>
                      <td><Badge variant={l.status === 'CONTACTED' ? 'success' : l.status === 'CANCELLED' ? 'danger' : 'warning'}>{l.status === 'CONTACTED' ? 'تأیید / تماس گرفته‌شده' : l.status === 'CANCELLED' ? 'کنسل‌شده' : 'جدید'}</Badge></td>
                      <td className="text-xs font-bold">{stageFa(l)}</td>
                      <td className="whitespace-nowrap font-bold">{l.finalPrice ? fmtMoney(l.finalPrice) : (l.suggestedAmount ? fmtMoney(l.suggestedAmount) : '—')}</td>
                      <td className="whitespace-nowrap text-xs">{l.meetingAt ? formatJalaliDateTime(l.meetingAt) : '—'}</td>
                      <td className="max-w-[220px] text-xs text-gray-500">{l.contactedAt ? `${formatJalaliDateTime(l.contactedAt)}${l.contactNote ? ` — ${l.contactNote}` : ''}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )) : <div className="py-8 text-center text-gray-500">برای این اپراتور در این فیلتر مشتری‌ای ثبت نشده است</div>}
      </div>
    </Card>
  );
}
