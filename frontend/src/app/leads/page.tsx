'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { isManager } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadRow } from '@/components/LeadRow';
import { Search, Download } from 'lucide-react';
import Link from 'next/link';

if (typeof window !== 'undefined' && !isManager()) {
  window.location.href = '/my-leads';
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(() => ({ status: '', search: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('q') || '' : '', from: '', to: '' }));

  const [form, setForm] = useState({
    brandName: '', personName: '', address: '', city: '', businessArea: '', description: '', phone: '',
    assignmentMode: 'OPEN', assignedToId: '',
  });
  const [operators, setOperators] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLeads();
  }, [filters]);

  useEffect(() => {
    api.get('/users').then((r) => setOperators((r.data.users || []).filter((u: any) => u.role === 'OPERATOR' && u.isActive))).catch(() => {});
  }, []);

  const loadLeads = () => {
    api.get('/leads', { params: filters }).then((r) => {
      setLeads(r.data.leads || []);
      setLoading(false);
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await api.post('/leads', form);
      setForm({ brandName: '', personName: '', address: '', city: '', businessArea: '', description: '', phone: '', assignmentMode: 'OPEN', assignedToId: '' });
      loadLeads();
    } catch (err: any) {
      setError(err.response?.data?.error || 'خطا در ثبت لیست مشتریان');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این مشتری مطمئن هستید؟')) return;
    try {
      await api.delete(`/leads/${id}`);
      loadLeads();
    } catch (err: any) {
      alert(err.response?.data?.error || 'خطا در حذف');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">ثبت لیست مشتریان روزانه</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            const rows: any[][] = [['نام برند','نام شخص','شهر','حوزه فعالیت','آدرس','شماره تماس','وضعیت','مبلغ پیشنهادی','توضیحات تماس']];
            leads.forEach((l) => rows.push([l.brandName, l.personName, l.city || '', l.businessArea, l.address, l.phone, l.status, l.suggestedAmount || '', l.contactNote || '']));
            const csv = '\uFEFF' + rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = 'marketman-leads.csv'; a.click(); URL.revokeObjectURL(a.href);
          }}><Download className="h-4 w-4" />خروجی CSV</Button>
          <Link href="/operators"><Button variant="ghost">مدیریت اپراتورها</Button></Link>
        </div>
      </div>

      <Card>
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">افزودن مشتری جدید به لیست امروز</h3>
        </div>
        <div className="p-6">
          {error && <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">{error}</div>}
          <form onSubmit={handleCreate} className="space-y-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نام برند</label>
              <Input value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} placeholder="نام برند" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نام شخص</label>
              <Input value={form.personName} onChange={(e) => setForm({ ...form, personName: e.target.value })} placeholder="نام شخص" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">شهر / منطقه</label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="مثل: تهران، منطقه ۱" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">حوزه فعالیت</label>
              <Input value={form.businessArea} onChange={(e) => setForm({ ...form, businessArea: e.target.value })} placeholder="حوزه فعالیت" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">آدرس</label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="آدرس کامل" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="توضیحات تکمیلی (اختیاری)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">شماره تماس</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="۰۹۱۲۳۴۵۶۷۸۹" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">حالت اختصاص</label>
              <select value={form.assignmentMode} onChange={(e) => setForm({ ...form, assignmentMode: e.target.value })} className="w-full">
                <option value="OPEN">آزاد — ارسال برای همه اپراتورها (اولین قبول‌کننده)</option>
                <option value="ASSIGNED">اختصاصی — فقط یک اپراتور مشخص</option>
              </select>
            </div>
            {form.assignmentMode === 'ASSIGNED' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اپراتور مقصد</label>
                <select value={form.assignedToId} onChange={(e) => setForm({ ...form, assignedToId: e.target.value })} className="w-full" required>
                  <option value="">انتخاب اپراتور…</option>
                  {operators.map((o) => <option key={o.id} value={o.id}>{o.firstName} {o.lastName} — {o.phone}</option>)}
                </select>
              </div>
            )}
            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" className="w-auto" disabled={creating}>
                {creating ? 'در حال ثبت...' : 'ثبت مشتری'}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      <Card>
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-gray-900">لیست مشتریان ثبت شده</h3>
          <div className="flex gap-4 w-full md:w-auto">
            <Input
              placeholder="جستجو برند، شخص، شماره تماس، حوزه..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              leftIcon={<Search className="w-4 h-4" />}
              className="w-full md:w-72"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">تمام وضعیت‌ها</option>
              <option value="NEW">جدید</option>
              <option value="CONTACTED">تماس گرفته شده</option>
              <option value="CANCELLED">لغو شده</option>
            </select>
            <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
            <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          </div>
        </div>
        <div className="overflow-x-auto p-6">
          {loading ? (
            <div className="text-center py-10">در حال بارگذاری...</div>
          ) : leads.length ? (
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">نام برند</th>
                  <th className="px-4 py-3 font-medium text-gray-600">نام شخص</th>
                  <th className="px-4 py-3 font-medium text-gray-600">شهر / منطقه</th>
                  <th className="px-4 py-3 font-medium text-gray-600">حوزه فعالیت</th>
                  <th className="px-4 py-3 font-medium text-gray-600">شماره تماس</th>
                  <th className="px-4 py-3 font-medium text-gray-600">وضعیت</th>
                  <th className="px-4 py-3 font-medium text-gray-600">مبلغ پیشنهادی</th>
                  <th className="px-4 py-3 font-medium text-gray-600">تماس گرفته توسط</th>
                  <th className="px-4 py-3 font-medium text-gray-600">زمان تماس</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <LeadRow key={lead.id} lead={lead} onUpdate={loadLeads} />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10 text-gray-500">مشتری ثبت نشده است</div>
          )}
        </div>
      </Card>
    </div>
  );
}
