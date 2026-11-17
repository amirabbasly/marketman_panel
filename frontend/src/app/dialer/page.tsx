'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Delete, PhoneCall, Construction, Mic, Volume2, Pause } from 'lucide-react';

const KEYS = ['1','2','3','4','5','6','7','8','9','*','0','#'];
const faDigit = (d: string) => ('۰۱۲۳۴۵۶۷۸۹'.includes(d) || /\d/.test(d) ? String(d).replace(/\d/g, (x) => '۰۱۲۳۴۵۶۷۸۹'[+x]) : d);

export default function DialerPage() {
  const [number, setNumber] = useState('');
  const press = (k: string) => setNumber((n) => (n.replace(/\s/g, '').length >= 15 ? n : n + k));

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div className="flex items-start gap-3 rounded-3xl bg-amber-50 px-5 py-4 ring-1 ring-amber-200">
        <Construction className="mt-0.5 h-6 w-6 shrink-0 text-amber-500" />
        <div>
          <p className="font-black text-amber-800">ماژول در حال تکمیل است</p>
          <p className="text-sm text-amber-700">صفحه‌کلید شماره‌گیر به‌زودی فعال می‌شود و امکان تماس مستقیم از داخل پنل فراهم خواهد شد. در حال حاضر این صفحه صرفاً نمایشی (UI) است.</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-5 rounded-2xl bg-slate-50 px-4 py-5 text-center ring-1 ring-slate-100">
          <p dir="ltr" className="min-h-9 text-3xl font-black tracking-[0.2em] text-slate-900">{number ? faDigit(number) : <span className="text-base font-medium tracking-normal text-slate-400">شماره را وارد کنید…</span>}</p>
        </div>

        <div className="grid grid-cols-3 gap-2.5" dir="ltr">
          {KEYS.map((k) => (
            <button key={k} onClick={() => press(k)} className="rounded-2xl bg-slate-50 py-4 text-xl font-black text-slate-800 ring-1 ring-slate-100 transition hover:bg-brand-50 hover:text-brand-700 active:scale-95">
              {faDigit(k)}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <button disabled className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300" aria-label="بلندگو"><Volume2 className="h-5 w-5" /></button>
          <button disabled className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-l from-brand-500 to-teal-600 text-white opacity-50 shadow-glow" aria-label="تماس (به‌زودی)"><PhoneCall className="h-6 w-6" /></button>
          <button disabled className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300" aria-label="میکروفون"><Mic className="h-5 w-5" /></button>
          <button onClick={() => setNumber((n) => n.slice(0, -1))} className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600" aria-label="پاک کردن"><Delete className="h-5 w-5" /></button>
        </div>

        <Button disabled className="mt-5 w-full py-3 opacity-60"><Pause className="h-4 w-4" /> تماس — به‌زودی فعال می‌شود</Button>
      </Card>
    </div>
  );
}
