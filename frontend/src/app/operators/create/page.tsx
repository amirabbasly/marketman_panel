'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { isManager } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { JalaliDatePicker } from '@/components/ui/datepicker';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

if (typeof window !== 'undefined' && !isManager()) {
  window.location.href = '/my-leads';
}

export default function CreateOperatorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '', lastName: '', nationalId: '', phone: '', birthDate: '', password: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData();
    fd.append('firstName', form.firstName);
    fd.append('lastName', form.lastName);
    fd.append('nationalId', form.nationalId);
    fd.append('phone', form.phone);
    fd.append('birthDate', form.birthDate);
    fd.append('password', form.password);
    if (file) fd.append('nationalIdPhoto', file);

    try {
      await api.post('/users', fd);
      router.replace('/operators');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error || 'خطا در ایجاد اپراتور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/operators">
        <Button variant="ghost" className="mb-6">بازگشت به لیست اپراتورها</Button>
      </Link>
      <Card>
        <div className="px-8 py-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">افزودن اپراتور جدید</h2>
          {error && <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
              <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="نام" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
              <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="نام خانوادگی" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">کد ملی</label>
              <Input value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} placeholder="کد ملی" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">شماره تماس</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="۰۹۱۲۳۴۵۶۷۸۹" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ تولد</label>
              <JalaliDatePicker value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} placeholder="تاریخ تولد (شمسی)" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="رمز عبور" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">عکس کارت ملی / شناسنامه</label>
              <input type="file" accept="image/*,application/pdf" className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" className="w-auto" disabled={loading}>
                {loading ? 'در حال ثبت...' : 'ثبت اپراتور'}
              </Button>
            </div>
          </form>
          <p className="mt-4 text-xs text-gray-500">
            توجه: اپراتور تنها می‌تواند اطلاعات خود را ببیند و نمی‌تواند تغییر دهد؛ هر تغییر نیازمند تایید مدیر است.
          </p>
        </div>
      </Card>
    </div>
  );
}
