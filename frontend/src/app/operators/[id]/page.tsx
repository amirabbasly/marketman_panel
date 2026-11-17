'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { isManager } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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
    firstName: '', lastName: '', nationalId: '', phone: '', birthDate: '', isActive: true,
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
    if (file) fd.append('nationalIdPhoto', file);

    try {
      await api.patch(`/users/${params.id}`, fd);
      const r = await api.get(`/users/${params.id}`);
      const u = r.data.user;
      setUser(u);
      setRequests(u.changeRequests || []);
      setForm({ ...form, birthDate: u.birthDate ? u.birthDate.slice(0, 10) : '', isActive: u.isActive });
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
                <Input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
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
    </div>
  );
}
