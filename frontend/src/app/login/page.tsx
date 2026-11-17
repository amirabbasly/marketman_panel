'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { setToken, setUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, ShieldCheck, Headset, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'MANAGER' | 'OPERATOR'>('MANAGER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password, role });
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      router.replace(user.role === 'MANAGER' ? '/dashboard' : '/my-leads');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error || 'خطا در ورود به سیستم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4 py-10"
      style={{ backgroundImage: 'radial-gradient(50rem 26rem at 85% -10%, rgb(16 185 129/.22), transparent 60%), radial-gradient(40rem 22rem at 0% 110%, rgb(13 148 136/.16), transparent 55%)' }}>
      <div className="w-full max-w-[420px] animate-slide-up">
        {/* لوگو و عنوان — فقط برند + فرم ورود */}
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo.png" alt="لوگوی مارکت‌من" width={72} height={72} className="rounded-[20px] shadow-glow ring-1 ring-white/25" priority />
          <h1 className="mt-4 text-2xl font-black text-white">مارکت‌من</h1>
          <p className="mt-1 text-sm text-slate-400">ورود به پنل CRM</p>
        </div>

        <form onSubmit={handleLogin} className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
          {/* انتخاب نقش */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1" role="tablist" aria-label="انتخاب نقش">
            {([
              { key: 'MANAGER', label: 'مدیر', icon: ShieldCheck },
              { key: 'OPERATOR', label: 'اپراتور', icon: Headset },
            ] as const).map((t) => {
              const Icon = t.icon;
              const active = role === t.key;
              return (
                <button key={t.key} type="button" role="tab" aria-selected={active} onClick={() => { setRole(t.key); setError(''); }}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all ${active ? 'bg-white text-brand-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                  <Icon className="h-4 w-4" />{t.label}
                </button>
              );
            })}
          </div>

          {error && <div className="mb-4 animate-fade-in rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200">{error}</div>}

          <div className="space-y-4">
            <div>
              <label htmlFor="identifier" className="mb-1.5 block text-sm font-bold text-slate-700">
                {role === 'MANAGER' ? 'ایمیل' : 'شماره تماس'}
              </label>
              <Input id="identifier" autoComplete="username" placeholder={role === 'MANAGER' ? 'admin@marketman.ir' : '09123456789'}
                value={email} onChange={(e) => setEmail(e.target.value)} leftIcon={<Mail className="h-4 w-4" />} required />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-slate-700">رمز عبور</label>
              <div className="relative">
                <Input id="password" autoComplete="current-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} leftIcon={<Lock className="h-4 w-4" />} className="pl-11" required />
                <button type="button" onClick={() => setShowPassword((p) => !p)} aria-label={showPassword ? 'پنهان کردن رمز' : 'نمایش رمز'}
                  className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full py-3 text-[15px]" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> در حال ورود…</> : 'ورود به پنل'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
