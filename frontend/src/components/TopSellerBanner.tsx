'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';

export default function TopSellerBanner() {
  const [top, setTop] = useState<any>(null);
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== 'OPERATOR') return;
    api.get('/league').then((r) => { setTop(r.data.topOfWeek); setMe(r.data.me); }).catch(() => {});
  }, []);

  if (!top) return null;
  const isMe = me && me.operatorId === top.operatorId;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 overflow-hidden rounded-3xl bg-gradient-to-l from-amber-400 via-yellow-500 to-amber-500 px-5 py-4 text-white shadow-lg shadow-amber-500/25">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/25"><Trophy className="h-6 w-6" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-white/85">کارشناس فروش برتر هفته</p>
        <p className="truncate text-base font-black sm:text-lg">
          {top.name} — {Number(top.weekSales).toLocaleString('fa-IR')} فروش این هفته 🏆
          {isMe && <span className="mr-2 rounded-full bg-white/25 px-2 py-0.5 text-[11px]">این شما هستید!</span>}
        </p>
      </div>
      {me && (
        <div className="text-left">
          <p className="text-[11px] text-white/85">سطح فعلی شما</p>
          <p className="text-sm font-black">سطح {Number(me.level).toLocaleString('fa-IR')} · {me.levelName}</p>
        </div>
      )}
      <Link href="/league" className="rounded-xl bg-white/20 px-3 py-2 text-xs font-bold transition hover:bg-white/30">مشاهده لیگ</Link>
    </div>
  );
}
