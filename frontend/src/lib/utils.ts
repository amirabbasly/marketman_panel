import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toPersianDigits(num: number | string): string {
  return String(num).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
}

export function formatDate(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    NEW: 'جدید',
    CONTACTED: 'تماس گرفته شده',
    CANCELLED: 'لغو شده',
    PENDING: 'در انتظار تایید',
    APPROVED: 'تایید شده',
    REJECTED: 'رد شده',
  };
  return map[status] || status;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    NEW: 'bg-amber-100 text-amber-700',
    CONTACTED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
    PENDING: 'bg-blue-100 text-blue-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-rose-100 text-rose-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

/** نمایش عدد با جداکننده سه‌رقمی و ارقام فارسی: ۳۰٬۰۰۰٬۰۰۰ */
export function fmtNum(n: number | string | null | undefined): string {
  const v = Number(n || 0);
  return v.toLocaleString('fa-IR');
}
export function fmtMoney(n: number | string | null | undefined): string {
  return `${fmtNum(n)} تومان`;
}
