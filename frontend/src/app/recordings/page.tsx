'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isManager } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Construction, Mic, Play, Pause, Search, PhoneIncoming, PhoneOutgoing, Volume2 } from 'lucide-react';
import { faNum } from '@/lib/jalali';

// داده نمایشی تا زمان اتصال ماژول ضبط واقعی
const SAMPLE = [
  { id: 1, operator: 'سارا رضایی', customer: 'برند نمونه — آقای محمدی', phone: '۰۹۱۲•••۴۵۶۷', when: 'امروز — ۱۰:۲۴', dur: '۰۴:۳۲', dir: 'out' },
  { id: 2, operator: 'علی کریمی', customer: 'برند نمونه — خانم احمدی', phone: '۰۹۳۵•••۸۹۰۱', when: 'امروز — ۰۹:۰۵', dur: '۰۲:۴۷', dir: 'in' },
  { id: 3, operator: 'سارا رضایی', customer: 'برند نمونه — آقای حسینی', phone: '۰۹۱۹•••۲۳۴۵', when: 'دیروز — ۱۵:۴۱', dur: '۰۶:۱۲', dir: 'out' },
  { id: 4, operator: 'مریم صادقی', customer: 'برند نمونه — خانم رضوانی', phone: '۰۹۱۲•••۶۷۸۹', when: 'دیروز — ۱۱:۱۸', dur: '۰۱:۵۸', dir: 'out' },
];

export default function RecordingsPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [query, setQuery] = useState('');
  const [playingId, setPlayingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isManager()) { router.replace('/my-leads'); return; }
    setChecked(true);
  }, [router]);
  if (!checked) return null;

  const rows = SAMPLE.filter((r) => `${r.operator} ${r.customer}`.includes(query));

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-3xl bg-amber-50 px-5 py-4 ring-1 ring-amber-200">
        <Construction className="mt-0.5 h-6 w-6 shrink-0 text-amber-500" />
        <div>
          <p className="font-black text-amber-800">این ماژول در حال تکمیل است</p>
          <p className="text-sm text-amber-700">ضبط و آرشیو صدای تماس‌ها (صدای مشتری و اپراتور) به‌زودی به پنل متصل می‌شود. در حال حاضر این صفحه صرفاً نمایشی (UI) است و موارد زیر نمونه هستند.</p>
        </div>
      </div>

      <div>
        <h1 className="page-title flex items-center gap-2"><Mic className="h-6 w-6 text-rose-500" /> ضبط صدا — آرشیو تماس‌ها</h1>
        <p className="page-subtitle">مدیر از این بخش می‌تواند مکالمات اپراتورها با مشتریان را گوش بدهد، دانلود کند و برای کنترل کیفیت استفاده کند.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat title="تماس ضبط‌شده امروز" value="—" />
        <Stat title="مجموع مدت مکالمات" value="—" />
        <Stat title="اپراتور فعال در تماس" value="—" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 md:flex-row md:items-center">
          <h3 className="font-black text-slate-900">لیست تماس‌های ضبط‌شده <Badge variant="warning" className="mr-1">نمونه نمایشی</Badge></h3>
          <div className="flex-1" />
          <Input placeholder="جستجو اپراتور یا مشتری…" value={query} onChange={(e) => setQuery(e.target.value)} leftIcon={<Search className="h-4 w-4" />} className="md:max-w-xs" />
        </div>
        <div className="divide-y divide-slate-50">
          {rows.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <button
                onClick={() => setPlayingId(playingId === r.id ? null : r.id)}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow transition active:scale-95 ${playingId === r.id ? 'bg-rose-500' : 'bg-gradient-to-l from-brand-500 to-teal-600 shadow-glow'}`}
                aria-label={playingId === r.id ? 'توقف' : 'پخش (نمایشی)'}
              >
                {playingId === r.id ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-slate-800">{r.customer}</p>
                <p className="text-xs text-slate-400">اپراتور: {r.operator} · {r.phone} · {r.when}</p>
                {/* موج صدای نمایشی */}
                <div className="mt-2 flex h-6 items-center gap-[3px]" dir="ltr">
                  {Array.from({ length: 42 }).map((_, i) => (
                    <span key={i} className={`w-[3px] rounded-full transition-all ${playingId === r.id ? 'animate-pulse bg-brand-500' : 'bg-slate-200'}`} style={{ height: `${6 + ((i * 7) % 16)}px` }} />
                  ))}
                  <span className="mr-2 flex items-center gap-1 text-[11px] font-bold text-slate-400"><Volume2 className="h-3.5 w-3.5" />{r.dur}</span>
                </div>
              </div>
              <Badge variant={r.dir === 'out' ? 'info' : 'success'}>{r.dir === 'out' ? <><PhoneOutgoing className="h-3 w-3" /> تماس خروجی</> : <><PhoneIncoming className="h-3 w-3" /> تماس ورودی</>}</Badge>
              <Button variant="outline" disabled className="px-3 py-2 text-xs opacity-60">دانلود — به‌زودی</Button>
            </div>
          ))}
          {!rows.length && <p className="px-5 py-10 text-center text-sm text-slate-400">موردی یافت نشد</p>}
        </div>
      </Card>

      <p className="text-center text-xs text-slate-400">با فعال‌شدن ماژول، فایل صوتی هر تماس به‌صورت خودکار کنار همان مشتری در سیستم ذخیره و این‌جا قابل پخش می‌شود.</p>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return <Card className="p-5"><p className="text-xs font-bold text-slate-400">{title}</p><p className="mt-1 text-2xl font-black text-slate-800">{faNum(value)}</p></Card>;
}
