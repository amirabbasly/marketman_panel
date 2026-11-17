import React from 'react';
import { twMerge } from 'tailwind-merge';

export function Badge({ className, variant = 'default', children }: { className?: string; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'; children: React.ReactNode }) {
  const variants: Record<string, string> = {
    default: 'bg-slate-100 text-slate-600 ring-slate-200',
    success: 'bg-brand-50 text-brand-700 ring-brand-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    danger: 'bg-rose-50 text-rose-700 ring-rose-200',
    info: 'bg-sky-50 text-sky-700 ring-sky-200',
  };
  return <span className={twMerge('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1', variants[variant], className)}>{children}</span>;
}
