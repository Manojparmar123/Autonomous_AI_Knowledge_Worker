'use client';

export interface AuthData {
  token: string;
  role?: string;
}

export function saveAuth(data: AuthData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ai_token', data.token);
  if (data.role) localStorage.setItem('ai_role', data.role);
}

export function getAuth(): AuthData | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('ai_token');
  const role = localStorage.getItem('ai_role');
  if (!token) return null;
  return { token, role: role || undefined };
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('ai_token');
  localStorage.removeItem('ai_role');
}
