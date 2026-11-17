'use client';
import React from 'react';

/** ورودی مبلغ: هنگام تایپ، عدد سه‌رقم سه‌رقم با کاما جدا می‌شود؛ مقدار خام (فقط رقم) برمی‌گردد */
export function MoneyInput({ value, onChange, placeholder = '۰', className = '' }: {
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const display = value ? Number(value).toLocaleString('en-US') : '';
  return (
    <input
      inputMode="numeric"
      dir="ltr"
      className={`block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-left text-sm font-bold text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 ${className}`}
      placeholder={placeholder}
      value={display}
      onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, '').slice(0, 15))}
    />
  );
}
