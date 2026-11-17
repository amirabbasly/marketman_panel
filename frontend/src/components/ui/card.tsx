import React from 'react';
import { twMerge } from 'tailwind-merge';

export function Card({ className, children, ...props }: { className?: string; children: React.ReactNode; [key: string]: any }) {
  return (
    <div className={twMerge('overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-soft', className)} {...props}>
      {children}
    </div>
  );
}
