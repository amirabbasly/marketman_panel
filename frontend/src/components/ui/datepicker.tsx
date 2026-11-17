'use client';
import { useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronRight, ChevronLeft, X } from 'lucide-react';
import {
  JALALI_MONTHS, faNum, gregorianIsoToJalali, gregorianIsoToJalaliText,
  jalaliMonthLength, jalaliToGregorianIso, todayJalali, toGregorian,
} from '@/lib/jalali';

interface Props {
  value?: string | null; // میلادی ISO: 2026-11-17
  onChange: (e: { target: { value: string } }) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

/** انتخاب تاریخ کاملاً شمسی — مقدار ورودی/خروجی میلادی ISO است تا با API سازگار بماند */
export function JalaliDatePicker({ value, onChange, placeholder = 'انتخاب تاریخ شمسی', className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = gregorianIsoToJalali(value || null);
  const today = todayJalali();
  const [view, setView] = useState(() => selected || today);

  useEffect(() => { if (selected) setView(selected); /* eslint-disable-next-line */ }, [value]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const emit = (iso: string) => onChange({ target: { value: iso } });
  const pick = (jd: number) => { emit(jalaliToGregorianIso(view.jy, view.jm, jd)); setOpen(false); };
  const moveMonth = (delta: number) => setView((v) => {
    let jm = v.jm + delta, jy = v.jy;
    if (jm < 1) { jm = 12; jy -= 1; } if (jm > 12) { jm = 1; jy += 1; }
    return { jy, jm, jd: 1 };
  });

  const len = jalaliMonthLength(view.jy, view.jm);
  const firstGregorian = toGregorian(view.jy, view.jm, 1);
  const firstWeekday = new Date(firstGregorian.gy, firstGregorian.gm - 1, firstGregorian.gd).getDay(); // 0=Sun
  const startOffset = (firstWeekday + 1) % 7; // هفته از شنبه
  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: len }, (_, i) => i + 1)];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button type="button" onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15">
        <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
        <span className={value ? 'font-bold' : 'text-slate-400'}>{value ? gregorianIsoToJalaliText(value) : placeholder}</span>
        {value && (
          <span role="button" tabIndex={0} aria-label="حذف تاریخ" className="mr-auto text-slate-300 hover:text-rose-500"
            onClick={(e) => { e.stopPropagation(); emit(''); }}>{<X className="h-4 w-4" />}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-[120] w-[300px] animate-scale-in rounded-2xl border border-slate-200 bg-white p-3 shadow-card">
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => moveMonth(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100" aria-label="ماه قبل"><ChevronRight className="h-4 w-4" /></button>
            <div className="flex items-center gap-2">
              <select value={view.jm} onChange={(e) => setView({ ...view, jm: Number(e.target.value), jd: 1 })} className="px-2 py-1 text-xs font-bold">
                {JALALI_MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
              <select value={view.jy} onChange={(e) => setView({ ...view, jy: Number(e.target.value), jd: 1 })} className="px-2 py-1 text-xs font-bold" aria-label="سال شمسی">
                {/* از سال ۱۳۷۰ تا امروز — هر سال شمسی به‌صورت دقیق */}
                {Array.from({ length: today.jy - 1370 + 1 }, (_, i) => today.jy - i).map((y) => <option key={y} value={y}>{faNum(y)}</option>)}
              </select>
            </div>
            <button type="button" onClick={() => moveMonth(1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100" aria-label="ماه بعد"><ChevronLeft className="h-4 w-4" /></button>
          </div>

          <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
            {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((d) => <span key={d} className="py-1">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((d, i) => d === null ? <span key={`x${i}`} /> : (
              <button key={d} type="button" onClick={() => pick(d)}
                className={`rounded-lg py-1.5 text-xs font-bold transition ${
                  selected && selected.jy === view.jy && selected.jm === view.jm && selected.jd === d
                    ? 'bg-gradient-to-l from-brand-500 to-teal-600 text-white shadow'
                    : today.jy === view.jy && today.jm === view.jm && today.jd === d
                      ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-300'
                      : 'text-slate-600 hover:bg-slate-100'}`}>
                {faNum(d)}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => { setView(today); emit(jalaliToGregorianIso(today.jy, today.jm, today.jd)); setOpen(false); }}
            className="mt-2 w-full rounded-lg bg-slate-50 py-1.5 text-[11px] font-bold text-slate-500 transition hover:bg-brand-50 hover:text-brand-700">
            امروز: {gregorianIsoToJalaliText(jalaliToGregorianIso(today.jy, today.jm, today.jd))}
          </button>
        </div>
      )}
    </div>
  );
}
