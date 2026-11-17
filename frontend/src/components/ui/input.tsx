import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
}

export function Input({ className, leftIcon, ...props }: InputProps) {
  return (
    <div className="relative">
      {leftIcon && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">{leftIcon}</div>
      )}
      <input
        className={twMerge(
          'block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-4 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15',
          leftIcon ? 'pr-11' : 'pr-4',
          className,
        )}
        {...props}
      />
    </div>
  );
}
