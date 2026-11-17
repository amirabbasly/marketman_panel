import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
}

export function Button({
  className,
  variant = 'primary',
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none';
  const variants: Record<string, string> = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
    ghost: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
    outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
  };
  return (
    <button
      className={twMerge(base, variants[variant], className)}
      disabled={disabled}
      {...props}
    />
  );
}
