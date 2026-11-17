'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function ChangeRequestPage() {
  const router = useRouter();
  const [field, setField] = useState('');
  const [newValue, setNewValue] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  const fields = [
    { key: 'firstName', label: 'نام' },
    { key: 'lastName', label: 'نام خانوادگی' },
    { key: 'nationalId', label: 'کد ملی' },
    { key: 'phone', label: 'شماره تماس' },
    { key: 'birthDate', label: 'تاریخ تولد' },
    { key: 'nationalIdPhoto', label: 'عکس کارت ملی / شناسنامه' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData();
    fd.append('field', field);
    if (field === 'nationalIdPhoto') {
      if (!file) { setError('فایل را انتخاب کنید'); setLoading(false); return; }
      fd.append('nationalIdPhoto', file);
    } else {
      fd.append('newValue', newValue);
    }

    try {
      await api.post('/users/change-requests', fd);
      setOk(true);
      setTimeout(() => router.replace('/profile'), 1200);
    } catch (err: any) {
      setError(err.response?.data?.error || 'خطا در ثبت درخواست');
    } finally {
      setLoading(false);
    }
  };

  if (ok) {
    return (
      <Card className="max-w-md mx-auto py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">درخواست با موفقیت ثبت شد</h3>
        <p className="text-gray-600 mt-2">مدیر در اسرع وقت درخواست شما را بررسی خواهد کرد.</p>
        <Link href="/profile" className="mt-4 inline-block text-sm text-emerald-600 hover:underline">بازگشت به پروفایل</Link>
      </Card>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Link href="/profile" className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900">← بازگشت</Link>
      <Card>
        <div className="px-8 py-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">درخواست تغییر اطلاعات شخصی</h2>
          {error && <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">فیلد مورد نظر برای تغییر</label>
              <select
                value={field}
                onChange={(e) => {
                  setField(e.target.value);
                  setNewValue('');
                }}
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">انتخاب کنید...</option>
                {fields.map((f) => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
            </div>
            {field && field !== 'nationalIdPhoto' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">مقدار جدید</label>
                <Input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="مقدار جدید را وارد کنید" />
              </div>
            )}
            {field === 'nationalIdPhoto' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">فایل جدید</label>
                <input type="file" accept="image/*,application/pdf" className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>
            )}
            {field === 'birthDate' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ تولد جدید</label>
                <Input type="date" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
              </div>
            )}
            <p className="text-xs text-gray-500">بعد از ثبت، مدیر درخواست را بررسی و تایید یا رد می‌کند.</p>
            <Button type="submit" className="w-full" disabled={loading || !field || (!newValue && !file)}>
              {loading ? 'در حال ثبت...' : 'ثبت درخواست'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
