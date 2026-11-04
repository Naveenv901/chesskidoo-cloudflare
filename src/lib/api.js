const BASE = '/api';

/**
 * Build a map of the newest attendance record for each student+date.
 * Used by the UI to decide which icon to show and whether homework should be visible.
 */
function buildLatestAttendanceMap(records) {
  const map = {};
  for (const rec of records) {
    const key = `${rec.student}_${rec.date}`;
    if (!map[key] || new Date(rec.createdAt) > new Date(map[key].createdAt)) {
      map[key] = rec;
    }
  }
  return map;
}

async function request(path, options = {}) {
  const token = localStorage.getItem('ck_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
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

  const json = await res.json();

  // ------- Attendance post‑processing -------
  if (path === '/api/attendance') {
    const records = json?.data ?? json;
    // Sort newest first – helps any UI that picks the first element.
    if (Array.isArray(records)) {
      records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    const latestMap = buildLatestAttendanceMap(records);
    // Return both the original payload and the computed map.
    return { ...json, latestAttendance: latestMap };
  }

  // ------- Homework post‑processing -------
  if (path === '/api/homework') {
    // Ensure we have the latest attendance map for filtering.
    const attResp = await request('/api/attendance', { method: 'GET' });
    const attRecords = attResp?.data ?? attResp;
    const latestMap = buildLatestAttendanceMap(attRecords);
    const hwRecords = json?.data ?? json;
    const filtered = Array.isArray(hwRecords)
      ? hwRecords.filter(hw => {
          const status = latestMap[`${hw.student}_${hw.date}`]?.status;
          return status === 'present';
        })
      : [];
    return { ...json, data: filtered };
  }

  return json;
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
