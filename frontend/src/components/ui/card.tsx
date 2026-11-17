import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({
  className,
  children,
  ...props
}: { className?: string; children: React.ReactNode; [key: string]: any }) {
  return (
    <div
      className={twMerge('rounded-xl border border-gray-200 bg-white shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
}
