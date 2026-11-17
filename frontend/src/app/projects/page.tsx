'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { isManager } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { MoneyInput } from '@/components/ui/money-input';
import { JalaliDatePicker } from '@/components/ui/datepicker';
import { ContactModal } from '@/components/ContactModal';
import { CalendarCheck, CheckCircle2, Hourglass, XCircle, FolderCheck, Trash2, PhoneCall, Ban } from 'lucide-react';
import { formatJalaliDateTime, faNum } from '@/lib/jalali';
import { fmtMoney } from '@/lib/utils';

type Tab = 'all' | 'meetings' | 'completed' | 'rejected';
const fa = (n: any) => Number(n || 0).toLocaleString('fa-IR');

export default function ProjectsPage() {
  const manager = isManager();
  const [tab, setTab] = useState<Tab>('all');
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [approveLead, setApproveLead] = useState<any>(null);
  const [finalPrice, setFinalPrice] = useState('');
  const [cancelLead, setCancelLead] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [contactLeadId, setContactLeadId] = useState('');

  const load = () => {
    const params: any = { stage: 'projects' };
    if (!manager) params.scope = 'projects';
    api.get('/leads', { params }).then((r) => setLeads(r.data.leads || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, [manager]); // eslint-disable-line

  const inRange = (l: any) => {
    if (!dateRange.from && !dateRange.to) return true;
    const t = new Date(l.meetingAt || l.createdAt).getTime();
    if (dateRange.from && t < new Date(`${dateRange.from}T00:00:00`).getTime()) return false;
    if (dateRange.to && t > new Date(`${dateRange.to}T23:59:59`).getTime()) return false;
    return true;
  };
  const ranged = leads.filter(inRange);
  const filtered = ranged.filter((l) =>
    tab === 'all' ? true :
    tab === 'meetings' ? l.projectStage === 'PENDING_APPROVAL' :
    tab === 'completed' ? l.projectStage === 'COMPLETED' : l.projectStage === 'REJECTED');

  const counts = {
    all: ranged.length,
    meetings: ranged.filter((l) => l.projectStage === 'PENDING_APPROVAL').length,
    completed: ranged.filter((l) => l.projectStage === 'COMPLETED').length,
    rejected: ranged.filter((l) => l.projectStage === 'REJECTED').length,
  };

  const openApprove = (l: any) => { setApproveLead(l); setFinalPrice(l.finalPrice ? String(Number(l.finalPrice)) : (l.suggestedAmount ? String(Number(l.suggestedAmount)) : '')); };
  const doApprove = async () => {
    if (!approveLead) return;
    setBusyId(approveLead.id);
    try {
      const r = await api.patch(`/leads/${approveLead.id}/approve-project`, { finalPrice: finalPrice ? Number(finalPrice) : null });
      if (r.data.walletTransaction) alert(`پروژه تکمیل شد و کیف پول اپراتور ${fmtMoney(r.data.walletTransaction.amount)} شارژ شد.`);
      else alert('پروژه تکمیل شد.');
      setApproveLead(null); load();
    } catch (err: any) { alert(err.response?.data?.error || 'خطا'); }
    finally { setBusyId(''); }
  };
  const doReject = async (id: string) => {
    if (!confirm('رد پروژه؟ پروژه از حالت تعلیق خارج می‌شود و شارژی انجام نمی‌شود.')) return;
    setBusyId(id);
    try { await api.patch(`/leads/${id}/reject-project`); load(); }
    catch (err: any) { alert(err.response?.data?.error || 'خطا'); }
    finally { setBusyId(''); }
  };
  const doDelete = async (l: any) => {
    if (!confirm(`حذف کامل پروژه «${l.brandName}»؟ این مشتری/پروژه برای همیشه از همه لیست‌ها حذف می‌شود و قابل بازگشت نیست.`)) return;
    setBusyId(l.id);
    try { await api.delete(`/leads/${l.id}`); load(); }
    catch (err: any) { alert(err.response?.data?.error || 'خطا در حذف'); }
    finally { setBusyId(''); }
  };
  const doCancel = async () => {
    if (!cancelLead) return;
    setBusyId(cancelLead.id);
    try {
      await api.patch(`/leads/${cancelLead.id}/cancel-project`, { reason: cancelReason || null });
      setCancelLead(null); setCancelReason(''); load();
    } catch (err: any) { alert(err.response?.data?.error || 'خطا در کنسل‌کردن'); }
    finally { setBusyId(''); }
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'all', label: 'همه پروژه‌ها و جلسات', icon: FolderCheck },
    { key: 'meetings', label: 'جلسات (پروژه‌های تأییدشده — در تعلیق)', icon: Hourglass },
    { key: 'completed', label: 'پروژه‌های تکمیل‌شده', icon: CheckCircle2 },
    { key: 'rejected', label: 'ردشده‌ها', icon: XCircle },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2"><CalendarCheck className="h-6 w-6 text-brand-600" /> پروژه‌ها و جلسات</h1>
        <p className="page-subtitle">
          {manager
            ? 'جلسات در حالت «تعلیق — مرحله نهایی» می‌آیند؛ هنگام تأیید نهایی، «قیمت نهایی پروژه» را تعیین می‌کنید، پروژه تکمیل و کیف پول اپراتور شارژ می‌شود. حذف کامل پروژه هم از همین‌جا ممکن است.'
            : 'جلسه‌هایی که تنظیم کرده‌اید در حالت «تعلیق» می‌مانند تا مدیر تأیید نهایی بزند؛ بعد از تأیید، پروژه تکمیل‌شده می‌شود و کیف پول‌تان شارژ می‌شود. اگر لازم شد می‌توانید پروژه را کنسل کنید.'}
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs font-bold text-slate-500">از تاریخ جلسه<JalaliDatePicker value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className="mt-1" /></label>
        <label className="text-xs font-bold text-slate-500">تا تاریخ جلسه<JalaliDatePicker value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className="mt-1" /></label>
        {(dateRange.from || dateRange.to) && <Button variant="outline" onClick={() => setDateRange({ from: '', to: '' })}>حذف فیلتر تاریخ</Button>}
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => { const Icon = t.icon; const active = tab === t.key; return (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${active ? 'bg-gradient-to-l from-brand-500 to-teal-600 text-white shadow-glow' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>
            <Icon className="h-4 w-4" />{t.label}
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${active ? 'bg-white/25' : 'bg-slate-100 text-slate-500'}`}>{fa(counts[t.key])}</span>
          </button> ); })}
      </div>

      {loading ? <div className="py-14 text-center text-slate-500">در حال بارگذاری…</div>
      : filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((l) => (
            <ProjectCard key={l.id} l={l} manager={manager} busy={busyId === l.id}
              onApprove={() => openApprove(l)} onReject={() => doReject(l.id)} onDelete={() => doDelete(l)}
              onCancel={() => { setCancelLead(l); setCancelReason(''); }} onContact={() => setContactLeadId(l.id)} />
          ))}
        </div>
      ) : <Card className="py-14 text-center text-slate-400">در این فیلتر موردی وجود ندارد</Card>}

      {/* تأیید نهایی مدیر + قیمت نهایی */}
      <Modal open={!!approveLead} onClose={() => setApproveLead(null)} title="تأیید نهایی پروژه">
        {approveLead && (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-600">پروژه <b className="text-slate-900">«{approveLead.brandName}»</b> تکمیل می‌شود و کیف پول اپراتور بر اساس سطح لیگش شارژ خواهد شد.</p>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">قیمت نهایی پروژه (تومان) *</label>
              <MoneyInput value={finalPrice} onChange={setFinalPrice} placeholder="مثلاً 30,000,000" />
              <p className="mt-1 text-[11px] text-slate-400">مبلغ پیشنهادی اپراتور: {approveLead.suggestedAmount ? fmtMoney(approveLead.suggestedAmount) : '—'} — قیمت نهایی در درآمد حسابداری و فروش اپراتور محاسبه می‌شود و پورسانت تیم فروش از آن کسر خواهد شد.</p>
            </div>
            <div className="flex gap-3 pt-1">
              <Button onClick={doApprove} disabled={busyId === approveLead.id || !finalPrice} className="flex-1 py-3"><CheckCircle2 className="h-4 w-4" />{busyId === approveLead.id ? 'در حال ثبت…' : 'تأیید نهایی و تکمیل پروژه'}</Button>
              <Button variant="outline" onClick={() => setApproveLead(null)} className="py-3">انصراف</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* کنسلی پروژه توسط اپراتور */}
      <Modal open={!!cancelLead} onClose={() => setCancelLead(null)} title="کنسل‌کردن پروژه">
        {cancelLead && (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-600">پروژه <b className="text-slate-900">«{cancelLead.brandName}»</b> کنسل می‌شود و جلسه آن حذف خواهد شد. این کار قابل بازگشت نیست.</p>
            <textarea rows={3} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="دلیل کنسلی (اختیاری) — مثل: مشتری منصرف شد…" className="w-full" />
            <div className="flex gap-3">
              <Button variant="danger" onClick={doCancel} disabled={busyId === cancelLead.id} className="flex-1 py-3"><Ban className="h-4 w-4" />{busyId === cancelLead.id ? 'در حال ثبت…' : 'تأیید کنسلی'}</Button>
              <Button variant="outline" onClick={() => setCancelLead(null)} className="py-3">انصراف</Button>
            </div>
          </div>
        )}
      </Modal>

      <ContactModal open={!!contactLeadId} onClose={() => setContactLeadId('')} leadId={contactLeadId} onSuccess={load} />
    </div>
  );
}

function StageBadge({ stage }: { stage: string }) {
  if (stage === 'COMPLETED') return <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> تکمیل‌شده</Badge>;
  if (stage === 'PENDING_APPROVAL') return <Badge variant="warning"><Hourglass className="h-3 w-3" /> در تعلیق — مرحله نهایی</Badge>;
  if (stage === 'REJECTED') return <Badge variant="danger"><XCircle className="h-3 w-3" /> ردشده توسط مدیر</Badge>;
  return <Badge>بدون جلسه</Badge>;
}

function ProjectCard({ l, manager, busy, onApprove, onReject, onDelete, onCancel, onContact }: any) {
  return (
    <Card className="flex flex-col p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-black text-slate-900">{l.brandName}</p>
          <p className="text-xs text-slate-400">{l.personName} · {l.city || '—'} · {l.businessArea}</p>
        </div>
        <StageBadge stage={l.projectStage} />
      </div>
      <div className="space-y-1.5 text-sm text-slate-600">
        <p>🗓️ تایم جلسه: <b className="text-brand-700">{l.meetingAt ? formatJalaliDateTime(l.meetingAt) : '—'}</b></p>
        <p>📞 {l.phone}</p>
        {manager && <p>اپراتور: <b>{l.contactedBy ? `${l.contactedBy.firstName} ${l.contactedBy.lastName}` : (l.assignedTo ? `${l.assignedTo.firstName} ${l.assignedTo.lastName}` : '—')}</b></p>}
        {l.suggestedAmount && <p>مبلغ پیشنهادی: <b>{fmtMoney(l.suggestedAmount)}</b></p>}
        {l.finalPrice && <p>قیمت نهایی مدیر: <b className="text-slate-900">{fmtMoney(l.finalPrice)}</b></p>}
        {l.projectStage === 'COMPLETED' && l.completedAt && <p className="text-xs text-slate-400">تکمیل‌شده در: {formatJalaliDateTime(l.completedAt)}</p>}
        {l.contactNote && <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">{l.contactNote}</p>}
      </div>

      {manager && l.projectStage === 'PENDING_APPROVAL' && (
        <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
          <Button onClick={onApprove} disabled={busy} className="flex-1"><CheckCircle2 className="h-4 w-4" />تأیید نهایی</Button>
          <Button variant="outline" onClick={onReject} disabled={busy} className="text-rose-600 hover:bg-rose-50">رد</Button>
        </div>
      )}
      {manager && (
        <div className="mt-2 flex gap-2">
          <Button variant="ghost" onClick={onDelete} disabled={busy} className="flex-1 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /> حذف کامل پروژه</Button>
        </div>
      )}

      {!manager && l.projectStage === 'PENDING_APPROVAL' && (
        <>
          <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-center text-xs font-bold text-amber-700 ring-1 ring-amber-100">⏳ در انتظار تأیید نهایی مدیر…</p>
          <div className="mt-2 flex gap-2">
            <Button variant="outline" onClick={onCancel} disabled={busy} className="flex-1 text-rose-600 hover:bg-rose-50"><Ban className="h-4 w-4" /> کنسل‌کردن پروژه</Button>
          </div>
        </>
      )}
      {!manager && l.status === 'NEW' && (
        <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
          <Button onClick={onContact} className="flex-1"><PhoneCall className="h-4 w-4" /> تأیید (ثبت تماس و جلسه)</Button>
          <Button variant="outline" onClick={onCancel} className="text-rose-600 hover:bg-rose-50"><Ban className="h-4 w-4" /> کنسل</Button>
        </div>
      )}
      {!manager && l.projectStage === 'COMPLETED' && <p className="mt-4 rounded-xl bg-brand-50 px-3 py-2 text-center text-xs font-bold text-brand-700 ring-1 ring-brand-100">✅ تکمیل شده و به کیف پول‌تان اضافه شده است</p>}
    </Card>
  );
}
