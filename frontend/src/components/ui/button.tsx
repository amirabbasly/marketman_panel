import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
}

export function Button({ className, variant = 'primary', disabled, ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[.98]';
  const variants: Record<string, string> = {
    primary: 'bg-gradient-to-l from-brand-500 to-teal-600 text-white shadow-glow hover:brightness-110',
    ghost: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-gradient-to-l from-rose-500 to-red-500 text-white shadow-md shadow-rose-500/25 hover:brightness-110',
    outline: 'border border-slate-300 bg-white text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50',
  };
  return <button className={twMerge(base, variants[variant], className)} disabled={disabled} {...props} />;
}
