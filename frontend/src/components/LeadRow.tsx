'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ContactModal } from './ContactModal';
import { Modal } from './ui/modal';
import { PhoneCall } from 'lucide-react';

interface LeadRowProps {
  lead: any;
  onUpdate: () => void;
}

export function LeadRow({ lead, onUpdate }: LeadRowProps) {
  const [contactOpen, setContactOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleCancel = async () => {
    try {
      await api.patch(`/leads/${lead.id}/cancel`, { contactNote: cancelReason || null });
      setCancelOpen(false);
      setCancelReason('');
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.error || 'خطا در لغو لید');
    }
  };

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition">
        <td className="px-4 py-4 text-sm text-gray-900">{lead.brandName}</td>
        <td className="px-4 py-4 text-sm">{lead.personName}</td>
        <td className="px-4 py-4 text-sm text-gray-600">{lead.city || lead.address.split(',')[0] || lead.address}</td>
        <td className="px-4 py-4 text-sm text-gray-600">{lead.businessArea}</td>
        <td className="px-4 py-4 text-sm font-mono text-gray-500">{lead.phone}</td>
        <td className="px-4 py-4">
          <Badge variant={lead.status === 'CONTACTED' ? 'success' : lead.status === 'CANCELLED' ? 'danger' : 'warning'}>
            {lead.status === 'CONTACTED' ? 'تماس گرفته شده' : lead.status === 'CANCELLED' ? 'لغو شده' : 'جدید'}
          </Badge>
        </td>
        <td className="px-4 py-4 text-sm">
          {lead.suggestedAmount ? `${Number(lead.suggestedAmount).toLocaleString()} تومان` : '—'}
        </td>
        <td className="px-4 py-4 text-sm text-gray-500">{lead.contactedBy ? `${lead.contactedBy.firstName} ${lead.contactedBy.lastName}` : '—'}</td>
        <td className="px-4 py-4 text-sm text-gray-500">{formatDateTime(lead.contactedAt)}</td>
        <td className="px-4 py-4 text-right">
          {lead.status === 'NEW' && (
            <Button onClick={() => setContactOpen(true)} className="w-auto">
              <PhoneCall className="mr-1.5 w-4 h-4" /> تماس گرفتـم
            </Button>
          )}
          {lead.status === 'NEW' && (
            <Button variant="danger" onClick={() => setCancelOpen(true)} className="ml-2 w-auto">
              لغو
            </Button>
          )}
          {lead.status !== 'NEW' && (
            <Button variant="outline" disabled className="w-auto opacity-50 cursor-not-allowed">
              ثبت شده
            </Button>
          )}
        </td>
      </tr>

      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        leadId={lead.id}
        onSuccess={onUpdate}
      />

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="تایید لغو لید">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">دلیل لغو را بنویسید:</p>
          <textarea
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="مثل: مشتری تمایل به خرید ندارد، ..."
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setCancelOpen(false)}>
              بستن
            </Button>
            <Button onClick={handleCancel}>تایید لغو</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
