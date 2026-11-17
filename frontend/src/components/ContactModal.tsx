'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Modal } from './ui/modal';
import { JalaliDatePicker } from './ui/datepicker';
import { MoneyInput } from './ui/money-input';
import { CalendarClock } from 'lucide-react';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  leadId: string;
  onSuccess: () => void;
}

export function ContactModal({ open, onClose, leadId, onSuccess }: ContactModalProps) {
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!meetingDate || !meetingTime) {
      setError('برای مشتری تأییدشده، ثبت «تایم جلسه» (تاریخ و ساعت) الزامی است');
      setLoading(false);
      return;
    }
    const meetingAt = new Date(`${meetingDate}T${meetingTime}:00`).toISOString();
    try {
      await api.patch(`/leads/${leadId}/contact`, {
        contactNote: note || null,
        suggestedAmount: amount ? Number(amount) : null,
        meetingAt,
      });
      onSuccess();
      onClose();
      setNote('');
      setAmount('');
      setMeetingDate('');
      setMeetingTime('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'خطا در ثبت تماس');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="ثبت تماس با مشتری">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات نتیجه تماس</label>
          <textarea
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="مثل: مشتری علاقه‌مند است، از قیمت راضی نیست، ..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">مبلغ پیشنهادی (اختیاری)</label>
          <div className="flex items-center gap-2">
            <MoneyInput value={amount} onChange={setAmount} placeholder="0" />
            <span className="shrink-0 text-sm text-gray-500">تومان</span>
          </div>
        </div>
        <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4">
          <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
            <CalendarClock className="h-4 w-4 text-brand-600" /> تایم جلسه با مشتری تأییدشده *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <JalaliDatePicker value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} placeholder="تاریخ جلسه (شمسی)" />
            <Input type="time" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} />
          </div>
          <p className="mt-2 text-[11px] leading-5 text-slate-500">سیستم خودکار بررسی می‌کند که یک ساعت قبل و بعد از این تایم، جلسه دیگری ثبت نشده باشد؛ در صورت تداخل اجازه ثبت نمی‌دهد. جلسه برای مدیریت هم ثبت و نمایش داده می‌شود.</p>
        </div>
        {error && <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">{error}</div>}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            لغو
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'در حال ثبت...' : 'تایید ثبت تماس'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
