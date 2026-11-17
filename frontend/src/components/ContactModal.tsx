'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Modal } from './ui/modal';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  leadId: string;
  onSuccess: () => void;
}

export function ContactModal({ open, onClose, leadId, onSuccess }: ContactModalProps) {
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.patch(`/leads/${leadId}/contact`, {
        contactNote: note || null,
        suggestedAmount: amount ? Number(amount) : null,
      });
      onSuccess();
      onClose();
      setNote('');
      setAmount('');
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
          <div className="relative">
            <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 text-sm">تومان</span>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-10"
            />
          </div>
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
