import { apiPost, apiGet, setToken, getUser as getStoredUser, clearSession } from '@lib/api.js';

export async function signIn(email, password) {
  const data = await apiPost('/auth/login', { email, password });

  if (!data.success) {
    throw new Error(data.error || 'Incorrect email or password.');
  }

  setToken(data.token, { email: data.user, role: data.role, userid: data.userid });
  return { user: { email: data.user, id: data.userid }, profile: { role: data.role, email: data.user, userid: data.userid } };
}

export async function signOut() {
  try {
    await apiPost('/auth/logout');
  } catch {
    // ignore logout errors
  }
  clearSession();
}

export async function requireAuth() {
  const user = getStoredUser();
  if (!user) return null;

  try {
    const data = await apiGet('/auth/me');
    return data.user;
  } catch {
    clearSession();
    return null;
  }
}

export async function requireRole(role) {
  const profile = await requireAuth();
  if (!profile) {
    window.location.href = '/login';
    return null;
  }
  if (profile.role !== role) {
    alert('Access denied.');
    window.location.href = '/';
    return null;
  }
  return profile;
}
