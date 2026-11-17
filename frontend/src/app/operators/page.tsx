'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { isManager } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Search } from 'lucide-react';
import Link from 'next/link';

export default function OperatorsPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isManager()) {
      router.replace('/my-leads');
      return;
    }
    api.get('/users').then((r) => {
      setUsers(r.data.users || r.data);
      setLoading(false);
      setChecked(true);
    });
  }, [router]);

  if (!checked) return null;

  const filtered = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.nationalId || ''} ${u.phone || ''}`.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">مدیریت اپراتور‌ها</h1>
        </div>
        <Link href="/operators/create">
          <Button>افزودن اپراتور جدید</Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="جستجو با نام، کد ملی یا شماره تماس..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-10">در حال بارگذاری...</div>
        ) : filtered.length ? (
          filtered.map((u) => <OperatorCard key={u.id} u={u} />)
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">اپراتور یافت نشد</div>
        )}
      </div>
    </div>
  );
}

function OperatorCard({ u }: { u: any }) {
  return (
    <Card className="p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{u.firstName} {u.lastName}</p>
            <p className="text-xs text-gray-500">کد ملی: {u.nationalId || '—'}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          📞 {u.phone || '—'} | 📅 {formatDate(u.birthDate)}
        </p>
        <Badge variant={u.isActive ? 'success' : 'danger'}>
          {u.isActive ? 'فعال' : 'غیرفعال'}
        </Badge>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>درخواست‌های تغییر: {u._count?.changeRequests || 0}</span>
          <span>تماس‌ها: {u._count?.contactedLeads || 0}</span>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Link href={`/operators/${u.id}`} className="flex-1">
          <Button variant="outline" className="w-full py-2 text-sm">
            مشاهده و ویرایش
          </Button>
        </Link>
      </div>
    </Card>
  );
}
