export function setToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem('mm_token', token);
}
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('mm_token');
}
export function setUser(user: unknown) {
  if (typeof window !== 'undefined') localStorage.setItem('mm_user', JSON.stringify(user));
}
export function getUser(): any {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('mm_user');
  return raw ? JSON.parse(raw) : null;
}
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mm_token');
    localStorage.removeItem('mm_user');
    window.location.href = '/login';
  }
}
export function isManager(): boolean {
  const u = getUser();
  return u?.role === 'MANAGER';
}
export function isOperator(): boolean {
  const u = getUser();
  return u?.role === 'OPERATOR';
}
