'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { isManager } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarCheck, CheckCircle2, Hourglass, XCircle, FolderCheck } from 'lucide-react';
import { formatJalaliDateTime } from '@/lib/jalali';

type Tab = 'all' | 'meetings' | 'completed' | 'rejected';
const fa = (n: any) => Number(n || 0).toLocaleString('fa-IR');

export default function ProjectsPage() {
  const manager = isManager();
  const [tab, setTab] = useState<Tab>('all');
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const load = () => {
    const params: any = { stage: 'projects' };
    if (!manager) params.scope = 'projects';
    api.get('/leads', { params }).then((r) => setLeads(r.data.leads || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, [manager]); // eslint-disable-line

  const filtered = leads.filter((l) =>
    tab === 'all' ? true :
    tab === 'meetings' ? l.projectStage === 'PENDING_APPROVAL' :
    tab === 'completed' ? l.projectStage === 'COMPLETED' : l.projectStage === 'REJECTED');

  const counts = {
    all: leads.length,
    meetings: leads.filter((l) => l.projectStage === 'PENDING_APPROVAL').length,
    completed: leads.filter((l) => l.projectStage === 'COMPLETED').length,
    rejected: leads.filter((l) => l.projectStage === 'REJECTED').length,
  };

  const act = async (id: string, kind: 'approve' | 'reject') => {
    if (kind === 'approve' && !confirm('تأیید نهایی پروژه؟ بعد از تأیید، پروژه «تکمیل‌شده» می‌شود و کیف پول اپراتور بر اساس سطح لیگش شارژ می‌شود.')) return;
    if (kind === 'reject' && !confirm('رد پروژه؟ پروژه از حالت تعلیق خارج می‌شود و شارژی انجام نمی‌شود.')) return;
    setBusyId(id);
    try {
      const r = await api.patch(`/leads/${id}/${kind === 'approve' ? 'approve-project' : 'reject-project'}`);
      if (kind === 'approve' && r.data.walletTransaction) alert(`پروژه تکمیل شد و کیف پول اپراتور ${fa(r.data.walletTransaction.amount)} تومان شارژ شد.`);
      load();
    } catch (err: any) { alert(err.response?.data?.error || 'خطا'); }
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
            ? 'جلساتی که اپراتورها برای مشتری‌های تأییدشده تنظیم کرده‌اند در حالت «تعلیق — مرحله نهایی» می‌آیند؛ با تأیید شما پروژه تکمیل می‌شود و کیف پول اپراتور شارژ می‌شود.'
            : 'جلسه‌هایی که تنظیم کرده‌اید در حالت «تعلیق» می‌مانند تا مدیر تأیید نهایی بزند؛ بعد از تأیید، پروژه جزو تکمیل‌شده‌ها می‌شود و کیف پول‌تان شارژ می‌شود.'}
        </p>
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
          {filtered.map((l) => <ProjectCard key={l.id} l={l} manager={manager} busy={busyId === l.id} onAct={act} />)}
        </div>
      ) : <Card className="py-14 text-center text-slate-400">در این فیلتر موردی وجود ندارد</Card>}
    </div>
  );
}

function StageBadge({ stage }: { stage: string }) {
  if (stage === 'COMPLETED') return <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> تکمیل‌شده</Badge>;
  if (stage === 'PENDING_APPROVAL') return <Badge variant="warning"><Hourglass className="h-3 w-3" /> در تعلیق — مرحله نهایی (در انتظار تأیید مدیر)</Badge>;
  if (stage === 'REJECTED') return <Badge variant="danger"><XCircle className="h-3 w-3" /> ردشده توسط مدیر</Badge>;
  return <Badge>بدون جلسه</Badge>;
}

function ProjectCard({ l, manager, busy, onAct }: any) {
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
        {l.suggestedAmount && <p>مبلغ پروژه: <b>{fa(l.suggestedAmount)} تومان</b></p>}
        {l.projectStage === 'COMPLETED' && l.completedAt && <p className="text-xs text-slate-400">تکمیل‌شده در: {formatJalaliDateTime(l.completedAt)}</p>}
        {l.contactNote && <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">{l.contactNote}</p>}
      </div>
      {manager && l.projectStage === 'PENDING_APPROVAL' && (
        <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
          <Button onClick={() => onAct(l.id, 'approve')} disabled={busy} className="flex-1"><CheckCircle2 className="h-4 w-4" />{busy ? 'در حال ثبت…' : 'تأیید نهایی پروژه'}</Button>
          <Button variant="outline" onClick={() => onAct(l.id, 'reject')} disabled={busy} className="text-rose-600 hover:bg-rose-50">رد</Button>
        </div>
      )}
      {!manager && l.projectStage === 'COMPLETED' && <p className="mt-4 rounded-xl bg-brand-50 px-3 py-2 text-center text-xs font-bold text-brand-700 ring-1 ring-brand-100">✅ این پروژه تکمیل شده و مبلغ آن به کیف پول‌تان اضافه شده است</p>}
      {!manager && l.projectStage === 'PENDING_APPROVAL' && <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-center text-xs font-bold text-amber-700 ring-1 ring-amber-100">⏳ در انتظار تأیید نهایی مدیر…</p>}
    </Card>
  );
}
