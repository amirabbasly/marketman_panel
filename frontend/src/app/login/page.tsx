'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { setToken, setUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, Lock, ShieldCheck, User as UserIcon } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'MANAGER' | 'OPERATOR'>('MANAGER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <div className="px-8 py-6">
          <div className="flex justify-center mb-6">
            <span className="text-2xl font-bold text-emerald-700">بازاریمن</span>
          </div>
          <h2 className="text-center text-xl font-bold text-gray-900 mb-2">ورود به پنل CRM</h2>
          <p className="text-center text-sm text-gray-600 mb-8">
            وارد شدن به عنوان {role === 'MANAGER' ? 'مدیر' : 'اپراتور'}
          </p>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setRole('MANAGER')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                role === 'MANAGER'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 mr-1" />
              مدیر
            </button>
            <button
              onClick={() => setRole('OPERATOR')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                role === 'OPERATOR'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <UserIcon className="w-4 h-4 mr-1" />
              اپراتور
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ایمیل یا شماره تماس
              </label>
              <Input
                placeholder="admin@marketman.ir"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رمز عبور
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
              />
            </div>
            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? 'در حال ورود...' : 'ورود به سیستم'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            حساب مدیر پیش‌فرض: admin@marketman.ir / 12345678
          </p>
        </div>
      </Card>
    </div>
  );
}
