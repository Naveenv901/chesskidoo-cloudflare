const BASE = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('ck_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers
  });

  if (res.status === 401) {
    localStorage.removeItem('ck_token');
    localStorage.removeItem('ck_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let error = text || res.statusText;
    try { error = JSON.parse(text).error || error; } catch {}
    throw new Error(error);
  }

  return res.json();
}

export function get(path) {
  return request(path, { method: 'GET' });
}

export function post(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body || {}) });
}

export function put(path, body) {
  return request(path, { method: 'PUT', body: JSON.stringify(body || {}) });
}

export function del(path) {
  return request(path, { method: 'DELETE' });
}

export function patch(path, body) {
  return request(path, { method: 'PATCH', body: JSON.stringify(body || {}) });
}

export function setToken(token, user) {
  if (token) localStorage.setItem('ck_token', token);
  else localStorage.removeItem('ck_token');

  if (user) localStorage.setItem('ck_user', JSON.stringify(user));
  else localStorage.removeItem('ck_user');
}

export function getUser() {
  const raw = localStorage.getItem('ck_user');
  return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
  localStorage.removeItem('ck_token');
  localStorage.removeItem('ck_user');
}
