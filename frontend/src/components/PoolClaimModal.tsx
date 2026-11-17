'use client';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BellRing, Check, X } from 'lucide-react';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { Button } from './ui/button';

export default function PoolClaimModal() {
  const pathname = usePathname();
  const router = useRouter();
  const [lead, setLead] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const dismissed = useCallback((): string[] => {
    try { return JSON.parse(sessionStorage.getItem('mm_dismissed_pool') || '[]'); } catch { return []; }
  }, []);

  const poll = useCallback(() => {
    const u = getUser();
    if (!u || u.role !== 'OPERATOR') return;
    api.get('/leads/pool').then((r) => {
      const skip = dismissed();
      const next = (r.data.leads || []).find((l: any) => !skip.includes(l.id));
      setLead((prev: any) => prev || next || null);
    }).catch(() => {});
  }, [dismissed]);

  useEffect(() => {
    poll();
    const t = setInterval(poll, 30000);
    return () => clearInterval(t);
  }, [poll, pathname]);

  if (!lead) return null;

  const dismiss = () => {
    const skip = dismissed();
    skip.push(lead.id);
    sessionStorage.setItem('mm_dismissed_pool', JSON.stringify(skip));
    setLead(null);
    setMsg('');
    setTimeout(poll, 300);
  };

  const claim = async () => {
    setBusy(true); setMsg('');
    try {
      await api.post(`/leads/${lead.id}/claim`);
      setLead(null);
      router.push('/my-customers');
      router.refresh();
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'خطا در قبول مشتری');
      if (err.response?.status === 409) { setLead(null); setTimeout(poll, 400); }
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="fixed inset-0 animate-fade-in bg-ink-950/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg animate-scale-in overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="bg-gradient-to-l from-brand-500 to-teal-600 px-6 py-4 text-white">
          <p className="flex items-center gap-2 font-black"><BellRing className="h-5 w-5 animate-pulse" /> مشتری آزاد جدید!</p>
          <p className="mt-1 text-xs text-white/80">این مشتری برای همه اپراتورها ارسال شده است؛ هرکس زودتر قبول کند، مشتری اختصاصی او می‌شود.</p>
        </div>
        <div className="space-y-2.5 px-6 py-5 text-sm">
          <Row k="نام برند" v={lead.brandName} />
          <Row k="نام شخص" v={lead.personName} />
          <Row k="شماره تماس" v={lead.phone} />
          <Row k="شهر" v={lead.city || '—'} />
          <Row k="حوزه فعالیت" v={lead.businessArea} />
          <Row k="آدرس" v={lead.address} />
          {lead.description && <Row k="توضیحات" v={lead.description} />}
          {msg && <p className="rounded-xl bg-rose-50 px-3 py-2 text-rose-700 ring-1 ring-rose-200">{msg}</p>}
        </div>
        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <Button onClick={claim} disabled={busy} className="flex-1 py-3"><Check className="h-4 w-4" />{busy ? 'در حال ثبت…' : 'قبول می‌کنم — مشتری من شود'}</Button>
          <Button variant="outline" onClick={dismiss} className="py-3"><X className="h-4 w-4" />فعلاً نه</Button>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return <div className="flex items-start justify-between gap-4"><span className="shrink-0 text-slate-400">{k}</span><span className="text-left font-bold text-slate-800">{v}</span></div>;
}
