import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
}

export function Input({ className, leftIcon, ...props }: InputProps) {
  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
          {leftIcon}
        </div>
      )}
      <input
        className={twMerge(
          'block w-full rounded-lg border border-gray-300 bg-white pr-10 pl-4 py-2.5 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
          leftIcon ? 'pl-11' : 'pl-4',
          className,
        )}
        {...props}
      />
    </div>
  );
}
